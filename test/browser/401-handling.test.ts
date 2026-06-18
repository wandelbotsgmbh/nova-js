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

function stubBrowserWindow(
  reload: () => void,
  origin = "https://example.com",
  sessionStorageData: Record<string, string> = {},
) {
  const sessionStorageStore: Record<string, string> = { ...sessionStorageData }
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
    sessionStorage: {
      getItem: (key: string) => sessionStorageStore[key] ?? null,
      setItem: (key: string, value: string) => {
        sessionStorageStore[key] = value
      },
      removeItem: (key: string) => {
        delete sessionStorageStore[key]
      },
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

  // The request must stay pending while the reload takes effect, otherwise the
  // caller flashes an error state before the page reloads.
  await expectPendingWhileReloading(
    nova.api.controller.listRobotControllers("cell"),
  )

  expect(reload).toHaveBeenCalledOnce()
})

test("throws on a 401 when a reload was already attempted recently (redirect loop guard)", async () => {
  const reload = vi.fn()
  // Simulate a recent reload by pre-populating the reload guard timestamp
  stubBrowserWindow(reload, "https://example.com", {
    "novajs_reload_guard:cloud_instance_auth": String(Date.now()),
  })

  const nova = new Nova({
    instanceUrl: "https://example.com",
    accessToken: "expired-token",
    baseOptions: { adapter: make401Adapter() },
  })

  await expect(
    nova.api.controller.listRobotControllers("cell"),
  ).rejects.toThrow("a reload was already attempted recently")

  expect(reload).not.toHaveBeenCalled()
})
