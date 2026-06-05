export const listRobotControllers = {
  method: "GET",
  path: "/cells/:cellId/controllers",
  handle() {
    return ["mock-ur5e"]
  },
}
