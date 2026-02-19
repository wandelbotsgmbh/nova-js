import type { MotionGroupState } from "@wandelbots/nova-api/v2"
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { AxiosError } from "axios"
import * as pathToRegexp from "path-to-regexp"
import type { AutoReconnectingWebsocket } from "../../AutoReconnectingWebsocket"
import { getCurrentRobotControllerState } from "./getCurrentRobotControllerState"
import { getMotionGroupDescription } from "./getMotionGroupDescription"
import { getMotionGroupKinematicModel } from "./getMotionGroupKinematicModel"
import { getRobotController } from "./getRobotController"
import { listCoordinateSystems } from "./listCoordinateSystems"
import { listRobotControllers } from "./listRobotControllers"

/**
 * Ultra-simplified mock Nova server for testing stuff
 */
export class MockNovaInstance {
  readonly connections: AutoReconnectingWebsocket[] = []

  async handleAPIRequest(
    config: InternalAxiosRequestConfig,
  ): Promise<AxiosResponse> {
    const apiHandlers = [
      listRobotControllers,
      getRobotController,
      getMotionGroupDescription,
      getCurrentRobotControllerState,
      listCoordinateSystems,
      getMotionGroupKinematicModel,
    ]

    const method = config.method?.toUpperCase() || "GET"
    if (!config.url) {
      throw new Error("No url sent with request")
    }
    const path = config.url

    for (const handler of apiHandlers) {
      const match = pathToRegexp.match(handler.path)(path)
      if (method === handler.method && match) {
        const json = handler.handle()
        return {
          status: 200,
          statusText: "Success",
          data: JSON.stringify(json),
          headers: {},
          config,
          request: {
            responseURL: config.url,
          },
        }
      }
    }

    throw new AxiosError(
      `No mock handler matched this request: ${method} ${path}`,
      "404",
      config,
    )
  }

  // Please note: Only very basic websocket mocking is done here, needs to be extended as needed
  handleWebsocketConnection(socket: AutoReconnectingWebsocket) {
    this.connections.push(socket)

    setTimeout(() => {
      socket.dispatchEvent(new Event("open"))

      console.log("Websocket connection opened from", socket.url)

      if (socket.url.includes("/state-stream")) {
        socket.dispatchEvent(
          new MessageEvent("message", {
            data: JSON.stringify(defaultMotionState),
          }),
        )
      }

      if (socket.url.includes("/execution/jogging")) {
        socket.dispatchEvent(
          new MessageEvent("message", {
            data: JSON.stringify({
              result: {
                message: "string",
                kind: "INITIALIZE_RECEIVED",
              },
            }),
          }),
        )
      }
    }, 10)
  }

  handleWebsocketMessage(socket: AutoReconnectingWebsocket, message: string) {
    console.log(`Received message on ${socket.url}`, message)
  }
}

const defaultMotionState = {
  result: {
    motion_group: "0@universalrobots-ur5e",
    controller: "universalrobots-ur5e",
    timestamp: new Date().toISOString(),
    sequence_number: 1,
    joint_position: [
      1.1699999570846558, -1.5700000524520874, 1.3600000143051147,
      1.0299999713897705, 1.2899999618530273, 1.2799999713897705,
    ],
    joint_limit_reached: {
      limit_reached: [false, false, false, false, false, false],
    },
    standstill: false,
    flange_pose: {
      position: [1.3300010259703043, -409.2680714682808, 531.0203477065281],
      orientation: [
        1.7564919306270736, -1.7542521568325058, 0.7326972590614671,
      ],
    },
    tcp_pose: {
      position: [1.3300010259703043, -409.2680714682808, 531.0203477065281],
      orientation: [
        1.7564919306270736, -1.7542521568325058, 0.7326972590614671,
      ],
    },
  } satisfies MotionGroupState,
}
