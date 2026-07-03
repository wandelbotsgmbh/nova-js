import {
  type ConnectionOptions,
  type Msg,
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

type NatsMessageHandler<K extends NatsSubscribeSubject> = (
  payload: NatsSubscribePayloads[K],
  msg: Msg,
) => void | Promise<void>

type SubscribeArgs<K extends NatsSubscribeSubject> =
  keyof NatsOperationParams[K] extends never
    ? [handler: NatsMessageHandler<K>]
    : [params: NatsOperationParams[K], handler: NatsMessageHandler<K>]

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
   * Returns a function that unsubscribes when called.
   */
  async subscribe<K extends NatsSubscribeSubject>(
    subject: K,
    ...args: SubscribeArgs<K>
  ): Promise<() => void> {
    const [params, handler] =
      args.length === 1
        ? ([{}, args[0]] as const)
        : ([args[0], args[1]] as const)

    const nc = await this.connect()
    const resolvedSubject = buildSubject(subject, params)
    const sub = nc.subscribe(resolvedSubject)

    ;(async () => {
      for await (const msg of sub) {
        // Handled per-message: a bad payload or a throwing/rejecting handler
        // should not stop the subscription from processing later messages.
        try {
          await handler(msg.json<NatsSubscribePayloads[K]>(), msg)
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
