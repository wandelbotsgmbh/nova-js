import { Nova } from "@wandelbots/nova-js/v2"
import type { AxiosRequestConfig } from "axios"
import { AxiosError } from "axios"
import { afterEach, expect, test, vi } from "vitest"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/**
 * Adapter that always fails the request with a 401 response, simulating a
 * Nova instance rejecting the request due to missing/expired authentication.
 */
function make401Adapter(): AxiosRequestConfig["adapter"] {
  return async (config) => {
    throw new AxiosError(
      "Unauthorized",
      "401",
      config,
      {},
      {
        status: 401,
        statusText: "Unauthorized",
        data: {},
        headers: {},
        config,
      },
    )
  }
}

function stubBrowserWindow(reload: () => void, origin = "https://example.com") {
  vi.stubGlobal("window", {
    location: {
      href: `${origin}/app`,
      origin,
      search: "",
      reload,
    },
    history: {
      replaceState: vi.fn(),
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
  })
}

test("reloads the page to re-authenticate on a 401 when deployed on the instance", async () => {
  const reload = vi.fn()
  // Same origin as the instance -> auth is cookie based, so a reload is used
  // to renew the session.
  stubBrowserWindow(reload, "https://example.com")

  const nova = new Nova({
    instanceUrl: "https://example.com",
    accessToken: "expired-token",
    baseOptions: { adapter: make401Adapter() },
  })

  await expect(
    nova.api.controller.listRobotControllers("cell"),
  ).rejects.toThrow()

  expect(reload).toHaveBeenCalledOnce()
})
