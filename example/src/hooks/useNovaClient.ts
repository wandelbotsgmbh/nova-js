import { env } from "@/runtimeEnv.ts"
import { Nova } from "@wandelbots/nova-js/v2"

let nova: Nova | null = null

function getNovaApiGatewayUrl() {
  if (env.NODE_ENV !== "production" && env.NOVA_DEV_INSTANCE_URL) {
    // In local dev: access the API remotely via the dev instance URL
    return env.NOVA_DEV_INSTANCE_URL
  }

  // In prod: access the API via the instance URL we are deployed on
  return window.location.origin
}

export const useNovaClient = () => {
  if (!nova) {
    nova = new Nova({
      instanceUrl: getNovaApiGatewayUrl(),
      accessToken: env.NOVA_DEV_ACCESS_TOKEN || "",
      baseOptions: {
        // Time out after 30 seconds
        timeout: 30000,
      },
    })
  }

  return nova
}
