import { makeErrorMessage } from "@wandelbots/nova-js"
import { AxiosError, AxiosHeaders } from "axios"
import { expect, test } from "vitest"

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
  const responseError = new AxiosError(
    "Request failed with status code 404",
    "ERR_BAD_REQUEST",
    {
      url: "http://example.com/doesnt-exist",
      method: "get",
      headers: new AxiosHeaders(),
    },
    {},
    {
      status: 404,
      statusText: "Not Found",
      data: {},
      headers: new AxiosHeaders(),
      config: {
        url: "http://example.com/doesnt-exist",
        method: "get",
        headers: new AxiosHeaders(),
      },
    },
  )
  expect(makeErrorMessage(responseError)).toMatch(
    /^404 Not Found from GET http:\/\/example.com\/doesnt-exist: /,
  )

  // Not sure how to reproduce CORS errors naturally in vitest environment
  // so let's create it manually
  const networkError = new AxiosError("Network Error", "ERR_NETWORK", {
    url: "http://example.com/some-cors-thing",
    method: "post",
    headers: new AxiosHeaders(),
  })
  expect(makeErrorMessage(networkError)).toEqual(
    "Network Error from POST http://example.com/some-cors-thing. This error can happen because of either connection issues or server CORS policy.",
  )
})
