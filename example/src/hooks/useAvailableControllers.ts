import { env } from "@/runtimeEnv.ts"
import { useQuery } from "@tanstack/react-query"
import { useNovaClient } from "./useNovaClient.ts"

/**
 * Queries the NOVA OS instance for a list of connected
 * robot controllers.
 */
export function useAvailableControllers() {
  const nova = useNovaClient()

  const { data, error } = useQuery({
    queryKey: ["available-controllers"],
    queryFn: async () => {
      const controllers = await nova.api.controller.listRobotControllers(
        env.CELL_ID || "cell",
      )
      return controllers.toSorted((a, b) => a.localeCompare(b))
    },
  })

  return { controllers: data, error }
}
