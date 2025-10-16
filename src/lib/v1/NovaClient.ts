/**
 * @fileoverview
 * @deprecated The nova v1 client is deprecated. Please use the v2 client from `@wandelbots/nova-js/v2` instead.
 */

import type { Configuration as BaseConfiguration } from "@wandelbots/nova-api/v1"
import type { AxiosRequestConfig } from "axios"
import axios, { isAxiosError } from "axios"
import urlJoin from "url-join"
import { loginWithAuth0 } from "../../LoginWithAuth0.js"
import { AutoReconnectingWebsocket } from "../AutoReconnectingWebsocket.js"
import { availableStorage } from "../availableStorage.js"
import { ConnectedMotionGroup } from "./ConnectedMotionGroup.js"
import { JoggerConnection } from "./JoggerConnection.js"
import { MotionStreamConnection } from "./MotionStreamConnection.js"
import { NovaCellAPIClient } from "./NovaCellAPIClient.js"
import { MockNovaInstance } from "./mock/MockNovaInstance.js"

export type NovaClientConfig = {
  /**
   * Url of the deployed Nova instance to connect to
   * e.g. https://saeattii.instance.wandelbots.io
   */
  instanceUrl: string | "https://mock.example.com"

  /**
   * Identifier of the cell on the Nova instance to connect this client to.
   * If omitted, the default identifier "cell" is used.
   **/
  cellId?: string

  /**
   * Username for basic auth to the Nova instance.
   * @deprecated use accessToken instead
   */
  username?: string

  /**
   * Password for basic auth to the Nova instance.
   * @deprecated use accessToken instead
   */
  password?: string

  /**
   * Access token for Bearer authentication.
   */
  accessToken?: string
} & Omit<BaseConfiguration, "isJsonMime" | "basePath">

type NovaClientConfigWithDefaults = NovaClientConfig & { cellId: string }

function permissiveInstanceUrlParse(url: string): string {
  if (!url.startsWith("http")) {
    url = `http://${url}`
  }

  return new URL(url).toString()
}

/**
 * Client for connecting to a Nova instance and controlling robots.
 * @deprecated The nova v1 client is deprecated. Please use the v2 client from `@wandelbots/nova-js/v2` instead.
 */
export class NovaClient {
  readonly api: NovaCellAPIClient
  readonly config: NovaClientConfigWithDefaults
  readonly mock?: MockNovaInstance
  authPromise: Promise<string | null> | null = null
  accessToken: string | null = null

  constructor(config: NovaClientConfig) {
    const cellId = config.cellId ?? "cell"
    this.config = {
      cellId,
      ...config,
    }
    this.accessToken =
      config.accessToken ||
      availableStorage.getString("wbjs.access_token") ||
      null

    if (this.config.instanceUrl === "https://mock.example.com") {
      this.mock = new MockNovaInstance()
    } else {
      this.config.instanceUrl = permissiveInstanceUrlParse(
        this.config.instanceUrl,
      )
    }

    // Set up Axios instance with interceptor for token fetching
    const axiosInstance = axios.create({
      baseURL: urlJoin(this.config.instanceUrl, "/api/v1"),
      // TODO - backend needs to set proper CORS headers for this
      headers:
        typeof window !== "undefined" &&
        window.location.origin.includes("localhost")
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
        } else if (this.config.username && this.config.password) {
          request.headers.Authorization = `Basic ${btoa(`${config.username}:${config.password}`)}`
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

    this.api = new NovaCellAPIClient(cellId, {
      ...config,
      basePath: urlJoin(this.config.instanceUrl, "/api/v1"),
      isJsonMime: (mime: string) => {
        return mime === "application/json"
      },
      baseOptions: {
        ...(this.mock
          ? ({
              adapter: (config) => {
                // biome-ignore lint/style/noNonNullAssertion: legacy code
                return this.mock!.handleAPIRequest(config)
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

    this.authPromise = loginWithAuth0(this.config.instanceUrl)
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
    const url = new URL(
      urlJoin(
        this.config.instanceUrl,
        `/api/v1/cells/${this.config.cellId}`,
        path,
      ),
    )
    url.protocol = url.protocol.replace("http", "ws")
    url.protocol = url.protocol.replace("https", "wss")

    // If provided, add basic auth credentials to the URL
    // NOTE - basic auth is deprecated on websockets and doesn't work in Safari
    // use tokens instead
    if (this.accessToken) {
      url.searchParams.append("token", this.accessToken)
    } else if (this.config.username && this.config.password) {
      url.username = this.config.username
      url.password = this.config.password
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

  /**
   * Connect to the motion state websocket(s) for a given motion group
   */
  async connectMotionStream(motionGroupId: string) {
    return await MotionStreamConnection.open(this, motionGroupId)
  }

  /**
   * Connect to the jogging websocket(s) for a given motion group
   */
  async connectJogger(motionGroupId: string) {
    return await JoggerConnection.open(this, motionGroupId)
  }

  async connectMotionGroups(
    motionGroupIds: string[],
  ): Promise<ConnectedMotionGroup[]> {
    const { instances } = await this.api.controller.listControllers()

    return Promise.all(
      motionGroupIds.map((motionGroupId) =>
        ConnectedMotionGroup.connect(this, motionGroupId, instances),
      ),
    )
  }

  async connectMotionGroup(
    motionGroupId: string,
  ): Promise<ConnectedMotionGroup> {
    const motionGroups = await this.connectMotionGroups([motionGroupId])
    // biome-ignore lint/style/noNonNullAssertion: legacy code
    return motionGroups[0]!
  }
}
