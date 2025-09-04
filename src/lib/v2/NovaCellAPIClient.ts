/** biome-ignore-all lint/suspicious/noExplicitAny: legacy code */
/** biome-ignore-all lint/style/noNonNullAssertion: legacy code */
import type { Configuration as BaseConfiguration } from "@wandelbots/nova-api/v2"
import {
  ApplicationApi,
  BUSInputsOutputsApi,
  CellApi,
  ControllerApi,
  ControllerInputsOutputsApi,
  JoggingApi,
  KinematicsApi,
  MotionGroupApi,
  MotionGroupModelsApi,
  ProgramApi,
  StoreCollisionComponentsApi,
  StoreCollisionSetupsApi,
  StoreObjectApi,
  SystemApi,
  TrajectoryCachingApi,
  TrajectoryExecutionApi,
  TrajectoryPlanningApi,
  VirtualControllerApi,
  VirtualControllerBehaviorApi,
  VirtualControllerInputsOutputsApi,
} from "@wandelbots/nova-api/v2"
import type { BaseAPI } from "@wandelbots/nova-api/v2/base"
import type { AxiosInstance } from "axios"
import axios from "axios"
import { ProgramsClient } from "./ProgramsClient.js"

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never

type UnwrapAxiosResponseReturn<T> = T extends (...a: any) => any
  ? (
      ...a: Parameters<T>
    ) => Promise<Awaited<ReturnType<T>> extends { data: infer D } ? D : never>
  : never

export type WithCellId<T> = {
  [P in keyof T]: UnwrapAxiosResponseReturn<OmitFirstArg<T[P]>>
}

export type WithUnwrappedAxiosResponse<T> = {
  [P in keyof T]: UnwrapAxiosResponseReturn<T[P]>
}

/**
 * API client providing type-safe access to all the Nova API REST endpoints
 * associated with a specific cell id.
 */
export class NovaCellAPIClient {
  constructor(
    readonly cellId: string,
    readonly opts: BaseConfiguration & {
      axiosInstance?: AxiosInstance
      mock?: boolean
    },
  ) {}

  /**
   * Some TypeScript sorcery which alters the API class methods so you don't
   * have to pass the cell id to every single one, and de-encapsulates the
   * response data
   */
  private withCellId<T extends BaseAPI>(
    ApiConstructor: new (
      config: BaseConfiguration,
      basePath: string,
      axios: AxiosInstance,
    ) => T,
  ) {
    const apiClient = new ApiConstructor(
      {
        ...this.opts,
        isJsonMime: (mime: string) => {
          return mime === "application/json"
        },
      },
      this.opts.basePath ?? "",
      this.opts.axiosInstance ?? axios.create(),
    ) as {
      [key: string | symbol]: any
    }

    for (const key of Reflect.ownKeys(Reflect.getPrototypeOf(apiClient)!)) {
      if (key !== "constructor" && typeof apiClient[key] === "function") {
        const originalFunction = apiClient[key]
        apiClient[key] = (...args: any[]) => {
          return originalFunction
            .apply(apiClient, [this.cellId, ...args])
            .then((res: any) => res.data)
        }
      }
    }

    return apiClient as WithCellId<T>
  }

  /**
   * As withCellId, but only does the response unwrapping
   */
  private withUnwrappedResponsesOnly<T extends BaseAPI>(
    ApiConstructor: new (
      config: BaseConfiguration,
      basePath: string,
      axios: AxiosInstance,
    ) => T,
  ) {
    const apiClient = new ApiConstructor(
      {
        ...this.opts,
        isJsonMime: (mime: string) => {
          return mime === "application/json"
        },
      },
      this.opts.basePath ?? "",
      this.opts.axiosInstance ?? axios.create(),
    ) as {
      [key: string | symbol]: any
    }

    for (const key of Reflect.ownKeys(Reflect.getPrototypeOf(apiClient)!)) {
      if (key !== "constructor" && typeof apiClient[key] === "function") {
        const originalFunction = apiClient[key]
        apiClient[key] = (...args: any[]) => {
          return originalFunction
            .apply(apiClient, args)
            .then((res: any) => res.data)
        }
      }
    }

    return apiClient as WithUnwrappedAxiosResponse<T>
  }

  readonly system = this.withUnwrappedResponsesOnly(SystemApi)
  readonly cell = this.withUnwrappedResponsesOnly(CellApi)

  readonly motionGroup = this.withCellId(MotionGroupApi)
  readonly motionGroupModels = this.withCellId(MotionGroupModelsApi)

  readonly controller = this.withCellId(ControllerApi)

  readonly controllerIOs = this.withCellId(ControllerInputsOutputsApi)

  readonly trajectoryPlanning = this.withCellId(TrajectoryPlanningApi)
  readonly trajectoryExecution = this.withCellId(TrajectoryExecutionApi)
  readonly trajectoryCaching = this.withCellId(TrajectoryCachingApi)

  readonly programs = this.withCellId(ProgramApi)

  readonly application = this.withCellId(ApplicationApi)
  readonly applicationGlobal = this.withUnwrappedResponsesOnly(ApplicationApi)

  readonly jogging = this.withCellId(JoggingApi)

  readonly kinematics = this.withCellId(KinematicsApi)

  readonly busInputsOutputs = this.withCellId(BUSInputsOutputsApi)

  readonly virtualController = this.withCellId(VirtualControllerApi)
  readonly virtualControllerBehavior = this.withCellId(
    VirtualControllerBehaviorApi,
  )
  readonly virtualControllerIOs = this.withCellId(
    VirtualControllerInputsOutputsApi,
  )

  readonly storeObject = this.withCellId(StoreObjectApi)
  readonly storeCollisionComponents = this.withCellId(
    StoreCollisionComponentsApi,
  )
  readonly storeCollisionSetups = this.withCellId(StoreCollisionSetupsApi)

  // Enhanced programs client with convenient methods
  private _programsClient?: ProgramsClient
  get programsClient(): ProgramsClient {
    if (!this._programsClient) {
      this._programsClient = new ProgramsClient(this)
    }
    return this._programsClient
  }
}
