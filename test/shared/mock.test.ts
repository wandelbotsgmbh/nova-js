import { Nova } from "@wandelbots/nova-js/v2"
import { expect, test } from "vitest"

test("getMotionGroupKinematicModel", async () => {
  const nova = new Nova({
    instanceUrl: "https://mock.example.com",
  })

  const data =
    await nova.api.motionGroupModels.getMotionGroupKinematicModel("0@mock-ur5e")
  expect(data.inverse_solver).toEqual("Universalrobots")
})

test("mock correctly reports missing functionality", async () => {
  const nova = new Nova({
    instanceUrl: "https://mock.example.com",
  })

  await expect(
    nova.api.motionGroupModels.getMotionGroupCollisionModel("0@mock-ur5e"),
  ).rejects.toThrow(
    `No mock handler matched this request: GET /motion-group-models/0%40mock-ur5e/collision`,
  )
})

test("mock correctly handles query parameters", async () => {
  const nova = new Nova({
    instanceUrl: "https://mock.example.com",
  })

  const data = await nova.api.controller.listCoordinateSystems(
    "cell",
    "0@mock-ur5e",
    "ROTATION_VECTOR",
  )
  expect(data).not.toBeNull()
  expect(data).not.toBeUndefined()
})
