import type { Configuration } from "@wandelbots/wandelbots-api-client"
import { ConnectedMotionGroup } from "./lib/ConnectedMotionGroup"
import { NovaCellAPIClient } from "./lib/NovaCellAPIClient"
import urlJoin from "url-join"

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
} & Omit<Configuration, "isJsonMime" | "basePath">

type NovaClientConfigWithDefaults = NovaClientConfig & { cellId: string }

/**
 * Client for connecting to a Nova instance and controlling robots.
 */
export class NovaClient {
  readonly api: NovaCellAPIClient
  readonly config: NovaClientConfigWithDefaults
  constructor(config: NovaClientConfig) {
    this.config = {
      cellId: "cell",
      ...config,
    }
    this.api = new NovaCellAPIClient(this.config.cellId, {
      ...this.config,
      basePath: urlJoin(this.config.instanceUrl, "/api/v1"),
      // Weird isJsonMime thing to work around bug in autogenerated API types
      isJsonMime: undefined as any,
    })
  }

  /**
   * Returns the base path for API requests.
   */
  getBasePath(): string {
    return urlJoin(this.config.instanceUrl, "/api/v1")
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
