import {
  buildNatsServerUrl,
  NovaNatsClient,
} from "@wandelbots/nova-js/experimental/nats"
import { Nova } from "@wandelbots/nova-js/v2"
import { expect, test } from "vitest"
import { env } from "../env.ts"

// Note: assumes the e2e test instance's NATS WebSocket gateway (like its REST
// API) does not require authentication. If that's not the case, pass a
// `token` (see NovaNatsClientConfig) alongside `servers`.
test("receives a NATS message when the cell configuration changes via REST", async () => {
  const nova = new Nova({ instanceUrl: env.NOVA })
  const natsClient = new NovaNatsClient({
    servers: buildNatsServerUrl(env.NOVA),
  })

  try {
    let resolveReceived!: (payload: {
      name: string
      description?: string
    }) => void
    const received = new Promise<{ name: string; description?: string }>(
      (resolve) => {
        resolveReceived = resolve
      },
    )

    // Subscribe before triggering the update below, so we don't miss the
    // message that update publishes.
    const unsubscribe = await natsClient.subscribe(
      "nova.v2.cells.{cell}",
      { cell: "cell" },
      (payload) => resolveReceived(payload),
    )

    const cell = await nova.api.cell.getCell("cell")
    const expectedDescription = `e2e nats test ${Date.now()}`
    await nova.api.cell.updateCell("cell", {
      ...cell,
      description: expectedDescription,
    })

    const payload = await received
    unsubscribe()

    expect(payload.name).toBe("cell")
    expect(payload.description).toBe(expectedDescription)
  } finally {
    await natsClient.close()
  }
}, 20_000)
