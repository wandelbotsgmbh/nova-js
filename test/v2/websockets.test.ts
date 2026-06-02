import { Nova } from "@wandelbots/nova-js/v2"
import { expect, test } from "vitest"

test("websocket handling", async () => {
  const nova = new Nova({
    instanceUrl: "https://mock.example.com",
  })

  const ws = nova.openReconnectingWebsocket(
    "/cells/cell//motion-groups/0@mock-ur5e/state-stream",
  )
  expect(ws.url).toBe(
    "wss://mock.example.com/api/v2/cells/cell/motion-groups/0@mock-ur5e/state-stream",
  )
})
