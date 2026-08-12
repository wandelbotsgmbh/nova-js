import {
  NovaNatsClient,
  type Cell,
} from "@wandelbots/nova-js/experimental/nats"
import { Nova } from "@wandelbots/nova-js/v2"
import { expect, test, vi } from "vitest"
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

test("replayLast delivers the current cell state to a subscriber that starts after the last change", async () => {
  const nova = new Nova({ instanceUrl: env.NOVA })
  const nats = new NovaNatsClient(nova)

  try {
    const replayed: Cell[] = []
    const withoutReplay: Cell[] = []

    // Nothing publishes a cell's configuration unless it is edited, and this
    // test edits nothing. The plain subscription is the control: a live publish
    // would reach both subscribers, so `replayed` filling while `withoutReplay`
    // stays empty is what proves the message came from JetStream's retained
    // value rather than from a fresh publish.
    const stopWithoutReplay = await nats.subscribe(
      "nova.v2.cells.{cell}",
      { cell: "cell" },
      (payload) => {
        withoutReplay.push(payload)
      },
    )
    const stopReplay = await nats.subscribe(
      "nova.v2.cells.{cell}",
      { cell: "cell" },
      (payload) => {
        replayed.push(payload)
      },
      { replayLast: true },
    )

    try {
      await vi.waitUntil(() => replayed.length > 0, { timeout: 10_000 })
    } finally {
      stopWithoutReplay()
      stopReplay()
    }

    expect(replayed[0]?.name).toBe("cell")
    expect(withoutReplay).toEqual([])
  } finally {
    await nats.close()
  }
}, 20_000)
