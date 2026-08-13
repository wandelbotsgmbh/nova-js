import { DeliverPolicy, jetstream, type JsMsg } from "@nats-io/jetstream"
import {
  type ConnectionOptions,
  type Msg,
  type NatsConnection,
  wsconnect,
} from "@nats-io/nats-core"
import type { Nova } from "../../Nova.ts"
import { buildNatsServerUrl } from "./buildNatsServerUrl.ts"
import { buildSubject } from "./buildSubject.ts"
import {
  type NatsOperationParams,
  type NatsPersistedSubject,
  type NatsPublishPayloads,
  type NatsPublishSubject,
  type NatsReplyPayloads,
  type NatsRequestPayloads,
  type NatsRequestSubject,
  natsStreamBySubject,
  type NatsSubscribePayloads,
  type NatsSubscribeSubject,
} from "./generated/operations.ts"

export type NovaNatsClientConfig = ConnectionOptions

/**
 * A received message, annotated with the values of the subject template's
 * `{param}` placeholders as extracted from the message's concrete subject.
 * With a wildcard subscription (e.g. `{ cell: "*" }`), `subjectParams` is how
 * a handler knows which entity a message belongs to. Typed per subject via
 * the generated `NatsOperationParams`.
 */
export type NatsSubscribeMsg<K extends NatsSubscribeSubject> = (Msg | JsMsg) & {
  subjectParams: NatsOperationParams[K]
}

type NatsMessageHandler<K extends NatsSubscribeSubject> = (
  payload: NatsSubscribePayloads[K],
  msg: NatsSubscribeMsg<K>,
) => void | Promise<void>

/**
 * Extra options for {@link NovaNatsClient.subscribe}. `replayLast` is only
 * offered on subjects the spec marks as retaining their latest message, so
 * asking for a replay that could never arrive is a compile error.
 */
export type NatsSubscribeOptions<K extends NatsSubscribeSubject> =
  K extends NatsPersistedSubject
    ? {
        /**
         * Deliver the subject's current value immediately on subscribe,
         * before any subsequent updates. With a wildcard subscription (e.g.
         * `{ cell: "*" }`) the current value of every matching subject is
         * delivered, not just one.
         */
        replayLast?: boolean
        /**
         * Called once every retained message has been passed to the handler,
         * i.e. when the handler has seen the subject's current state and
         * everything after it is a live update. Fires exactly once, and also
         * when there is nothing retained at all (an empty wildcard, e.g. no
         * apps installed) — where waiting for a first message would hang
         * forever. Only meaningful together with `replayLast`; without it
         * there is no retained state to wait for.
         */
        onReplayComplete?: () => void
      }
    : // Not `Record<never, never>`: that behaves like `{}` and so accepts any
      // object, letting `replayLast` through unchecked. Typing the property as
      // `never` is what makes passing it an error.
      { replayLast?: never; onReplayComplete?: never }

type SubscribeArgs<K extends NatsSubscribeSubject> =
  keyof NatsOperationParams[K] extends never
    ? [handler: NatsMessageHandler<K>, opts?: NatsSubscribeOptions<K>]
    : [
        params: NatsOperationParams[K],
        handler: NatsMessageHandler<K>,
        opts?: NatsSubscribeOptions<K>,
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
   * On subjects that retain their latest message, pass `{ replayLast: true }`
   * to receive the current value immediately instead of waiting for the next
   * update — useful for a subscriber that starts after the last change:
   *
   *     nats.subscribe("nova.v2.system.status", onStatus, { replayLast: true })
   *
   * Returns a function that unsubscribes when called.
   */
  async subscribe<K extends NatsSubscribeSubject>(
    subject: K,
    ...args: SubscribeArgs<K>
  ): Promise<() => void> {
    // `params` is omitted for subjects with no {param} placeholders, so the
    // handler is the first argument in that case.
    const hasParams = typeof args[0] !== "function"
    const params = (hasParams ? args[0] : {}) as NatsOperationParams[K]
    const handler = (hasParams ? args[1] : args[0]) as NatsMessageHandler<K>
    const opts = (hasParams ? args[2] : args[1]) as
      | { replayLast?: boolean; onReplayComplete?: () => void }
      | undefined

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

    const deliver = async (msg: Msg | JsMsg) => {
      // Handled per-message: a bad payload or a throwing/rejecting handler
      // should not stop the subscription from processing later messages.
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

    const deliverAll = (
      messages: AsyncIterable<Msg | JsMsg>,
      afterDeliver?: (msg: Msg | JsMsg) => void,
    ) => {
      ;(async () => {
        for await (const msg of messages) {
          await deliver(msg)
          afterDeliver?.(msg)
        }
      })().catch((err: unknown) => {
        console.error(
          `NATS subscription iterator failed for "${resolvedSubject}"`,
          err,
        )
      })
    }

    if (opts?.replayLast) {
      // Delivered by JetStream rather than core NATS: an ordered consumer
      // starting at `last_per_subject` yields each matching subject's retained
      // message and then continues with live ones on the same iterator, so
      // there is no gap — and no possible duplicate — between the replayed
      // value and the updates that follow it. Ordered consumers are ephemeral
      // and need no acking, so stopping the iterator is the whole teardown.
      const js = jetstream(nc)
      // Typed as always present, but only because `replayLast` is a compile
      // error off the persisted subjects; a JavaScript caller can still get
      // here with a subject that has no marker.
      const expectedStream = natsStreamBySubject[
        subject as NatsPersistedSubject
      ] as string | undefined

      if (expectedStream === undefined) {
        throw new Error(
          `Cannot replay "${resolvedSubject}": the API spec does not mark it as retaining its latest message, so there is no stored value to replay. Subscribe without replayLast to receive live messages over core NATS.`,
        )
      }

      // The spec's x-nats-jetstream-stream markers say which stream retains a
      // subject, but a deployed instance can disagree, and JetStream creates a
      // consumer whose filter matches none of the stream's subjects without
      // complaint — it simply never delivers anything. Checking up front turns
      // that permanent silence into an error at subscribe time.
      const carryingStream = await js
        .jetstreamManager()
        .then((jsm) => jsm.streams.find(resolvedSubject))
        .catch(() => undefined)

      if (carryingStream !== expectedStream) {
        throw new Error(
          `Cannot replay "${resolvedSubject}": the API spec marks it as retained in the "${expectedStream}" JetStream stream, but on this instance it is ` +
            (carryingStream === undefined
              ? `carried by no stream at all`
              : `carried by "${carryingStream}"`) +
            `. A consumer on "${expectedStream}" would never deliver it. Subscribe without replayLast to receive live messages over core NATS.`,
        )
      }

      const consumer = await js.consumers.get(expectedStream, {
        filter_subjects: [resolvedSubject],
        deliver_policy: DeliverPolicy.LastPerSubject,
      })

      // How many retained messages this consumer will replay before it is
      // caught up. Read before consuming, because a subject with nothing
      // retained never delivers a message to end the replay on, and a caller
      // waiting for one would wait forever.
      const { num_pending } = await consumer.info()

      let replayComplete = false
      const completeReplay = () => {
        if (replayComplete) return
        replayComplete = true
        opts.onReplayComplete?.()
      }

      const messages = await consumer.consume()
      // A JsMsg's `info.pending` counts what is still queued behind it, so
      // the first message to report 0 is the last of the replay. Live
      // messages report 0 too, which is why this only fires once.
      deliverAll(messages, (msg) => {
        if ("info" in msg && msg.info.pending === 0) completeReplay()
      })
      if (num_pending === 0) completeReplay()

      return () => {
        messages.stop()
      }
    }

    const sub = nc.subscribe(resolvedSubject)
    deliverAll(sub)
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
