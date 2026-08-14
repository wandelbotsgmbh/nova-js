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

test("subscribing with lastMessage replays the last persisted JetStream message immediately", async () => {
  const nova = new Nova({ instanceUrl: env.NOVA })
  const nats = new NovaNatsClient(nova)

  try {
    // Persist a message first (the cell update is published to JetStream),
    // so the subscription below has something to replay.
    const cell = await nova.api.cell.getCell("cell")
    const expectedDescription = `e2e nats lastMessage test ${Date.now()}`
    await nova.api.cell.updateCell("cell", {
      ...cell,
      description: expectedDescription,
    })

    let resolveReceived!: (payload: Cell) => void
    const received = new Promise<Cell>((resolve) => {
      resolveReceived = resolve
    })

    // Subscribed after the update above: without lastMessage this would
    // wait forever, with it the persisted message is replayed immediately.
    // Subscribes to the concrete cell (not a wildcard), since lastMessage
    // on a wildcard replays the last message of every matching cell.
    const unsubscribe = await nats.subscribe(
      "nova.v2.cells.{cell}",
      { cell: "cell" },
      (payload) => {
        resolveReceived(payload)
      },
      { lastMessage: true },
    )

    const payload = await received
    unsubscribe()

    expect(payload.name).toBe("cell")
    expect(payload.description).toBe(expectedDescription)
  } finally {
    await nats.close()
  }
}, 20_000)
