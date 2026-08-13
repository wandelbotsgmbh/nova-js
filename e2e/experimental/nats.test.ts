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

test("onReplayComplete fires after the retained state has been delivered", async () => {
  const nova = new Nova({ instanceUrl: env.NOVA })
  const nats = new NovaNatsClient(nova)

  try {
    const seen: string[] = []

    const unsubscribe = await nats.subscribe(
      "nova.v2.cells.{cell}",
      { cell: "*" },
      (payload) => {
        seen.push(payload.name)
      },
      {
        replayLast: true,
        onReplayComplete: () => {
          seen.push("complete")
        },
      },
    )

    try {
      await vi.waitUntil(() => seen.includes("complete"), { timeout: 10_000 })
    } finally {
      unsubscribe()
    }

    // Completion comes last: every retained cell reached the handler first.
    expect(seen.at(-1)).toBe("complete")
    expect(seen).toContain("cell")
  } finally {
    await nats.close()
  }
}, 20_000)

test("onReplayComplete fires on a subject with nothing retained", async () => {
  const nova = new Nova({ instanceUrl: env.NOVA })
  const nats = new NovaNatsClient(nova)

  try {
    // No apps are installed on a fresh instance, so this wildcard has no
    // retained message and never will during the test. Waiting for a first
    // message would hang; completion has to be reported from the consumer's
    // pending count instead.
    const handler = vi.fn()
    let complete = false

    const unsubscribe = await nats.subscribe(
      "nova.v2.cells.{cell}.apps.{app}",
      { cell: "*", app: "*" },
      handler,
      {
        replayLast: true,
        onReplayComplete: () => {
          complete = true
        },
      },
    )

    try {
      await vi.waitUntil(() => complete, { timeout: 10_000 })
    } finally {
      unsubscribe()
    }

    expect(complete).toBe(true)
    expect(handler).not.toHaveBeenCalled()
  } finally {
    await nats.close()
  }
}, 20_000)
