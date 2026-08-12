import {
  natsStreamBySubject,
  NovaNatsClient,
} from "@wandelbots/nova-js/experimental/nats"
import { Nova } from "@wandelbots/nova-js/v2"
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"

const { consumerMessages, consumersGet, mockConnection, wsconnect } =
  vi.hoisted(() => {
    const mockSubscription = {
      [Symbol.asyncIterator]: () => {
        let done = false
        return {
          next: async () => {
            if (done) {
              return { value: undefined, done: true }
            }
            done = true
            return {
              value: {
                subject: "nova.v2.cells.cell",
                json: () => ({ name: "cell" }),
              },
              done: false,
            }
          },
        }
      },
      unsubscribe: vi.fn(),
    }

    const mockConnection = {
      subscribe: vi.fn(() => mockSubscription),
      publish: vi.fn(),
      request: vi.fn(async () => ({ json: () => ({ message: "ok" }) })),
      close: vi.fn(async () => {}),
    }

    const wsconnect = vi.fn(async () => mockConnection)

    // A JetStream ordered consumer replaying one retained message per subject.
    const consumerMessages = {
      [Symbol.asyncIterator]: () => {
        let done = false
        return {
          next: async () => {
            if (done) return { value: undefined, done: true }
            done = true
            return {
              value: {
                subject: "nova.v2.cells.factory-1.status",
                json: () => [{ service: "a" }],
              },
              done: false,
            }
          },
        }
      },
      stop: vi.fn(),
    }

    const consumersGet = vi.fn(async () => ({
      consume: async () => consumerMessages,
    }))

    return {
      consumerMessages,
      consumersGet,
      mockConnection,
      mockSubscription,
      wsconnect,
    }
  })

vi.mock("@nats-io/nats-core", () => ({ wsconnect }))
vi.mock("@nats-io/jetstream", () => ({
  jetstream: () => ({ consumers: { get: consumersGet } }),
  DeliverPolicy: { LastPerSubject: "last_per_subject" },
}))

describe("NovaNatsClient", () => {
  const nova = new Nova({ instanceUrl: "https://example.com" })

  beforeEach(() => {
    wsconnect.mockClear()
    mockConnection.subscribe.mockClear()
    mockConnection.publish.mockClear()
    mockConnection.request.mockClear()
    mockConnection.close.mockClear()
    consumersGet.mockClear()
    consumerMessages.stop.mockClear()
  })

  test("connect() calls wsconnect once and reuses the connection", async () => {
    const client = new NovaNatsClient(nova)
    const nc1 = await client.connect()
    const nc2 = await client.connect()
    expect(wsconnect).toHaveBeenCalledTimes(1)
    expect(nc1).toBe(nc2)
  })

  test("connect() calls wsconnect only once when called concurrently before it resolves", async () => {
    let resolveConnect!: (nc: typeof mockConnection) => void
    wsconnect.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveConnect = resolve
        }),
    )

    const client = new NovaNatsClient(nova)
    const p1 = client.connect()
    const p2 = client.connect()

    resolveConnect(mockConnection)
    const [nc1, nc2] = await Promise.all([p1, p2])

    expect(wsconnect).toHaveBeenCalledTimes(1)
    expect(nc1).toBe(nc2)
  })

  test("close() allows a subsequent connect() to reconnect", async () => {
    const client = new NovaNatsClient(nova)
    await client.connect()
    await client.close()
    await client.connect()
    expect(wsconnect).toHaveBeenCalledTimes(2)
  })

  test("uses the Nova instance's accessToken as the NATS token when available", async () => {
    const authedNova = new Nova({
      instanceUrl: "https://example.com",
      accessToken: "the-token",
    })
    const client = new NovaNatsClient(authedNova)
    expect(client.config.token).toBe("the-token")
  })

  test("omits the NATS token when the Nova instance has none", () => {
    const client = new NovaNatsClient(nova)
    expect(client.config.token).toBeUndefined()
  })

  test("an explicit token in config overrides the Nova instance's accessToken", () => {
    const authedNova = new Nova({
      instanceUrl: "https://example.com",
      accessToken: "the-token",
    })
    const client = new NovaNatsClient(authedNova, { token: "override-token" })
    expect(client.config.token).toBe("override-token")
  })

  test("subscribe() builds the subject and invokes handler with decoded JSON payloads", async () => {
    const client = new NovaNatsClient(nova)
    const handler = vi.fn()
    await client.subscribe("nova.v2.cells.{cell}", { cell: "cell" }, handler)

    expect(mockConnection.subscribe).toHaveBeenCalledWith("nova.v2.cells.cell")
    // let the async iteration loop run
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(handler).toHaveBeenCalledWith({ name: "cell" }, expect.anything())
  })

  test("subscribe() annotates each message with the subject params extracted from its concrete subject", async () => {
    mockConnection.subscribe.mockReturnValueOnce({
      [Symbol.asyncIterator]: () => {
        let done = false
        return {
          next: async () => {
            if (done) return { value: undefined, done: true }
            done = true
            return {
              value: {
                subject: "nova.v2.cells.factory-1.status",
                json: () => [{ service: "a" }],
              },
              done: false,
            }
          },
        }
      },
      unsubscribe: vi.fn(),
    } as unknown as ReturnType<typeof mockConnection.subscribe>)

    const client = new NovaNatsClient(nova)
    const seen: Array<{ cell: string }> = []

    await client.subscribe(
      "nova.v2.cells.{cell}.status",
      { cell: "*" },
      (_services, msg) => {
        // Typed from the template: exactly { cell: string }
        expectTypeOf(msg.subjectParams).toEqualTypeOf<{ cell: string }>()
        seen.push(msg.subjectParams)
      },
    )
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(seen).toEqual([{ cell: "factory-1" }])
  })

  test("subscribe() extracts multiple subject params, including dashed names", async () => {
    mockConnection.subscribe.mockReturnValueOnce({
      [Symbol.asyncIterator]: () => {
        let done = false
        return {
          next: async () => {
            if (done) return { value: undefined, done: true }
            done = true
            return {
              value: {
                subject:
                  "nova.v2.cells.factory-1.controllers.ur5e.motion-groups.0.description",
                json: () => ({}),
              },
              done: false,
            }
          },
        }
      },
      unsubscribe: vi.fn(),
    } as unknown as ReturnType<typeof mockConnection.subscribe>)

    const client = new NovaNatsClient(nova)
    const seen: Array<Record<string, string>> = []

    await client.subscribe(
      "nova.v2.cells.{cell}.controllers.{controller}.motion-groups.{motion-group}.description",
      { cell: "*", controller: "*", "motion-group": "*" },
      (_description, msg) => {
        seen.push(msg.subjectParams)
      },
    )
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(seen).toEqual([
      { cell: "factory-1", controller: "ur5e", "motion-group": "0" },
    ])
  })

  test("subscribe() allows omitting params for subjects with no placeholders", async () => {
    const client = new NovaNatsClient(nova)

    await client.subscribe("nova.v2.system.status", (_services, msg) => {
      // A subject without params has no subjectParams to read — typed as
      // property-less, so this is a compile error rather than `string`.
      // @ts-expect-error there is no `cell` param in this subject
      void msg.subjectParams.cell
    })

    expect(mockConnection.subscribe).toHaveBeenCalledWith(
      "nova.v2.system.status",
    )
  })

  test("subscribe() isolates a handler error to one message and keeps processing later ones", async () => {
    const messages = [
      { subject: "nova.v2.cells.cell", json: () => ({ name: "cell-1" }) },
      { subject: "nova.v2.cells.cell", json: () => ({ name: "cell-2" }) },
    ]
    let index = 0
    mockConnection.subscribe.mockReturnValueOnce({
      [Symbol.asyncIterator]: () => ({
        next: async () => {
          if (index >= messages.length) {
            return { value: undefined, done: true }
          }
          return { value: messages[index++], done: false }
        },
      }),
      unsubscribe: vi.fn(),
    })

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})
    const handler = vi.fn((payload: { name: string }) => {
      if (payload.name === "cell-1") throw new Error("boom")
    })

    const client = new NovaNatsClient(nova)
    await client.subscribe("nova.v2.cells.{cell}", { cell: "cell" }, handler)
    // let the async iteration loop process both messages
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenNthCalledWith(
      1,
      { name: "cell-1" },
      expect.anything(),
    )
    expect(handler).toHaveBeenNthCalledWith(
      2,
      { name: "cell-2" },
      expect.anything(),
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error handling NATS message"),
      expect.any(Error),
    )

    consoleErrorSpy.mockRestore()
  })

  test("subscribe() with replayLast reads the subject's retained message from its JetStream stream", async () => {
    const client = new NovaNatsClient(nova)
    const handler = vi.fn()

    const unsubscribe = await client.subscribe(
      "nova.v2.cells.{cell}.status",
      { cell: "*" },
      handler,
      { replayLast: true },
    )

    // Last-per-subject, so a wildcard subscription replays the retained
    // message of every matching cell rather than a single one.
    expect(consumersGet).toHaveBeenCalledWith("system-state", {
      filter_subjects: ["nova.v2.cells.*.status"],
      deliver_policy: "last_per_subject",
    })
    // Replay and live messages arrive on the one JetStream iterator, so the
    // core subscription would be a second, redundant delivery path.
    expect(mockConnection.subscribe).not.toHaveBeenCalled()

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(handler).toHaveBeenCalledWith([{ service: "a" }], expect.anything())

    unsubscribe()
    expect(consumerMessages.stop).toHaveBeenCalled()
  })

  test("subscribe() with replayLast still annotates messages with subject params", async () => {
    const client = new NovaNatsClient(nova)
    const seen: Array<{ cell: string }> = []

    await client.subscribe(
      "nova.v2.cells.{cell}.status",
      { cell: "*" },
      (_services, msg) => {
        seen.push(msg.subjectParams)
      },
      { replayLast: true },
    )
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(seen).toEqual([{ cell: "factory-1" }])
  })

  test("subscribe() uses core NATS, not JetStream, without replayLast", async () => {
    const client = new NovaNatsClient(nova)
    await client.subscribe(
      "nova.v2.cells.{cell}.status",
      { cell: "*" },
      vi.fn(),
    )

    expect(mockConnection.subscribe).toHaveBeenCalledWith(
      "nova.v2.cells.*.status",
    )
    expect(consumersGet).not.toHaveBeenCalled()
  })

  test("replayLast is rejected on a subject that does not retain its latest message", async () => {
    const client = new NovaNatsClient(nova)

    await client.subscribe(
      "nova.v2.cells.{cell}.programs",
      { cell: "cell" },
      vi.fn(),
      // @ts-expect-error `programs` carries no x-nats-jetstream-stream marker
      { replayLast: true },
    )
  })

  test("replayable subjects follow the spec's markers, not the live stream's subjects", () => {
    // The deployed `system-state` stream also captures
    // `nova.v2.cells.*.bus-ios.ios`, but src/asyncapi.yaml does not mark that
    // channel as persisted. The spec is the contract we generate from, so the
    // subject stays out until the marker is added upstream.
    expect(natsStreamBySubject).not.toHaveProperty(
      "nova.v2.cells.{cell}.bus-ios.ios",
    )
    expect(natsStreamBySubject).toHaveProperty(
      "nova.v2.cells.{cell}.bus-ios.status",
      "system-state",
    )
  })

  test("request() builds the subject, sends the JSON payload, and returns the decoded reply", async () => {
    const client = new NovaNatsClient(nova)
    const requestPayload = [
      { io: "io1", value: true, value_type: "boolean" as const },
    ]
    const reply = await client.request(
      "nova.v2.cells.{cell}.bus-ios.ios.set",
      { cell: "cell" },
      requestPayload,
    )
    expect(mockConnection.request).toHaveBeenCalledWith(
      "nova.v2.cells.cell.bus-ios.ios.set",
      JSON.stringify(requestPayload),
      { timeout: 5000 },
    )
    expect(reply).toEqual({ message: "ok" })
  })

  test("publish() builds the subject and sends the JSON payload", async () => {
    const client = new NovaNatsClient(nova)
    const publishPayload = [
      { io: "io1", value: true, value_type: "boolean" as const },
    ]

    await client.publish(
      "nova.v2.cells.{cell}.bus-ios.ios.set",
      { cell: "cell" },
      publishPayload,
    )

    expect(mockConnection.publish).toHaveBeenCalledWith(
      "nova.v2.cells.cell.bus-ios.ios.set",
      JSON.stringify(publishPayload),
    )
  })

  test("publish() supports subjects the server publishes (not just request subjects)", async () => {
    const client = new NovaNatsClient(nova)
    const publishPayload = { name: "cell", description: "test" }

    await client.publish(
      "nova.v2.cells.{cell}",
      { cell: "cell" },
      publishPayload,
    )

    expect(mockConnection.publish).toHaveBeenCalledWith(
      "nova.v2.cells.cell",
      JSON.stringify(publishPayload),
    )
  })

  test("close() closes the underlying connection", async () => {
    const client = new NovaNatsClient(nova)
    await client.connect()
    await client.close()
    expect(mockConnection.close).toHaveBeenCalled()
  })
})
