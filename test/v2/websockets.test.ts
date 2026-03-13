import { expect, test } from "vitest"
import { NovaClient } from "../../dist/lib/v2"

test("websocket handling", async () => {
  const nova = new NovaClient({
    instanceUrl: "https://mock.example.com",
  })

  // Check that we turn a path into a websocket URL correctly
  const ws = nova.openReconnectingWebsocket(
    "/motion-groups/0@mock-ur5e/state-stream",
  )
  expect(ws.url).toBe(
    "wss://mock.example.com/api/v2/cells/cell/motion-groups/0@mock-ur5e/state-stream",
  )
})

test("ws namespace connects controller state stream", async () => {
  const nova = new NovaClient({
    instanceUrl: "https://mock.example.com",
  })

  const ws = nova.ws.streamRobotControllerState.connect({
    controller: "ur5e",
  })
  expect(ws.url).toBe(
    "wss://mock.example.com/api/v2/cells/cell/controllers/ur5e/state-stream",
  )
})

test("ws namespace connects motion group state stream with custom cell", async () => {
  const nova = new NovaClient({
    instanceUrl: "https://mock.example.com",
    cellId: "my-cell",
  })

  const ws = nova.ws.streamMotionGroupState.connect({
    controller: "ur5e",
    "motion-group": "0@ur5e",
  })
  expect(ws.url).toBe(
    "wss://mock.example.com/api/v2/cells/my-cell/controllers/ur5e/motion-groups/0%40ur5e/state-stream",
  )
})
