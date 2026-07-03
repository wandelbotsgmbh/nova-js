/**
 * Experimental typed NATS client for the Wandelbots NOVA messaging API,
 * generated from src/asyncapi.yaml (see scripts/generate-nats-client.ts).
 *
 * This API is experimental and may change without a major version bump.
 */
export { buildNatsServerUrl } from "../../lib/experimental/nats/buildNatsServerUrl.ts"
export type {
  NatsOperationParams,
  NatsPublishPayloads,
  NatsPublishSubject,
  NatsReplyPayloads,
  NatsRequestPayloads,
  NatsRequestSubject,
  NatsSubscribePayloads,
  NatsSubscribeSubject,
} from "../../lib/experimental/nats/generated/operations.ts"
// Message payload types for every schema in src/asyncapi.yaml, e.g. `Cell`,
// `App`, `ProgramStatus` (see NatsSubscribePayloads/NatsRequestPayloads for
// which type applies to which subject).
export type * from "../../lib/experimental/nats/generated/types.ts"
export { NovaNatsClient } from "../../lib/experimental/nats/NovaNatsClient.ts"
export type { NovaNatsClientConfig } from "../../lib/experimental/nats/NovaNatsClient.ts"
