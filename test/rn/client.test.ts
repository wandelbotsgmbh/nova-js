import { availableStorage } from "@wandelbots/nova-js"
import { Nova } from "@wandelbots/nova-js/v2"
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"
import { expect, test } from "vitest"

/**
 * A React Native app imports this library into an environment where `window`
 * exists but has no `location` and no web storage. Reading a property of
 * `window.location` there used to throw while the module was loading, which
 * broke the import itself (reported as "Cannot read property 'hostname' of
 * undefined"). These tests cover the import, the client's first request, and
 * the storage wrapper in that environment.
 */

/**
 * Adapter that answers every request with a canned 200 response, so the tests
 * never touch the network. `onRequest` sees the request as axios built it,
 * including the default headers of the instance.
 */
function stubAdapter(
  data: unknown,
  onRequest?: (config: InternalAxiosRequestConfig) => void,
): AxiosRequestConfig["adapter"] {
  return async (config) => {
    onRequest?.(config)
    return {
      data,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }
  }
}

test("importing and constructing the client works without a location", async () => {
  expect(window.location).toBeUndefined()

  const nova = new Nova({
    instanceUrl: "https://example.com",
    accessToken: "some-token",
    baseOptions: {
      adapter: stubAdapter({ ok: true }),
    },
  })

  // The API client unwraps axios responses, so this resolves to the adapter's
  // `data` rather than to the whole response object.
  await expect(
    nova.api.controller.listRobotControllers("cell"),
  ).resolves.toEqual({ ok: true })
})

test("sends the client identification header", async () => {
  let requestHeaders: Record<string, unknown> = {}

  const nova = new Nova({
    instanceUrl: "https://example.com",
    accessToken: "some-token",
    baseOptions: {
      adapter: stubAdapter({}, (config) => {
        requestHeaders = config.headers as Record<string, unknown>
      }),
    },
  })

  await nova.api.controller.listRobotControllers("cell")

  // Localhost development omits the header; React Native is not localhost
  // development, whatever the host the app talks to.
  expect(requestHeaders["X-Wandelbots-Client"]).toBe("Wandelbots-Nova-JS-SDK")
})

test("reports web storage as unavailable instead of throwing", () => {
  expect(availableStorage.available).toBe(false)
  expect(availableStorage.getString("wbjs.access_token")).toBeNull()
  expect(availableStorage.getJSON("wbjs.access_token")).toBeNull()
})
