import { NovaClient } from "@wandelbots/nova-js/v1"
import { expect, test } from "vitest"

test("things compile and initialize", async () => {
  const nova = new NovaClient({
    instanceUrl: "https://mock.example.com",
  })

  expect(nova.config.cellId).toBe("cell")

  await nova.api.controller.listControllers()
})
