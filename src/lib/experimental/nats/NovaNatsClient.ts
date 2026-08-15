import { DeliverPolicy, jetstream, jetstreamManager } from "@nats-io/jetstream"
import {
  type ConnectionOptions,
  type MsgHdrs,
  type NatsConnection,
  wsconnect,
} from "@nats-io/nats-core"
import type { Nova } from "../../Nova.ts"
import { buildNatsServerUrl } from "./buildNatsServerUrl.ts"
import { buildSubject } from "./buildSubject.ts"
import type {
  NatsOperationParams,
  NatsPublishPayloads,
  NatsPublishSubject,
  NatsReplyPayloads,
  NatsRequestPayloads,
  NatsRequestSubject,
  NatsSubscribePayloads,
  NatsSubscribeSubject,
} from "./generated/operations.ts"

export type NovaNatsClientConfig = ConnectionOptions

/**
 * The fields of a received message that exist on both a core NATS `Msg` and
 * a JetStream `JsMsg` — a subscription delivers the former by default and
 * the latter with `lastMessage: true` (see {@link NatsSubscribeOptions}),
 * so handlers see only what both have in common.
 */
export interface NatsReceivedMsg {
  /** The concrete subject the message was published to. */
  subject: string
  /** The message's raw payload bytes. */
  data: Uint8Array
  /** Headers set by the server or the publisher, if any. */
  headers?: MsgHdrs
  /** The payload decoded as JSON. */
  json<T>(): T
  /** The payload decoded as a string. */
  string(): string
}

/**
 * A received message, annotated with the values of the subject template's
 * `{param}` placeholders as extracted from the message's concrete subject.
 * With a wildcard subscription (e.g. `{ cell: "*" }`), `subjectParams` is how
 * a handler knows which entity a message belongs to. Typed per subject via
 * the generated `NatsOperationParams`.
 */
export type NatsSubscribeMsg<K extends NatsSubscribeSubject> =
  NatsReceivedMsg & {
    subjectParams: NatsOperationParams[K]
  }

export type NatsSubscribeOptions = {
  /**
   * When true, the subscription immediately replays the last JetStream
   * message persisted for each subject matching the subscription (one per
   * concrete subject when subscribing with wildcards), then continues with
   * live messages. Requires the server to have a JetStream stream capturing
   * the subscribed subject; subscribing fails with an error if none exists.
   */
  lastMessage?: boolean
}

type NatsMessageHandler<K extends NatsSubscribeSubject> = (
  payload: NatsSubscribePayloads[K],
  msg: NatsSubscribeMsg<K>,
) => void | Promise<void>

type SubscribeArgs<K extends NatsSubscribeSubject> =
  keyof NatsOperationParams[K] extends never
    ? [handler: NatsMessageHandler<K>, options?: NatsSubscribeOptions]
    : [
        params: NatsOperationParams[K],
        handler: NatsMessageHandler<K>,
        options?: NatsSubscribeOptions,
      ]

/**
 * Typed NATS client for the Wandelbots NOVA messaging API, generated from
 * src/asyncapi.yaml (see scripts/generate-nats-client.ts).
 *
 * Connects over WebSocket via `@nats-io/nats-core`'s `wsconnect`.
 */
export class NovaNatsClient {
  readonly config: NovaNatsClientConfig
  private connectionPromise: Promise<NatsConnection> | null = null

  constructor(nova: Nova, config: NovaNatsClientConfig = {}) {
    this.config = {
      servers: buildNatsServerUrl(nova.instanceUrl.href),
      // Reuse the Nova instance's access token for NATS auth, if it has one
      // (e.g. from login or a passed-in config.accessToken). Explicit auth
      // options in `config` (token/user/pass/authenticator) still win.
      ...(nova.accessToken ? { token: nova.accessToken } : {}),
      ...config,
    }
  }

  /**
   * Connects to NATS if not already connected or connecting, and returns the
   * connection. Safe to call concurrently: all callers share the same
   * in-flight connection attempt instead of each starting their own.
   */
  connect(): Promise<NatsConnection> {
    if (!this.connectionPromise) {
      this.connectionPromise = wsconnect(this.config).catch((err: unknown) => {
        // Allow a subsequent connect() call to retry after a failed attempt.
        this.connectionPromise = null
        throw err
      })
    }
    return this.connectionPromise
  }

  /** Closes the underlying NATS connection, if open or connecting. */
  async close(): Promise<void> {
    const connectionPromise = this.connectionPromise
    this.connectionPromise = null
    if (!connectionPromise) return
    try {
      const nc = await connectionPromise
      await nc.close()
    } catch {
      // Connection never succeeded; nothing to close.
    }
  }

  /**
   * Subscribes to a NATS subject published by the server, invoking `handler`
   * with the JSON-decoded payload of every message received.
   *
   * `subject` is the subject template as it appears on the wire, e.g.
   * `"nova.v2.cells.{cell}"`, with `{param}` placeholders filled in from
   * `params`.
   *
   * Errors decoding a message or thrown/rejected by `handler` are caught and
   * logged per-message, so one bad message doesn't stop later messages on
   * the same subscription from being handled.
   *
   * Each message is annotated with `msg.subjectParams` — the template's
   * `{param}` values extracted from the message's concrete subject — so a
   * wildcard subscriber knows which entity a message belongs to:
   *
   *     nats.subscribe("nova.v2.cells.{cell}.status", { cell: "*" },
   *       (services, msg) => console.log(msg.subjectParams.cell, services))
   *
   * With `{ lastMessage: true }` as the final argument, the last JetStream
   * message persisted for each matching subject is replayed to the handler
   * immediately, before live messages (see {@link NatsSubscribeOptions}).
   *
   * Returns a function that unsubscribes when called.
   */
  async subscribe<K extends NatsSubscribeSubject>(
    subject: K,
    ...args: SubscribeArgs<K>
  ): Promise<() => void> {
    const [params, handler, options] =
      typeof args[0] === "function"
        ? ([{}, args[0], args[1] as NatsSubscribeOptions | undefined] as const)
        : ([args[0], args[1] as NatsMessageHandler<K>, args[2]] as const)

    const nc = await this.connect()
    const resolvedSubject = buildSubject(subject, params)

    // The token positions of the template's {param} placeholders, computed
    // once here so each message's subjectParams is a plain index pick: a
    // delivered message always matches the subscribed pattern token for
    // token, so its params sit at the same positions as in the template.
    const paramPositions: [name: string, index: number][] = []
    for (const [index, token] of subject.split(".").entries()) {
      if (token.startsWith("{") && token.endsWith("}")) {
        paramPositions.push([token.slice(1, -1), index])
      }
    }

    const dispatch = (messages: AsyncIterable<NatsReceivedMsg>) => {
      ;(async () => {
        for await (const msg of messages) {
          // Handled per-message: a bad payload or a throwing/rejecting
          // handler should not stop the subscription from processing later
          // messages.
          try {
            const subjectTokens = msg.subject.split(".")
            const subjectParams = Object.fromEntries(
              paramPositions.map(([name, index]) => [
                name,
                subjectTokens[index] ?? "",
              ]),
            ) as NatsOperationParams[K]
            await handler(
              msg.json<NatsSubscribePayloads[K]>(),
              Object.assign(msg, { subjectParams }),
            )
          } catch (err) {
            console.error(
              `Error handling NATS message on subject "${resolvedSubject}"`,
              err,
            )
          }
        }
      })().catch((err: unknown) => {
        console.error(
          `NATS subscription iterator failed for "${resolvedSubject}"`,
          err,
        )
      })
    }

    if (options?.lastMessage) {
      // Delivered through JetStream instead of a core subscription: an
      // ordered (ephemeral, auto-acked, auto-cleaned-up) consumer with
      // "last per subject" delivery replays the last persisted message of
      // each matching subject, then seamlessly continues with live messages.
      const jsm = await jetstreamManager(nc)
      // Throws if no stream captures the subject, rather than silently
      // never delivering anything.
      const streamName = await jsm.streams.find(resolvedSubject)
      const consumer = await jetstream(nc).consumers.get(streamName, {
        filter_subjects: [resolvedSubject],
        deliver_policy: DeliverPolicy.LastPerSubject,
      })
      const messages = await consumer.consume()
      dispatch(messages)
      return () => void messages.close()
    }

    const sub = nc.subscribe(resolvedSubject)
    dispatch(sub)
    return () => sub.unsubscribe()
  }

  /**
   * Sends a request payload for a NATS subject the server receives, and
   * waits for the JSON-decoded reply.
   *
   * `subject` is the subject template as it appears on the wire, e.g.
   * `"nova.v2.cells.{cell}.bus-ios.ios.set"`, with `{param}` placeholders
   * filled in from `params`.
   */
  async request<K extends NatsRequestSubject>(
    subject: K,
    params: NatsOperationParams[K],
    payload: NatsRequestPayloads[K],
    opts: { timeout?: number } = {},
  ): Promise<NatsReplyPayloads[K]> {
    const nc = await this.connect()
    const resolvedSubject = buildSubject(subject, params)
    const msg = await nc.request(resolvedSubject, JSON.stringify(payload), {
      timeout: opts.timeout ?? 5000,
    })
    return msg.json<NatsReplyPayloads[K]>()
  }

  /**
   * Publishes a JSON payload to any NATS subject defined in the spec,
   * without waiting for a reply.
   *
   * `subject` is the subject template as it appears on the wire, e.g.
   * `"nova.v2.cells.{cell}.bus-ios.ios.set"`, with `{param}` placeholders
   * filled in from `params`.
   */
  async publish<K extends NatsPublishSubject>(
    subject: K,
    params: NatsOperationParams[K],
    payload: NatsPublishPayloads[K],
  ): Promise<void> {
    const nc = await this.connect()
    const resolvedSubject = buildSubject(subject, params)
    nc.publish(resolvedSubject, JSON.stringify(payload))
  }
}
