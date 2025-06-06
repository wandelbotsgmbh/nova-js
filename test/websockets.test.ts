/// <reference types="vite/client" />

import { expect, test } from "vitest"
import { NovaClient } from "../dist/lib/v1"

test("websocket handling", async () => {
  const nova = new NovaClient({
    instanceUrl: "https://mock.example.com",
  })

  // Check that we turn a path into a websocket URL correctly
  const ws = nova.openReconnectingWebsocket(
    "/motion-groups/0@mock-ur5e/state-stream",
  )
  expect(ws.url).toBe(
    "wss://mock.example.com/api/v1/cells/cell/motion-groups/0@mock-ur5e/state-stream",
  )
})
