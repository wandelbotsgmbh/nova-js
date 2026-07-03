import {
  type ConnectionOptions,
  type Msg,
  type NatsConnection,
  wsconnect,
} from "@nats-io/nats-core"
import { buildSubject } from "./buildSubject.ts"
import type {
  NatsOperationParams,
  NatsReplyPayloads,
  NatsRequestPayloads,
  NatsRequestSubject,
  NatsSubscribePayloads,
  NatsSubscribeSubject,
} from "./generated/operations.ts"

export type NovaNatsClientConfig = ConnectionOptions

/**
 * Typed NATS client for the Wandelbots NOVA messaging API, generated from
 * src/asyncapi.yaml (see scripts/generate-nats-client.ts).
 *
 * Connects over WebSocket via `@nats-io/nats-core`'s `wsconnect`.
 */
export class NovaNatsClient {
  readonly config: NovaNatsClientConfig
  private connectionPromise: Promise<NatsConnection> | null = null

  constructor(config: NovaNatsClientConfig) {
    this.config = config
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
   * Returns a function that unsubscribes when called.
   */
  async subscribe<K extends NatsSubscribeSubject>(
    subject: K,
    params: NatsOperationParams[K],
    handler: (payload: NatsSubscribePayloads[K], msg: Msg) => void,
  ): Promise<() => void> {
    const nc = await this.connect()
    const resolvedSubject = buildSubject(subject, params)
    const sub = nc.subscribe(resolvedSubject)

    ;(async () => {
      for await (const msg of sub) {
        handler(msg.json<NatsSubscribePayloads[K]>(), msg)
      }
    })().catch((err: unknown) => {
      console.error(
        `Error handling NATS subscription for "${resolvedSubject}"`,
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
}
