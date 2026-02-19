import { expect, test } from "vitest"
import { NovaClient } from "../../dist/lib/v2"

test("getMotionGroupKinematicModel", async () => {
  const nova = new NovaClient({
    instanceUrl: "https://mock.example.com",
  })

  // Something we don't have a mock for yet, to see what error we get

  await expect(
    nova.api.motionGroupModels.getMotionGroupKinematicModel("0@mock-ur5e"),
  ).rejects.toThrow(
    `No mock handler matched this request: GET /motion-group-models/0%40mock-ur5e/kinematic`,
  )
})

test("mock correctly reports missing functionality", async () => {
  const nova = new NovaClient({
    instanceUrl: "https://mock.example.com",
  })

  // Something we don't have a mock for yet, to see what error we get

  await expect(
    nova.api.motionGroupModels.getMotionGroupKinematicModel("0@mock-ur5e"),
  ).rejects.toThrow(
    `No mock handler matched this request: GET /motion-group-models/0%40mock-ur5e/kinematic`,
  )
})
