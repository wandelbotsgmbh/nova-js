import { useAvailableControllers } from "@/hooks/useAvailableControllers.ts"
import { env } from "@/runtimeEnv.ts"
import { NovaAppPlaceholder } from "@/templates/Placeholder/NovaAppPlaceholder.tsx"
import { Stack } from "@mui/material"
import {
  LoadingCover,
  NoMotionGroupModal,
} from "@wandelbots/wandelbots-js-react-components/core"

export const App = () => {
  // Find controllers available on the NOVA OS instance
  const { controllers, error } = useAvailableControllers()

  return (
    <Stack height="100vh">
      {!controllers ? (
        <LoadingCover error={error} />
      ) : !controllers[0] ? (
        <NoMotionGroupModal baseUrl={env.NOVA || ""} />
      ) : (
        // add your code here
        <NovaAppPlaceholder controller={controllers[0]} />
      )}
    </Stack>
  )
}
