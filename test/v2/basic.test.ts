import { Nova } from "@wandelbots/nova-js/v2"
import { test } from "vitest"

test("things compile and initialize", async () => {
  const nova = new Nova({
    instanceUrl: "https://mock.example.com",
  })

  await nova.api.controller.listRobotControllers("cell")
})
