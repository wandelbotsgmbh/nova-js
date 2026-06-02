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

type WithUnwrappedAxiosResponse<T> = {
  [P in keyof T]: UnwrapAxiosResponseReturn<T[P]>
}

/**
 * API client providing type-safe access to all the endpoints of a NOVA
 * instance.
 */
export class NovaAPIClient {
  constructor(
    readonly cellId: string,
    readonly opts: BaseConfiguration & {
      axiosInstance?: AxiosInstance
      mock?: boolean
    },
  ) {}

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

  readonly motionGroup = this.withUnwrappedResponsesOnly(MotionGroupApi)
  readonly motionGroupModels =
    this.withUnwrappedResponsesOnly(MotionGroupModelsApi)

  readonly controller = this.withUnwrappedResponsesOnly(ControllerApi)

  readonly controllerIOs = this.withUnwrappedResponsesOnly(
    ControllerInputsOutputsApi,
  )

  readonly trajectoryPlanning = this.withUnwrappedResponsesOnly(
    TrajectoryPlanningApi,
  )
  readonly trajectoryExecution = this.withUnwrappedResponsesOnly(
    TrajectoryExecutionApi,
  )
  readonly trajectoryCaching =
    this.withUnwrappedResponsesOnly(TrajectoryCachingApi)

  readonly application = this.withUnwrappedResponsesOnly(ApplicationApi)
  readonly applicationGlobal = this.withUnwrappedResponsesOnly(ApplicationApi)

  readonly jogging = this.withUnwrappedResponsesOnly(JoggingApi)

  readonly kinematics = this.withUnwrappedResponsesOnly(KinematicsApi)

  readonly busInputsOutputs =
    this.withUnwrappedResponsesOnly(BUSInputsOutputsApi)

  readonly virtualController =
    this.withUnwrappedResponsesOnly(VirtualControllerApi)
  readonly virtualControllerBehavior = this.withUnwrappedResponsesOnly(
    VirtualControllerBehaviorApi,
  )
  readonly virtualControllerIOs = this.withUnwrappedResponsesOnly(
    VirtualControllerInputsOutputsApi,
  )

  readonly storeObject = this.withUnwrappedResponsesOnly(StoreObjectApi)
  readonly storeCollisionComponents = this.withUnwrappedResponsesOnly(
    StoreCollisionComponentsApi,
  )
  readonly storeCollisionSetups = this.withUnwrappedResponsesOnly(
    StoreCollisionSetupsApi,
  )

  readonly program = this.withUnwrappedResponsesOnly(ProgramApi)

  readonly license = this.withUnwrappedResponsesOnly(LicenseApi)
  readonly novaCloud = this.withUnwrappedResponsesOnly(NOVACloudApi)
  readonly robotConfigurations = this.withUnwrappedResponsesOnly(
    RobotConfigurationsApi,
  )
  readonly version = this.withUnwrappedResponsesOnly(VersionApi)
}
