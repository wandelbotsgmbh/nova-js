import {
  NovaNatsClient,
  type Cell,
} from "@wandelbots/nova-js/experimental/nats"
import { Nova } from "@wandelbots/nova-js/v2"
import { expect, test } from "vitest"
import { env } from "../env.ts"

test("receives a NATS message when the cell configuration changes via REST", async () => {
  const nova = new Nova({ instanceUrl: env.NOVA })
  const nats = new NovaNatsClient(nova)

  try {
    let resolveReceived!: (payload: Cell) => void
    const received = new Promise<Cell>((resolve) => {
      resolveReceived = resolve
    })

    // Subscribe before triggering the update below, so we don't miss the
    // message that update publishes.
    const unsubscribe = await nats.subscribe(
      "nova.v2.cells.{cell}",
      { cell: "*" },
      (payload) => {
        resolveReceived(payload)
      },
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
    await nats.close()
  }
}, 20_000)
