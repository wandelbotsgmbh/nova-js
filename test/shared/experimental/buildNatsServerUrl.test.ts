import { buildNatsServerUrl } from "@wandelbots/nova-js/experimental/nats"
import { describe, expect, test } from "vitest"

describe("buildNatsServerUrl", () => {
  test("converts an https instance URL to a wss NATS gateway URL", () => {
    expect(buildNatsServerUrl("https://foo.instance.wandelbots.io")).toBe(
      "wss://foo.instance.wandelbots.io/api/nats",
    )
  })

  test("converts an http instance URL to a ws NATS gateway URL", () => {
    expect(buildNatsServerUrl("http://localhost:8080")).toBe(
      "ws://localhost:8080/api/nats",
    )
  })

  test("defaults to https for *.wandelbots.io hosts given without a scheme", () => {
    expect(buildNatsServerUrl("foo.instance.wandelbots.io")).toBe(
      "wss://foo.instance.wandelbots.io/api/nats",
    )
  })
})
