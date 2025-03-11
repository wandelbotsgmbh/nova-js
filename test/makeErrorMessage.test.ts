/// <reference types="vite/client" />

import axios, { AxiosError, AxiosHeaders } from "axios"
import { expect, test } from "vitest"
import { makeErrorMessage } from "../dist"

test("making useful error messages", async () => {
  // Error objects take the message
  const someCustomError = new Error("some custom error")
  expect(makeErrorMessage(someCustomError)).toEqual("some custom error")

  // Strings go through unmodified
  expect(makeErrorMessage("some string")).toEqual("some string")

  // Random objects get serialized
  expect(makeErrorMessage({ some: "object" })).toEqual('{"some":"object"}')

  // Axios errors with a response should include the response code
  // and url
  try {
    await axios.get("http://example.com/doesnt-exist")
    expect(true).toBe(false)
  } catch (err) {
    expect(makeErrorMessage(err)).toMatch(
      /^404 Not Found from http:\/\/example.com\/doesnt-exist: /,
    )
  }

  // Not sure how to reproduce CORS errors naturally in vitest environment
  // so let's create it manually
  const networkError = new AxiosError("Network Error", "ERR_NETWORK", {
    url: "http://example.com/some-cors-thing",
    headers: new AxiosHeaders(),
  })
  expect(makeErrorMessage(networkError)).toEqual(
    "Network Error from http://example.com/some-cors-thing. This error can happen because of either connection issues or server CORS policy.",
  )
})
