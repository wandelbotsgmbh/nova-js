import { Nova } from "@wandelbots/nova-js/v2"
import type { AxiosRequestConfig } from "axios"
import { AxiosError } from "axios"
import { afterEach, expect, test, vi } from "vitest"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/**
 * Adapter that fails every request with a 403, simulating a Nova instance
 * rejecting the request because the authenticated user lacks the required
 * capability. The `session` endpoint is special-cased to return the provided
 * session response so the access check can be performed. Pass `"403"` as the
 * session response to make the `session` endpoint itself fail with a 403,
 * simulating a user who is not assigned to any cell.
 */
function make403Adapter(
  sessionResponse: unknown,
): AxiosRequestConfig["adapter"] {
  return async (config) => {
    const url = `${config.baseURL ?? ""}${config.url ?? ""}`
    if (url.endsWith("/session") && sessionResponse !== "403") {
      return {
        status: 200,
        statusText: "OK",
        data: sessionResponse,
        headers: {},
        config,
      }
    }

    throw new AxiosError(
      "Forbidden",
      "403",
      config,
      {},
      {
        status: 403,
        statusText: "Forbidden",
        data: {},
        headers: {},
        config,
      },
    )
  }
}

function stubBrowserWindow(origin = "https://example.com") {
  const location = {
    href: `${origin}/app`,
    origin,
    pathname: "/app",
    search: "",
    assign: vi.fn(),
    reload: vi.fn(),
  }
  vi.stubGlobal("window", {
    location,
    history: {
      replaceState: vi.fn(),
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
  })
  return location
}

/**
 * Asserts that the given request promise does not settle within a short
 * window. When we redirect to the access denied screen we deliberately leave
 * the request pending so the caller doesn't flash an error state before the
 * navigation takes effect.
 */
async function expectPendingWhileRedirecting(request: Promise<unknown>) {
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

test("redirects to the access denied screen on a 403 when the session has no capabilities", async () => {
  const location = stubBrowserWindow()

  const nova = new Nova({
    instanceUrl: "https://example.com",
    accessToken: "authenticated-but-unauthorized-token",
    baseOptions: {
      adapter: make403Adapter({
        // A real, authenticated session (not the default unmanaged one) ...
        session_id: "user-session-123",
        user: {},
        // ... but the user has no capabilities, so they have no access
        capabilities: [],
        issued_at: "2026-01-01T00:00:00Z",
        expires_at: "2026-01-01T01:00:00Z",
      }),
    },
  })

  // The error must not bubble, otherwise the caller flashes an error state
  // before the redirect takes effect
  await expectPendingWhileRedirecting(
    nova.api.controller.listRobotControllers("cell"),
  )

  // The user is authenticated but lacks access -> send them to the NOVA
  // instance homescreen, where the access denied screen is rendered
  expect(location.href).toBe("https://example.com/")
})

test("redirects to the access denied screen on a 403 when the session endpoint itself returns a 403", async () => {
  const location = stubBrowserWindow()

  const nova = new Nova({
    instanceUrl: "https://example.com",
    accessToken: "authenticated-but-unassigned-token",
    baseOptions: {
      // The session endpoint now returns a 403 when the user is not assigned
      // to any cell at all, which we treat as equivalent to non-default empty
      // capabilities.
      adapter: make403Adapter("403"),
    },
  })

  // The error must not bubble, otherwise the caller flashes an error state
  // before the redirect takes effect
  await expectPendingWhileRedirecting(
    nova.api.controller.listRobotControllers("cell"),
  )

  expect(location.href).toBe("https://example.com/")
})

test("bubbles a 403 without redirecting on the default unmanaged session", async () => {
  const location = stubBrowserWindow()

  const nova = new Nova({
    instanceUrl: "https://example.com",
    baseOptions: {
      adapter: make403Adapter({
        // The default anonymous session returned by unmanaged instances
        session_id: "default",
        user: {},
        capabilities: [],
        issued_at: "0001-01-01T00:00:00Z",
        expires_at: "0001-01-01T00:00:00Z",
      }),
    },
  })

  await expect(
    nova.api.controller.listRobotControllers("cell"),
  ).rejects.toThrow()

  // Not an access problem we can resolve by redirecting -> bubble as normal
  expect(location.href).toBe("https://example.com/app")
})

test("bubbles a 403 without redirecting when the session has capabilities", async () => {
  const location = stubBrowserWindow()

  const nova = new Nova({
    instanceUrl: "https://example.com",
    accessToken: "authenticated-token",
    baseOptions: {
      adapter: make403Adapter({
        session_id: "user-session-123",
        user: {},
        // The user does have capabilities, so this 403 is for some other
        // specific reason -> bubble it rather than redirecting
        capabilities: [{ capability: "can_access_system" }],
        issued_at: "2026-01-01T00:00:00Z",
        expires_at: "2026-01-01T01:00:00Z",
      }),
    },
  })

  await expect(
    nova.api.controller.listRobotControllers("cell"),
  ).rejects.toThrow()

  expect(location.href).toBe("https://example.com/app")
})
