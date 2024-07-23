import type { Configuration } from "@wandelbots/wandelbots-api-client"
import { NovaCellAPIClient } from "./lib/NovaCellAPIClient"
import urlJoin from "url-join"
import { AutoReconnectingWebsocket } from "./lib/AutoReconnectingWebsocket"
import { AxiosRequestConfig } from "axios"
import { JoggerConnection } from "./lib/JoggerConnection"

export type NovaClientConfig = {
  /**
   * Url of the deployed Nova instance to connect to
   * e.g. https://saeattii.instance.wandelbots.io
   */
  instanceUrl: string

  /**
   * Identifier of the cell on the Nova instance to connect this client to.
   * If omitted, the default identifier "cell" is used.
   **/
  cellId?: string

  /**
   * Username for basic auth to the Nova instance.
   */
  username?: string

  /**
   * Password for basic auth to the Nova instance.
   */
  password?: string
} & Omit<Configuration, "isJsonMime" | "basePath">

type NovaClientConfigWithDefaults = NovaClientConfig & { cellId: string }

/**
 * Client for connecting to a Nova instance and controlling robots.
 */
export class NovaClient {
  readonly api: NovaCellAPIClient
  readonly config: NovaClientConfigWithDefaults

  constructor(config: NovaClientConfig) {
    const cellId = config.cellId ?? "cell"
    this.config = {
      cellId,
      ...config,
    }
    this.api = new NovaCellAPIClient(cellId, {
      ...config,
      basePath: urlJoin(this.config.instanceUrl, "/api/v1"),
      // Weird isJsonMime thing to work around bug in autogenerated API types
      isJsonMime: undefined as any,
      baseOptions: {
        ...config.baseOptions,
        // Add basic auth to all axios requests if username and password are provided
        ...(config.username && config.password
          ? ({
              headers: {
                Authorization:
                  "Basic " + btoa(config.username + ":" + config.password),
              },
            } satisfies AxiosRequestConfig)
          : {}),
      },
    })
  }

  /**
   * Given a relative path on the Nova API for this cell, returns an absolute url
   * string suitable for websocket construction.
   */
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
    // TODO - basic auth is deprecated on websockets and doesn't work in Safari
    // need a better solution on the backend
    if (this.config.username && this.config.password) {
      url.username = this.config.username
      url.password = this.config.password
    }

    return url.toString()
  }

  /**
   * Opens an AutoReconnectingWebsocket to the given path on the Nova instance.
   */
  openReconnectingWebsocket(path: string) {
    return new AutoReconnectingWebsocket(this.makeWebsocketURL(path))
  }

  /**
   * Connect to the jogging websocket(s) for a given motion group
   */
  async connectJogger(motionGroupId: string) {
    // Need to figure out how many joints the robot has
    const spec =
      await this.api.motionGroupInfos.getMotionGroupSpecification(motionGroupId)
    return new JoggerConnection(this, motionGroupId, spec.dh_parameters!.length)
  }
}
