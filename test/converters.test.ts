import { expect, test } from "vitest"
import { parseUrl, tryParseUrl } from "../dist"

test("permissive URL parsing", () => {
  expect(() => parseUrl("example.com")).toThrowError()
  expect(parseUrl("http://example.com/foo")).toEqual(new URL("http://example.com/foo"))
  expect(parseUrl("example.com", { defaultScheme: "http" })).toEqual(new URL("http://example.com/"))
  expect(parseUrl("https://example.com", { scheme: "http" })).toEqual(new URL("http://example.com/"))
  expect(parseUrl("http://example.com", { scheme: "https" })).toEqual(new URL("https://example.com/"))

  expect(tryParseUrl("example.com")).toBeUndefined()
  expect(tryParseUrl("http://example.com/foo")).toEqual(new URL("http://example.com/foo"))
  expect(tryParseUrl("example.com", { defaultScheme: "http" })).toEqual(new URL("http://example.com/"))
  expect(tryParseUrl("https://example.com", { scheme: "http" })).toEqual(new URL("http://example.com/"))
  expect(tryParseUrl("http://example.com", { scheme: "https" })).toEqual(new URL("https://example.com/"))
})