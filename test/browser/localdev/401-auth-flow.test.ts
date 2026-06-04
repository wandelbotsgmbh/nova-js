import { Nova } from "@wandelbots/nova-js/v2"
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"
import { AxiosError } from "axios"
import { afterEach, expect, test, vi } from "vitest"

const auth0Mocks = vi.hoisted(() => ({
  loginWithRedirect: vi.fn(async () => {}),
  getTokenSilently: vi.fn(async () => "fresh-token"),
  handleRedirectCallback: vi.fn(async () => ({ appState: {} })),
}))

vi.mock("@auth0/auth0-spa-js", () => ({
  Auth0Client: vi.fn(function Auth0Client() {
    return {
      loginWithRedirect: auth0Mocks.loginWithRedirect,
      getTokenSilently: auth0Mocks.getTokenSilently,
      handleRedirectCallback: auth0Mocks.handleRedirectCallback,
    }
  }),
}))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

function stubBrowserWindow(reload: () => void, origin: string) {
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

/**
 * Adapter that returns 401 on the first request then succeeds, capturing the
 * Authorization header sent with each request so we can verify the retry
 * carries the freshly-obtained access token.
 */
function makeRetryAdapter(sentAuthHeaders: (string | undefined)[]) {
  let callCount = 0
  const adapter: AxiosRequestConfig["adapter"] = async (config) => {
    sentAuthHeaders.push(config.headers.Authorization as string | undefined)
    callCount += 1
    if (callCount === 1) {
      throw new AxiosError(
        "Unauthorized",
        "401",
        config as InternalAxiosRequestConfig,
        {},
        {
          status: 401,
          statusText: "Unauthorized",
          data: {},
          headers: {},
          config: config as InternalAxiosRequestConfig,
        },
      )
    }
    return {
      status: 200,
      statusText: "OK",
      data: JSON.stringify({ controllers: [] }),
      headers: {},
      config: config as InternalAxiosRequestConfig,
    }
  }
  return adapter
}

test("runs the Auth0 login flow and retries on a 401 in local dev", async () => {
  const reload = vi.fn()
  // Different origin from the instance (e.g. local dev server) -> full Auth0
  // redirect flow is used rather than cookie auth.
  stubBrowserWindow(reload, "http://localhost:3000")

  const sentAuthHeaders: (string | undefined)[] = []

  const nova = new Nova({
    instanceUrl: "https://saeattii.instance.wandelbots.io",
    accessToken: "expired-token",
    baseOptions: { adapter: makeRetryAdapter(sentAuthHeaders) },
  })

  await nova.api.controller.listRobotControllers("cell")

  // The Auth0 oauth flow was triggered to obtain a new token
  expect(auth0Mocks.loginWithRedirect).toHaveBeenCalledOnce()
  expect(auth0Mocks.getTokenSilently).toHaveBeenCalledOnce()
  // No page reload happens in the cross-origin flow
  expect(reload).not.toHaveBeenCalled()
  // First request used the stale token, retry used the freshly fetched one
  expect(sentAuthHeaders).toEqual([
    "Bearer expired-token",
    "Bearer fresh-token",
  ])
})
