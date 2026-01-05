import { expect, test } from "vitest"
import { parseNovaInstanceUrl, parseUrl, tryParseUrl } from "../dist"

test("general URL parsing", () => {
  expect(() => parseUrl("example.com")).toThrowError()
  expect(parseUrl("http://example.com/foo")).toEqual(
    new URL("http://example.com/foo"),
  )
  expect(parseUrl("example.com", { defaultScheme: "http" })).toEqual(
    new URL("http://example.com/"),
  )
  expect(parseUrl("https://example.com", { scheme: "http" })).toEqual(
    new URL("http://example.com/"),
  )
  expect(parseUrl("http://example.com", { scheme: "https" })).toEqual(
    new URL("https://example.com/"),
  )

  expect(tryParseUrl("example.com")).toBeUndefined()
  expect(tryParseUrl("http://example.com/foo")).toEqual(
    new URL("http://example.com/foo"),
  )
  expect(tryParseUrl("example.com", { defaultScheme: "http" })).toEqual(
    new URL("http://example.com/"),
  )
  expect(tryParseUrl("https://example.com", { scheme: "http" })).toEqual(
    new URL("http://example.com/"),
  )
  expect(tryParseUrl("http://example.com", { scheme: "https" })).toEqual(
    new URL("https://example.com/"),
  )
})

test("NOVA instance URL parsing", () => {
  expect(parseNovaInstanceUrl("foo.instance.dev.wandelbots.io")).toEqual(
    new URL("https://foo.instance.dev.wandelbots.io/"),
  )
  expect(parseNovaInstanceUrl("http://foo.instance.dev.wandelbots.io")).toEqual(
    new URL("http://foo.instance.dev.wandelbots.io/"),
  )
  expect(parseNovaInstanceUrl("foo.instance.dev.wandelbots.io:3000")).toEqual(
    new URL("http://foo.instance.dev.wandelbots.io:3000"),
  )
  expect(
    parseNovaInstanceUrl("https://foo.instance.dev.wandelbots.io"),
  ).toEqual(new URL("https://foo.instance.dev.wandelbots.io/"))
  expect(parseNovaInstanceUrl("172.168.9.1")).toEqual(
    new URL("http://172.168.9.1"),
  )
})
