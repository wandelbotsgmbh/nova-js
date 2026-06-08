import { Nova } from "@wandelbots/nova-js/v2"
import type { AxiosRequestConfig } from "axios"
import { AxiosError } from "axios"
import { afterEach, expect, test, vi } from "vitest"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/**
 * Adapter that always fails the request with a 503 response, simulating a
 * Nova instance that returns Service Unavailable.
 */
function make503Adapter(): AxiosRequestConfig["adapter"] {
  return async (config) => {
    throw new AxiosError(
      "Service Unavailable",
      "503",
      config,
      {},
      {
        status: 503,
        statusText: "Service Unavailable",
        data: {},
        headers: {},
        config,
      },
    )
  }
}

function stubBrowserWindow(reload: () => void) {
  vi.stubGlobal("window", {
    location: {
      href: "https://example.com/app",
      origin: "https://example.com",
      reload,
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
  })
}

/**
 * Asserts that the given request promise does not settle within a short
 * window. When we reload the page we deliberately leave the request pending so
 * the caller doesn't flash an error state before the reload takes effect.
 */
async function expectPendingWhileReloading(request: Promise<unknown>) {
  const pending = Symbol("pending")
  const outcome = await Promise.race([
    request.then(
      () => "resolved" as const,
      () => "rejected" as const,
    ),
    new Promise<typeof pending>((resolve) =>
      setTimeout(() => resolve(pending), 50),
    ),
  ])
  expect(outcome).toBe(pending)
}

test("reloads the page when a 503 indicates the whole instance is down", async () => {
  const reload = vi.fn()
  stubBrowserWindow(reload)
  // The follow-up check of the page itself also returns 503 -> server is down
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ status: 503 }) as Response),
  )

  const nova = new Nova({
    instanceUrl: "https://example.com",
    baseOptions: { adapter: make503Adapter() },
  })

  // The error must not bubble, otherwise the caller flashes an error state
  // before the reload takes effect
  await expectPendingWhileReloading(
    nova.api.controller.listRobotControllers("cell"),
  )

  expect(fetch).toHaveBeenCalledWith("https://example.com/app")
  expect(reload).toHaveBeenCalledOnce()
})

test("does not reload when a 503 is only for a single request", async () => {
  const reload = vi.fn()
  stubBrowserWindow(reload)
  // The page itself is fine -> only this request hit a 503, don't reload
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ status: 200 }) as Response),
  )

  const nova = new Nova({
    instanceUrl: "https://example.com",
    baseOptions: { adapter: make503Adapter() },
  })

  await expect(
    nova.api.controller.listRobotControllers("cell"),
  ).rejects.toThrow()

  expect(fetch).toHaveBeenCalledWith("https://example.com/app")
  expect(reload).not.toHaveBeenCalled()
})
