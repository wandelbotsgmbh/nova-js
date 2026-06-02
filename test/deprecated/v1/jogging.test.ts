import { NovaClient } from "@wandelbots/nova-js/v1"
import { expect, test } from "vitest"

test("jogging", async () => {
  const nova = new NovaClient({
    instanceUrl: "https://mock.example.com",
  })

  const jogger = await nova.connectJogger("0@mock-ur5e")

  jogger.setJoggingMode("cartesian", {
    tcpId: "tcp",
    coordSystemId: "world",
  })

  const oldWebsocket = jogger.activeWebsocket

  // Test that jogger reopens websocket when cartesian opts change
  jogger.setJoggingMode("cartesian", {
    tcpId: "tcp",
    coordSystemId: "base",
  })

  const newWebsocket = jogger.activeWebsocket
  expect(newWebsocket).not.toBe(oldWebsocket)
})
