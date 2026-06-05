import type { Configuration as BaseConfiguration } from "@wandelbots/nova-api/v2"
import type { AxiosRequestConfig } from "axios"
import axios, { isAxiosError } from "axios"
import { loginWithAuth0 } from "../../LoginWithAuth0"
import { AutoReconnectingWebsocket } from "../AutoReconnectingWebsocket"
import { availableStorage } from "../availableStorage"
import { isLocalhostDev } from "../context"
import { parseNovaInstanceUrl } from "../converters"
import { NovaAPIClient } from "./NovaAPIClient"
import { MockNovaInstance } from "./mock/MockNovaInstance"

export type NovaConfig = {
  /**
   * Url of the deployed NOVA instance to connect to
   * e.g. https://saeattii.instance.wandelbots.io
   */
  instanceUrl: string

  /**
   * Access token for Bearer authentication.
   * If running on a NOVA instance, this can be automatically retrieved from
   * the current session when omitted.
   */
  accessToken?: string
} & Omit<BaseConfiguration, "isJsonMime" | "basePath">

/**
 *
 * Client for connecting to a NOVA instance and controlling robots.
 */
export class Nova {
  readonly api: NovaAPIClient
  readonly config: NovaConfig
  readonly mock?: MockNovaInstance
  readonly instanceUrl: URL
  authPromise: Promise<string | null> | null = null
  accessToken: string | null = null

  constructor(config: NovaConfig) {
    this.config = config
    this.accessToken =
      config.accessToken ||
      availableStorage.getString("wbjs.access_token") ||
      null

    if (this.config.instanceUrl === "https://mock.example.com") {
      this.mock = new MockNovaInstance()
    }
    this.instanceUrl = parseNovaInstanceUrl(this.config.instanceUrl)

    // Set up Axios instance with interceptor for token fetching
    const axiosInstance = axios.create({
      baseURL: new URL("/api/v2", this.instanceUrl).href,
      // TODO - backend needs to set proper CORS headers for this
      headers: isLocalhostDev
        ? {}
        : {
            // Identify the client to the backend for logging purposes
            "X-Wandelbots-Client": "Wandelbots-Nova-JS-SDK",
          },
    })

    axiosInstance.interceptors.request.use(async (request) => {
      if (!request.headers.Authorization) {
        if (this.accessToken) {
          request.headers.Authorization = `Bearer ${this.accessToken}`
        }
      }
      return request
    })

    if (typeof window !== "undefined") {
      axiosInstance.interceptors.response.use(
        (r) => r,
        async (error) => {
          if (isAxiosError(error)) {
            if (error.response?.status === 401) {
              // If we hit a 401, attempt to login the user and retry with
              // a new access token
              try {
                await this.renewAuthentication()

                if (error.config) {
                  if (this.accessToken) {
                    error.config.headers.Authorization = `Bearer ${this.accessToken}`
                  } else {
                    delete error.config.headers.Authorization
                  }
                  return axiosInstance.request(error.config)
                }
              } catch (err) {
                return Promise.reject(err)
              }
            } else if (error.response?.status === 503) {
              // Check if the server as a whole is down
              const res = await fetch(window.location.href)
              if (res.status === 503) {
                // Go to 503 page
                window.location.reload()
              }
            }
          }

          return Promise.reject(error)
        },
      )
    }

    this.api = new NovaAPIClient({
      ...config,
      basePath: new URL("/api/v2", this.instanceUrl).href,
      isJsonMime: (mime: string) => {
        return mime === "application/json"
      },
      baseOptions: {
        ...(this.mock
          ? ({
              adapter: (config) => {
                if (!this.mock) {
                  throw new Error("Mock adapter used without a mock instance")
                }
                return this.mock.handleAPIRequest(config)
              },
            } satisfies AxiosRequestConfig)
          : {}),
        ...config.baseOptions,
      },
      axiosInstance,
    })
  }

  async renewAuthentication(): Promise<void> {
    if (this.authPromise) {
      // Don't double up
      return
    }

    const storedToken = availableStorage.getString("wbjs.access_token")
    if (storedToken && this.accessToken !== storedToken) {
      // Might be newer than the one we have
      this.accessToken = storedToken
      return
    }

    // Otherwise, perform login flow
    this.authPromise = loginWithAuth0(this.instanceUrl)
    try {
      this.accessToken = await this.authPromise
      if (this.accessToken) {
        // Cache access token so we don't need to log in every refresh
        availableStorage.setString("wbjs.access_token", this.accessToken)
      } else {
        availableStorage.delete("wbjs.access_token")
      }
    } finally {
      this.authPromise = null
    }
  }

  makeWebsocketURL(path: string): string {
    const url = new URL(`/api/v2/${path.replace(/^\/+/, "")}`, this.instanceUrl)
    url.protocol = url.protocol.replace("http", "ws")
    url.protocol = url.protocol.replace("https", "wss")

    if (this.accessToken) {
      url.searchParams.append("token", this.accessToken)
    }

    return url.toString()
  }

  /**
   * Retrieve an AutoReconnectingWebsocket to the given path on the Nova instance.
   * If you explicitly want to reconnect an existing websocket, call `reconnect`
   * on the returned object.
   */
  openReconnectingWebsocket(path: string) {
    return new AutoReconnectingWebsocket(this.makeWebsocketURL(path), {
      mock: this.mock,
    })
  }
}
