/** biome-ignore-all lint/suspicious/noExplicitAny: legacy code */
/** biome-ignore-all lint/style/noNonNullAssertion: legacy code */
import type {
  BaseAPI,
  Configuration as BaseConfiguration,
} from "@wandelbots/nova-api/v2"
import {
  ApplicationApi,
  BUSInputsOutputsApi,
  CellApi,
  ControllerApi,
  ControllerInputsOutputsApi,
  JoggingApi,
  KinematicsApi,
  LicenseApi,
  MotionGroupApi,
  MotionGroupModelsApi,
  NOVACloudApi,
  ProgramApi,
  RobotConfigurationsApi,
  SessionApi,
  StoreCollisionComponentsApi,
  StoreCollisionSetupsApi,
  StoreObjectApi,
  SystemApi,
  TrajectoryCachingApi,
  TrajectoryExecutionApi,
  TrajectoryPlanningApi,
  VersionApi,
  VirtualControllerApi,
  VirtualControllerBehaviorApi,
  VirtualControllerInputsOutputsApi,
} from "@wandelbots/nova-api/v2"
import type { AxiosInstance } from "axios"
import axios from "axios"

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never

type UnwrapAxiosResponseReturn<T> = T extends (...a: any) => any
  ? (
      ...a: Parameters<T>
    ) => Promise<Awaited<ReturnType<T>> extends { data: infer D } ? D : never>
  : never

/** @deprecated Use `NovaAPIClient` instead. */
export type WithCellId<T> = {
  [P in keyof T]: UnwrapAxiosResponseReturn<OmitFirstArg<T[P]>>
}

/** @deprecated Use `NovaAPIClient` instead. */
export type WithUnwrappedAxiosResponse<T> = {
  [P in keyof T]: UnwrapAxiosResponseReturn<T[P]>
}

/**
 * API client providing type-safe access to all the Nova API REST endpoints
 * associated with a specific cell id.
 * @deprecated Use `NovaAPIClient` from `@wandelbots/nova-js/v2` instead.
 */
export class NovaCellAPIClient {
  readonly system: WithUnwrappedAxiosResponse<SystemApi>
  readonly cell: WithUnwrappedAxiosResponse<CellApi>
  readonly motionGroup: WithCellId<MotionGroupApi>
  readonly motionGroupModels: WithUnwrappedAxiosResponse<MotionGroupModelsApi>
  readonly controller: WithCellId<ControllerApi>
  readonly controllerIOs: WithCellId<ControllerInputsOutputsApi>
  readonly trajectoryPlanning: WithCellId<TrajectoryPlanningApi>
  readonly trajectoryExecution: WithCellId<TrajectoryExecutionApi>
  readonly trajectoryCaching: WithCellId<TrajectoryCachingApi>
  readonly application: WithCellId<ApplicationApi>
  readonly applicationGlobal: WithUnwrappedAxiosResponse<ApplicationApi>
  readonly jogging: WithCellId<JoggingApi>
  readonly kinematics: WithCellId<KinematicsApi>
  readonly busInputsOutputs: WithCellId<BUSInputsOutputsApi>
  readonly virtualController: WithCellId<VirtualControllerApi>
  readonly virtualControllerBehavior: WithCellId<VirtualControllerBehaviorApi>
  readonly virtualControllerIOs: WithCellId<VirtualControllerInputsOutputsApi>
  readonly storeObject: WithCellId<StoreObjectApi>
  readonly storeCollisionComponents: WithCellId<StoreCollisionComponentsApi>
  readonly storeCollisionSetups: WithCellId<StoreCollisionSetupsApi>
  readonly program: WithCellId<ProgramApi>
  readonly license: WithUnwrappedAxiosResponse<LicenseApi>
  readonly novaCloud: WithUnwrappedAxiosResponse<NOVACloudApi>
  readonly robotConfigurations: WithUnwrappedAxiosResponse<RobotConfigurationsApi>
  readonly version: WithUnwrappedAxiosResponse<VersionApi>
  readonly session: WithUnwrappedAxiosResponse<SessionApi>

  constructor(
    readonly cellId: string,
    readonly opts: BaseConfiguration & {
      axiosInstance?: AxiosInstance
      mock?: boolean
    },
  ) {
    this.system = this.withUnwrappedResponsesOnly(SystemApi)
    this.cell = this.withUnwrappedResponsesOnly(CellApi)
    this.motionGroup = this.withCellId(MotionGroupApi)
    this.motionGroupModels =
      this.withUnwrappedResponsesOnly(MotionGroupModelsApi)
    this.controller = this.withCellId(ControllerApi)
    this.controllerIOs = this.withCellId(ControllerInputsOutputsApi)
    this.trajectoryPlanning = this.withCellId(TrajectoryPlanningApi)
    this.trajectoryExecution = this.withCellId(TrajectoryExecutionApi)
    this.trajectoryCaching = this.withCellId(TrajectoryCachingApi)
    this.application = this.withCellId(ApplicationApi)
    this.applicationGlobal = this.withUnwrappedResponsesOnly(ApplicationApi)
    this.jogging = this.withCellId(JoggingApi)
    this.kinematics = this.withCellId(KinematicsApi)
    this.busInputsOutputs = this.withCellId(BUSInputsOutputsApi)
    this.virtualController = this.withCellId(VirtualControllerApi)
    this.virtualControllerBehavior = this.withCellId(
      VirtualControllerBehaviorApi,
    )
    this.virtualControllerIOs = this.withCellId(
      VirtualControllerInputsOutputsApi,
    )
    this.storeObject = this.withCellId(StoreObjectApi)
    this.storeCollisionComponents = this.withCellId(StoreCollisionComponentsApi)
    this.storeCollisionSetups = this.withCellId(StoreCollisionSetupsApi)
    this.program = this.withCellId(ProgramApi)
    this.license = this.withUnwrappedResponsesOnly(LicenseApi)
    this.novaCloud = this.withUnwrappedResponsesOnly(NOVACloudApi)
    this.robotConfigurations = this.withUnwrappedResponsesOnly(
      RobotConfigurationsApi,
    )
    this.version = this.withUnwrappedResponsesOnly(VersionApi)
    this.session = this.withUnwrappedResponsesOnly(SessionApi)
  }

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
}
