import type { ConsumerMessages } from "@nats-io/jetstream"
import type { NatsConnection } from "@nats-io/nats-core"
import { NovaNatsClient } from "@wandelbots/nova-js/experimental/nats"
import { Nova } from "@wandelbots/nova-js/v2"
import { describe, expect, test, vi } from "vitest"

// Only the connection is fake here: the real @nats-io/jetstream builds the
// JetStream API requests, and the connection answers them like the NATS server
// of a NOVA instance with per-cell authorization, for a user with access to
// the cell "cell-a". That server denies a consumer-create subject without a
// filter ($JS.API.CONSUMER.CREATE.<stream>, …CREATE.<stream>.<consumer>) and
// allows …CREATE.<stream>.<consumer>.<filter> for filters within the cell.
const { connection, requestedSubjects } = vi.hoisted(() => {
  const requestedSubjects: string[] = []
  const reply = (value: unknown) => ({
    data: new TextEncoder().encode(JSON.stringify(value)),
  })

  const connection = {
    options: {},
    // Every server feature that the client checks for is available
    features: { get: () => ({ ok: true, min: "" }) },
    async request(subject: string, data: Uint8Array) {
      requestedSubjects.push(subject)
      if (subject === "$JS.API.INFO") {
        return reply({})
      }
      if (subject === "$JS.API.STREAM.NAMES") {
        return reply({ streams: ["system-state"] })
      }
      if (subject === "$JS.API.STREAM.INFO.system-state") {
        return reply({ config: { name: "system-state" }, state: {} })
      }
      if (subject.startsWith("$JS.API.CONSUMER.CREATE.")) {
        const allowed = subject.match(
          /^\$JS\.API\.CONSUMER\.CREATE\.system-state\.([^.]+)\.nova\.v2\.cells\.cell-a(\..+)?$/,
        )
        if (!allowed) {
          throw new Error(`Permissions Violation for Publish to "${subject}"`)
        }
        const { config } = JSON.parse(new TextDecoder().decode(data))
        return reply({ stream_name: "system-state", name: allowed[1], config })
      }
      throw new Error(`Unexpected request to "${subject}"`)
    },
  }

  return { connection, requestedSubjects }
})

vi.mock("@nats-io/nats-core", () => ({ wsconnect: async () => connection }))
vi.mock("@nats-io/jetstream", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@nats-io/jetstream")>()
  return {
    ...actual,
    jetstream: (nc: NatsConnection) => {
      const js = actual.jetstream(nc)
      const get = js.consumers.get.bind(js.consumers)
      js.consumers.get = async (...args) => {
        const consumer = await get(...args)
        // Pulling messages needs a live server, and this test is about
        // creating the consumer: the subscription receives no messages.
        vi.spyOn(consumer, "consume").mockResolvedValue({
          [Symbol.asyncIterator]: () => ({
            next: async () => ({ value: undefined, done: true }),
          }),
          close: async () => {},
        } as unknown as ConsumerMessages)
        return consumer
      }
      return js
    },
  }
})

describe("NovaNatsClient with per-cell NATS authorization", () => {
  test("subscribe() with lastMessage puts the filter subject into the consumer-create subject", async () => {
    const client = new NovaNatsClient(
      new Nova({ instanceUrl: "https://example.com" }),
    )

    const unsubscribe = await client.subscribe(
      "nova.v2.cells.{cell}",
      { cell: "cell-a" },
      vi.fn(),
      { lastMessage: true },
    )
    unsubscribe()

    expect(
      requestedSubjects.filter((subject) =>
        subject.startsWith("$JS.API.CONSUMER.CREATE."),
      ),
    ).toEqual([
      expect.stringMatching(
        /^\$JS\.API\.CONSUMER\.CREATE\.system-state\.[^.]+\.nova\.v2\.cells\.cell-a$/,
      ),
    ])
  })
})
