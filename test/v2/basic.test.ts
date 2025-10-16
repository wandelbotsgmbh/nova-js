import { expect, test } from "vitest"
import { NovaClient } from "../../dist/lib/v2"

test("things compile and initialize", async () => {
  const nova = new NovaClient({
    instanceUrl: "https://mock.example.com",
  })

  expect(nova.config.cellId).toBe("cell")

  await nova.api.controller.listRobotControllers()
})
