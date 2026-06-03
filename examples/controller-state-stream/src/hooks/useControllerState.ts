import { tryParseJson } from "@wandelbots/nova-js";
import type { RobotControllerState } from "@wandelbots/nova-js/v2";
import { useEffect, useState } from "react";
import { useNovaClient } from "./useNovaClient.ts";

/**
 * Returns the current controller state for a given controller.
 */
export function useControllerState(controller: string) {
  const nova = useNovaClient();
  const [state, setState] = useState<{
    controllerState: RobotControllerState | null;
    error: unknown | null;
  }>({
    controllerState: null,
    error: null,
  });

  useEffect(() => {
    // We set the response rate here to avoid performance issues
    // from super-rapid rerenders. By default, the state stream sends updates
    // according to the controller's internal update rate, which can be very fast
    // (e.g. every 10ms).
    //
    // If you are doing animations which require higher update rates, you may
    // want to structure this a bit differently.
    const socket = nova.openReconnectingWebsocket(
      `/controllers/${controller}/state-stream?response_rate=200`,
    );

    socket.addEventListener("message", (event) => {
      const data = tryParseJson(event.data) as { result: RobotControllerState };
      if (data?.result?.controller !== controller) {
        setState({
          controllerState: null,
          error: new Error(
            `Received unexpected controller state: ${event.data}`,
          ),
        });
        return;
      }

      setState({ controllerState: data.result, error: null });
    });

    socket.addEventListener("error", (event) => {
      setState({
        controllerState: null,
        error: event.error,
      });
    });

    return () => {
      socket.close();
    };
  }, [nova, controller]);

  return state;
}
