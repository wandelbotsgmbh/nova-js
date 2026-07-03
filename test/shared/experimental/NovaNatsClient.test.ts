import { NovaNatsClient } from "@wandelbots/nova-js/experimental/nats"
import { beforeEach, describe, expect, test, vi } from "vitest"

const { mockConnection, wsconnect } = vi.hoisted(() => {
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
            value: { json: () => ({ name: "cell" }) },
            done: false,
          }
        },
      }
    },
    unsubscribe: vi.fn(),
  }

  const mockConnection = {
    subscribe: vi.fn(() => mockSubscription),
    request: vi.fn(async () => ({ json: () => ({ message: "ok" }) })),
    close: vi.fn(async () => {}),
  }

  const wsconnect = vi.fn(async () => mockConnection)

  return { mockSubscription, mockConnection, wsconnect }
})

vi.mock("@nats-io/nats-core", () => ({ wsconnect }))

describe("NovaNatsClient", () => {
  beforeEach(() => {
    wsconnect.mockClear()
    mockConnection.subscribe.mockClear()
    mockConnection.request.mockClear()
    mockConnection.close.mockClear()
  })

  test("connect() calls wsconnect once and reuses the connection", async () => {
    const client = new NovaNatsClient({ servers: "wss://example.com" })
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

    const client = new NovaNatsClient({ servers: "wss://example.com" })
    const p1 = client.connect()
    const p2 = client.connect()

    resolveConnect(mockConnection)
    const [nc1, nc2] = await Promise.all([p1, p2])

    expect(wsconnect).toHaveBeenCalledTimes(1)
    expect(nc1).toBe(nc2)
  })

  test("close() allows a subsequent connect() to reconnect", async () => {
    const client = new NovaNatsClient({ servers: "wss://example.com" })
    await client.connect()
    await client.close()
    await client.connect()
    expect(wsconnect).toHaveBeenCalledTimes(2)
  })

  test("subscribe() builds the subject and invokes handler with decoded JSON payloads", async () => {
    const client = new NovaNatsClient({ servers: "wss://example.com" })
    const handler = vi.fn()
    await client.subscribe("nova.v2.cells.{cell}", { cell: "cell" }, handler)

    expect(mockConnection.subscribe).toHaveBeenCalledWith("nova.v2.cells.cell")
    // let the async iteration loop run
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(handler).toHaveBeenCalledWith({ name: "cell" }, expect.anything())
  })

  test("request() builds the subject, sends the JSON payload, and returns the decoded reply", async () => {
    const client = new NovaNatsClient({ servers: "wss://example.com" })
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

  test("close() closes the underlying connection", async () => {
    const client = new NovaNatsClient({ servers: "wss://example.com" })
    await client.connect()
    await client.close()
    expect(mockConnection.close).toHaveBeenCalled()
  })
})
