import { NovaClient } from "@wandelbots/nova-js/v2";
import { env } from "@/runtimeEnv.ts";

let nova: NovaClient | null = null;

function getNovaApiGatewayUrl() {
  if (env.NODE_ENV !== "production" && env.NOVA_DEV_INSTANCE_URL) {
    // In local dev: access the API remotely via the dev instance URL
    return env.NOVA_DEV_INSTANCE_URL || "";
  }

  if (typeof window === "undefined") {
    // On prod backend: access the API via the cluster-relative URL
    return process.env.NOVA_API || "";
  } else {
    // In prod frontend: access the API via the instance URL we are deployed on
    return window.location.origin;
  }
}

export const useNovaClient = () => {
  if (!nova) {
    nova = new NovaClient({
      instanceUrl: getNovaApiGatewayUrl(),
      cellId: env.CELL_ID || "cell",
      accessToken: env.NOVA_DEV_ACCESS_TOKEN || "",
      baseOptions: {
        // Time out after 30 seconds
        timeout: 30000,
      },
    });
  }

  return nova;
};
