import { Nova } from "@wandelbots/nova-js/v2"
import { describe, expect, test } from "vitest"

describe("Nova client makeWebsocketURL", () => {
  test("builds wss URL from https instance", () => {
    const nova = new Nova({ instanceUrl: "https://example.wandelbots.io" })
    expect(nova.makeWebsocketURL("/cells/cell/state-stream")).toBe(
      "wss://example.wandelbots.io/api/v2/cells/cell/state-stream",
    )
  })

  test("builds ws URL from http instance", () => {
    const nova = new Nova({ instanceUrl: "http://localhost:8080" })
    expect(nova.makeWebsocketURL("/cells/cell/state-stream")).toBe(
      "ws://localhost:8080/api/v2/cells/cell/state-stream",
    )
  })

  test("strips leading slashes from path", () => {
    const nova = new Nova({ instanceUrl: "http://localhost" })
    expect(nova.makeWebsocketURL("///cells/cell/foo")).toBe(
      "ws://localhost/api/v2/cells/cell/foo",
    )
  })

  test("works without leading slash", () => {
    const nova = new Nova({ instanceUrl: "http://localhost" })
    expect(nova.makeWebsocketURL("cells/cell/foo")).toBe(
      "ws://localhost/api/v2/cells/cell/foo",
    )
  })

  test("preserves query string in path", () => {
    const nova = new Nova({ instanceUrl: "http://localhost" })
    expect(
      nova.makeWebsocketURL(
        "/cells/cell/motion-groups/0@mock-ur5e/state-stream?tcp=foo",
      ),
    ).toBe(
      "ws://localhost/api/v2/cells/cell/motion-groups/0@mock-ur5e/state-stream?tcp=foo",
    )
  })

  test("appends access token as query param", () => {
    const nova = new Nova({
      instanceUrl: "https://example.wandelbots.io",
      accessToken: "secret-token",
    })
    expect(nova.makeWebsocketURL("/cells/cell/foo")).toBe(
      "wss://example.wandelbots.io/api/v2/cells/cell/foo?token=secret-token",
    )
  })

  test("merges access token with existing query string", () => {
    const nova = new Nova({
      instanceUrl: "http://localhost",
      accessToken: "abc",
    })
    expect(nova.makeWebsocketURL("/cells/cell/foo?tcp=bar")).toBe(
      "ws://localhost/api/v2/cells/cell/foo?tcp=bar&token=abc",
    )
  })
})
