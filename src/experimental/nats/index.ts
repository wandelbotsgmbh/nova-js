/**
 * Experimental typed NATS client for the Wandelbots NOVA messaging API,
 * generated from src/asyncapi.yaml (see scripts/generate-nats-client.ts).
 *
 * This API is experimental and may change without a major version bump.
 */
export type {
  NatsOperationParams,
  NatsReplyPayloads,
  NatsRequestPayloads,
  NatsRequestSubject,
  NatsSubscribePayloads,
  NatsSubscribeSubject,
} from "../../lib/experimental/nats/generated/operations.ts"
export { NovaNatsClient } from "../../lib/experimental/nats/NovaNatsClient.ts"
export type { NovaNatsClientConfig } from "../../lib/experimental/nats/NovaNatsClient.ts"
