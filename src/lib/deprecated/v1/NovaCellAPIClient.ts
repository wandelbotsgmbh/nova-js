/** biome-ignore-all lint/style/noNonNullAssertion: legacy code */
/** biome-ignore-all lint/suspicious/noExplicitAny: legacy code */
import type {
  BaseAPI,
  Configuration as BaseConfiguration,
} from "@wandelbots/nova-api/v1"
import {
  ApplicationApi,
  CellApi,
  ControllerApi,
  ControllerIOsApi,
  CoordinateSystemsApi,
  DeviceConfigurationApi,
  LibraryProgramApi,
  LibraryProgramMetadataApi,
  LibraryRecipeApi,
  LibraryRecipeMetadataApi,
  MotionApi,
  MotionGroupApi,
  MotionGroupInfosApi,
  MotionGroupJoggingApi,
  MotionGroupKinematicApi,
  ProgramApi,
  ProgramValuesApi,
  StoreCollisionComponentsApi,
  StoreCollisionScenesApi,
  StoreObjectApi,
  SystemApi,
  VirtualRobotApi,
  VirtualRobotBehaviorApi,
  VirtualRobotModeApi,
  VirtualRobotSetupApi,
} from "@wandelbots/nova-api/v1"
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
  readonly deviceConfig: WithCellId<DeviceConfigurationApi>
  readonly motionGroup: WithCellId<MotionGroupApi>
  readonly motionGroupInfos: WithCellId<MotionGroupInfosApi>
  readonly controller: WithCellId<ControllerApi>
  readonly program: WithCellId<ProgramApi>
  readonly programValues: WithCellId<ProgramValuesApi>
  readonly controllerIOs: WithCellId<ControllerIOsApi>
  readonly motionGroupKinematic: WithCellId<MotionGroupKinematicApi>
  readonly motion: WithCellId<MotionApi>
  readonly coordinateSystems: WithCellId<CoordinateSystemsApi>
  readonly application: WithCellId<ApplicationApi>
  readonly applicationGlobal: WithUnwrappedAxiosResponse<ApplicationApi>
  readonly motionGroupJogging: WithCellId<MotionGroupJoggingApi>
  readonly virtualRobot: WithCellId<VirtualRobotApi>
  readonly virtualRobotSetup: WithCellId<VirtualRobotSetupApi>
  readonly virtualRobotMode: WithCellId<VirtualRobotModeApi>
  readonly virtualRobotBehavior: WithCellId<VirtualRobotBehaviorApi>
  readonly libraryProgramMetadata: WithCellId<LibraryProgramMetadataApi>
  readonly libraryProgram: WithCellId<LibraryProgramApi>
  readonly libraryRecipeMetadata: WithCellId<LibraryRecipeMetadataApi>
  readonly libraryRecipe: WithCellId<LibraryRecipeApi>
  readonly storeObject: WithCellId<StoreObjectApi>
  readonly storeCollisionComponents: WithCellId<StoreCollisionComponentsApi>
  readonly storeCollisionScenes: WithCellId<StoreCollisionScenesApi>

  readonly cellId: string
  readonly opts: BaseConfiguration & {
    axiosInstance?: AxiosInstance
    mock?: boolean
  }

  constructor(
    cellId: string,
    opts: BaseConfiguration & {
      axiosInstance?: AxiosInstance
      mock?: boolean
    },
  ) {
    this.cellId = cellId
    this.opts = opts
    this.system = this.withUnwrappedResponsesOnly(SystemApi)
    this.cell = this.withUnwrappedResponsesOnly(CellApi)
    this.deviceConfig = this.withCellId(DeviceConfigurationApi)
    this.motionGroup = this.withCellId(MotionGroupApi)
    this.motionGroupInfos = this.withCellId(MotionGroupInfosApi)
    this.controller = this.withCellId(ControllerApi)
    this.program = this.withCellId(ProgramApi)
    this.programValues = this.withCellId(ProgramValuesApi)
    this.controllerIOs = this.withCellId(ControllerIOsApi)
    this.motionGroupKinematic = this.withCellId(MotionGroupKinematicApi)
    this.motion = this.withCellId(MotionApi)
    this.coordinateSystems = this.withCellId(CoordinateSystemsApi)
    this.application = this.withCellId(ApplicationApi)
    this.applicationGlobal = this.withUnwrappedResponsesOnly(ApplicationApi)
    this.motionGroupJogging = this.withCellId(MotionGroupJoggingApi)
    this.virtualRobot = this.withCellId(VirtualRobotApi)
    this.virtualRobotSetup = this.withCellId(VirtualRobotSetupApi)
    this.virtualRobotMode = this.withCellId(VirtualRobotModeApi)
    this.virtualRobotBehavior = this.withCellId(VirtualRobotBehaviorApi)
    this.libraryProgramMetadata = this.withCellId(LibraryProgramMetadataApi)
    this.libraryProgram = this.withCellId(LibraryProgramApi)
    this.libraryRecipeMetadata = this.withCellId(LibraryRecipeMetadataApi)
    this.libraryRecipe = this.withCellId(LibraryRecipeApi)
    this.storeObject = this.withCellId(StoreObjectApi)
    this.storeCollisionComponents = this.withCellId(StoreCollisionComponentsApi)
    this.storeCollisionScenes = this.withCellId(StoreCollisionScenesApi)
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
