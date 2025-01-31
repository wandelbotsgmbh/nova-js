import type { Configuration as BaseConfiguration } from "@wandelbots/wandelbots-api-client"
import type { AxiosRequestConfig } from "axios"
import axios, { isAxiosError } from "axios"
import urlJoin from "url-join"
import { loginWithAuth0 } from "./LoginWithAuth0.js"
import { AutoReconnectingWebsocket } from "./lib/AutoReconnectingWebsocket"
import { ConnectedMotionGroup } from "./lib/ConnectedMotionGroup"
import { JoggerConnection } from "./lib/JoggerConnection"
import { MotionStreamConnection } from "./lib/MotionStreamConnection"
import { NovaCellAPIClient } from "./lib/NovaCellAPIClient"
import { MockNovaInstance } from "./mock/MockNovaInstance"

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

/**
 * Client for connecting to a Nova instance and controlling robots.
 */
export class NovaClient {
  readonly api: NovaCellAPIClient
  readonly config: NovaClientConfigWithDefaults
  readonly mock?: MockNovaInstance
  accessToken?: string

  constructor(config: NovaClientConfig) {
    const cellId = config.cellId ?? "cell"
    this.config = {
      cellId,
      ...config,
    }
    this.accessToken = config.accessToken

    if (this.config.instanceUrl === "https://mock.example.com") {
      this.mock = new MockNovaInstance()
    }

    // Set up Axios instance with interceptor for token fetching
    const axiosInstance = axios.create({
      baseURL: urlJoin(this.config.instanceUrl, "/api/v1"),
    })

    axiosInstance.interceptors.request.use(async (request) => {
      if (!request.headers.Authorization) {
        if (this.accessToken) {
          request.headers.Authorization = `Bearer ${this.accessToken}`
        } else if (this.config.username && this.config.password) {
          request.headers.Authorization = `Basic ${btoa(config.username + ":" + config.password)}`
        }
      }
      return request
    })

    axiosInstance.interceptors.response.use(
      (r) => r,
      async (error) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          try {
            const token = await this.fetchAccessToken()

            // Retry request with the new token
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${token}`
              return axiosInstance.request(error.config)
            }
          } catch (err) {
            return Promise.reject(err)
          }
        }

        return Promise.reject(error)
      },
    )

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
                return this.mock!.handleAPIRequest(config)
              },
            } satisfies AxiosRequestConfig)
          : {}),
        ...config.baseOptions,
      },
      axiosInstance,
    })
  }

  private async fetchAccessToken(): Promise<string | null> {
    this.accessToken = await loginWithAuth0(this.config.instanceUrl)
    return this.accessToken
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
   * If this client already has an open websocket to the path, the websocket will be
   * reused instead of opening a duplicate one.
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
    return motionGroups[0]!
  }
}
