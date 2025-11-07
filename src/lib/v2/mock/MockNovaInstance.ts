/** biome-ignore-all lint/suspicious/noApproximativeNumericConstant: mock data contains approximative pi values from robot description */
import type { MotionGroupState, RobotController } from "@wandelbots/nova-api/v2"
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { AxiosError } from "axios"
import * as pathToRegexp from "path-to-regexp"
import type { AutoReconnectingWebsocket } from "../../AutoReconnectingWebsocket"

/**
 * Ultra-simplified mock Nova server for testing stuff
 */
export class MockNovaInstance {
  readonly connections: AutoReconnectingWebsocket[] = []

  async handleAPIRequest(
    config: InternalAxiosRequestConfig,
  ): Promise<AxiosResponse> {
    const apiHandlers = [
      {
        method: "GET",
        path: "/cells/:cellId/controllers",
        handle() {
          return ["mock-ur5e"]
        },
      },
      {
        method: "GET",
        path: "/cells/:cellId/controllers/:controllerId",
        handle() {
          return {
            configuration: {
              initial_joint_position: "[0,-1.571,-1.571,-1.571,1.571,-1.571,0]",
              kind: "VirtualController",
              manufacturer: "universalrobots",
              type: "universalrobots-ur5e",
            },
            name: "mock-ur5",
          } satisfies RobotController
        },
      },
      {
        method: "GET",
        path: "/cells/:cellId/controllers/:controllerId/state",
        handle() {
          return {
            mode: "MODE_CONTROL",
            last_error: [],
            timestamp: "2025-10-16T09:19:26.634534092Z",
            sequence_number: 1054764,
            controller: "mock-ur5e",
            operation_mode: "OPERATION_MODE_AUTO",
            safety_state: "SAFETY_STATE_NORMAL",
            velocity_override: 100,
            motion_groups: [
              {
                timestamp: "2025-10-16T09:19:26.634534092Z",
                sequence_number: 1054764,
                motion_group: "0@mock-ur5e",
                controller: "mock-ur5e",
                joint_position: [
                  1.487959623336792, -1.8501918315887451, 1.8003005981445312,
                  6.034560203552246, 1.4921919107437134, 1.593459963798523,
                ],
                joint_limit_reached: {
                  limit_reached: [false, false, false, false, false, false],
                },
                joint_torque: [],
                joint_current: [0, 0, 0, 0, 0, 0],
                flange_pose: {
                  position: [
                    107.6452433732927, -409.0402987746852, 524.2402132330305,
                  ],
                  orientation: [
                    0.9874434028353319, -0.986571714997442, 1.3336589451098142,
                  ],
                },
                tcp: "Flange",
                tcp_pose: {
                  position: [
                    107.6452433732927, -409.0402987746852, 524.2402132330305,
                  ],
                  orientation: [
                    0.9874434028353319, -0.986571714997442, 1.3336589451098142,
                  ],
                },
                payload: "",
                coordinate_system: "",
                standstill: true,
              },
            ],
          }
        },
      },
      {
        method: "GET",
        path: "/cells/:cellId/controllers/:controllerId/motion-groups/:motionGroupId/description",
        handle() {
          return {
            motion_group_model: "UniversalRobots_UR5e",
            mounting: {
              position: [0, 0, 0],
              orientation: [0, 0, 0],
            },
            tcps: {
              Flange: {
                name: "Default-Flange",
                pose: {
                  position: [0, 0, 0],
                  orientation: [0, 0, 0],
                },
              },
            },
            payloads: {
              "FPay-0": {
                name: "FPay-0",
                payload: 0,
                center_of_mass: [0, 0, 0],
                moment_of_inertia: [0, 0, 0],
              },
            },
            cycle_time: 8,
            dh_parameters: [
              {
                alpha: 1.5707963267948966,
                d: 162.25,
              },
              {
                a: -425,
              },
              {
                a: -392.2,
              },
              {
                alpha: 1.5707963267948966,
                d: 133.3,
              },
              {
                alpha: -1.5707963267948966,
                d: 99.7,
              },
              {
                d: 99.6,
              },
            ],
            operation_limits: {
              auto_limits: {
                joints: [
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 150,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 150,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 150,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 28,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 28,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 28,
                  },
                ],
                tcp: {
                  velocity: 5000,
                },
                elbow: {
                  velocity: 5000,
                },
                flange: {
                  velocity: 5000,
                },
              },
              manual_limits: {
                joints: [
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 150,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 150,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 150,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 28,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 28,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 28,
                  },
                ],
                tcp: {
                  velocity: 5000,
                },
              },
              manual_t1_limits: {
                joints: [
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 150,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 150,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 150,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 28,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 28,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 28,
                  },
                ],
                tcp: {
                  velocity: 5000,
                },
              },
              manual_t2_limits: {
                joints: [
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 150,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 150,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 150,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 28,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 28,
                  },
                  {
                    position: {
                      lower_limit: -6.283185307179586,
                      upper_limit: 6.283185307179586,
                    },
                    velocity: 3.34159255027771,
                    acceleration: 40,
                    torque: 28,
                  },
                ],
                tcp: {
                  velocity: 5000,
                },
              },
            },
            serial_number: "WBVirtualRobot",
          }
        },
      },
      {
        method: "GET",
        path: "/cells/:cellId/controllers/:controllerId/coordinate-systems",
        handle() {
          return [
            {
              coordinate_system: "",
              name: "world",
              reference_coordinate_system: "",
              position: [0, 0, 0],
              orientation: [0, 0, 0],
              orientation_type: "ROTATION_VECTOR",
            },
            {
              coordinate_system: "CS-0",
              name: "Default-CS",
              reference_coordinate_system: "",
              position: [0, 0, 0],
              orientation: [0, 0, 0],
              orientation_type: "ROTATION_VECTOR",
            },
          ] //satisfies CoordinateSystems
        },
      },
    ]

    const method = config.method?.toUpperCase() || "GET"
    const path = `/cells${config.url?.split("/cells")[1]?.split("?")[0]}`

    for (const handler of apiHandlers) {
      const match = pathToRegexp.match(handler.path)(path || "")
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

    // return {
    //   status: 404,
    //   statusText: "Not Found",
    //   data: "",
    //   headers: {},
    //   config,
    //   request: {
    //     responseURL: config.url,
    //   },
    // }
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
