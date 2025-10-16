import { expect, test } from "vitest"
import { NovaClient } from "../../dist/lib/v2"

test("jogging", async () => {
  const nova = new NovaClient({
    instanceUrl: "https://mock.example.com",
  })

  const jogger = await nova.connectJogger("0@mock-ur5e", {
    mode: "jogging",
    tcp: "tcp",
  })

  const oldWebsocket = jogger.joggingSocket

  // Test that jogger reopens websocket when re-initialized
  jogger.setJoggingMode("jogging", false)

  const newWebsocket = jogger.joggingSocket
  expect(newWebsocket).not.toBe(oldWebsocket)
})
