export const getCurrentRobotControllerState = {
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
}
