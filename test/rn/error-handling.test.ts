import { Nova } from "@wandelbots/nova-js/v2"
import type { AxiosRequestConfig } from "axios"
import { AxiosError } from "axios"
import { expect, test } from "vitest"

/**
 * React Native has no location, so `Nova` does not attach its browser response
 * interceptor there (`hasBrowserLocation` in src/lib/context.ts). A 401 has to
 * reach the caller as the axios error, the way it does in node. Redirecting or
 * reloading the page, and the login flow a 401 starts, all need browser APIs;
 * the browser projects cover that side.
 */

/** Adapter that fails every request with the given status. */
function failingAdapter(status: number): AxiosRequestConfig["adapter"] {
  return async (config) => {
    throw new AxiosError(
      `Request failed with status code ${status}`,
      String(status),
      config,
      {},
      { status, statusText: "", data: {}, headers: {}, config },
    )
  }
}

test("a 401 rejects with the axios error instead of redirecting", async () => {
  const nova = new Nova({
    instanceUrl: "https://example.com",
    accessToken: "expired-token",
    baseOptions: {
      adapter: failingAdapter(401),
    },
  })

  // The interceptor would renew the token and reload the page; `guardedPageReload`
  // reads `window.sessionStorage`, which does not exist here, so a reload
  // attempt would surface as a TypeError. Seeing the original 401 means the
  // interceptor never ran.
  const error: unknown = await nova.api.controller
    .listRobotControllers("cell")
    .then(
      () => null,
      (err: unknown) => err,
    )

  expect(error).toMatchObject({
    isAxiosError: true,
    response: { status: 401 },
  })
})
