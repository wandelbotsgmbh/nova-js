import { parseNovaInstanceUrl } from "../../converters.ts"

/**
 * Builds the WebSocket URL for a NOVA instance's NATS gateway from its
 * instance URL, e.g. `https://foo.instance.wandelbots.io` becomes
 * `wss://foo.instance.wandelbots.io/api/nats`.
 *
 * Pass the result as `servers` in the `NovaNatsClientConfig` passed to
 * `NovaNatsClient`.
 */
export function buildNatsServerUrl(instanceUrl: string): string {
  const url = parseNovaInstanceUrl(instanceUrl)
  const protocol = url.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${url.host}/api/nats`
}
