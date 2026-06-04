import { Nova } from "@wandelbots/nova-js/v2"
import type { AxiosRequestConfig } from "axios"
import { AxiosError } from "axios"
import { expect, test } from "vitest"

/**
 * Adapter that always fails the request with the given status, simulating a
 * Nova instance returning an error response.
 */
function makeErrorAdapter(status: number): AxiosRequestConfig["adapter"] {
  return async (config) => {
    throw new AxiosError(
      "Error",
      String(status),
      config,
      {},
      {
        status,
        statusText: "Error",
        data: {},
        headers: {},
        config,
      },
    )
  }
}

// In a non-browser environment there is no `window`, so the response
// interceptor that handles 401/503 (auth renewal, page reload) is never
// attached and errors should simply bubble up to the caller.
test("bubbles errors instead of handling them outside the browser", async () => {
  expect(typeof window).toBe("undefined")

  const nova = new Nova({
    instanceUrl: "https://example.com",
    accessToken: "some-token",
    baseOptions: { adapter: makeErrorAdapter(401) },
  })

  await expect(
    nova.api.controller.listRobotControllers("cell"),
  ).rejects.toMatchObject({ response: { status: 401 } })
})
