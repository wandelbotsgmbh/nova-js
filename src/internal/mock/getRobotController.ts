import type { RobotController } from "@wandelbots/nova-api/v2"

export const getRobotController = {
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
}
