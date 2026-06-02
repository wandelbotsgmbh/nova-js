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

// biome-ignore lint/suspicious/noExplicitAny: metamagic
type UnwrapAxiosResponseReturn<T> = T extends (...a: any[]) => any
  ? (
      ...a: Parameters<T>
    ) => Promise<Awaited<ReturnType<T>> extends { data: infer D } ? D : never>
  : never

type WithUnwrappedAxiosResponse<T> = {
  [P in keyof T]: UnwrapAxiosResponseReturn<T[P]>
}

type NovaAPIClientOpts = BaseConfiguration & {
  axiosInstance?: AxiosInstance
  mock?: boolean
}

function wrapApi<T extends BaseAPI>(
  ApiConstructor: new (
    config: BaseConfiguration,
    basePath: string,
    axios: AxiosInstance,
  ) => T,
  opts: NovaAPIClientOpts,
): WithUnwrappedAxiosResponse<T> {
  const apiClient = new ApiConstructor(
    {
      ...opts,
      isJsonMime: (mime: string) => mime === "application/json",
    },
    opts.basePath ?? "",
    opts.axiosInstance ?? axios.create(),
  ) as Record<string | symbol, unknown>

  for (const key of Reflect.ownKeys(
    Reflect.getPrototypeOf(apiClient) as object,
  )) {
    if (key !== "constructor" && typeof apiClient[key] === "function") {
      const originalFunction = apiClient[key] as (
        ...args: unknown[]
      ) => Promise<{ data: unknown }>
      apiClient[key] = (...args: unknown[]) =>
        originalFunction.apply(apiClient, args).then((res) => res.data)
    }
  }

  return apiClient as WithUnwrappedAxiosResponse<T>
}

/**
 * API client providing type-safe access to all the endpoints of a NOVA
 * instance.
 */
export class NovaAPIClient {
  readonly opts: NovaAPIClientOpts

  readonly application: WithUnwrappedAxiosResponse<ApplicationApi>
  readonly busIOs: WithUnwrappedAxiosResponse<BUSInputsOutputsApi>
  readonly cell: WithUnwrappedAxiosResponse<CellApi>
  readonly controller: WithUnwrappedAxiosResponse<ControllerApi>
  readonly controllerIOs: WithUnwrappedAxiosResponse<ControllerInputsOutputsApi>
  readonly jogging: WithUnwrappedAxiosResponse<JoggingApi>
  readonly kinematics: WithUnwrappedAxiosResponse<KinematicsApi>
  readonly license: WithUnwrappedAxiosResponse<LicenseApi>
  readonly motionGroup: WithUnwrappedAxiosResponse<MotionGroupApi>
  readonly motionGroupModels: WithUnwrappedAxiosResponse<MotionGroupModelsApi>
  readonly novaCloud: WithUnwrappedAxiosResponse<NOVACloudApi>
  readonly program: WithUnwrappedAxiosResponse<ProgramApi>
  readonly robotConfigurations: WithUnwrappedAxiosResponse<RobotConfigurationsApi>
  readonly session: WithUnwrappedAxiosResponse<SessionApi>
  readonly storeCollisionComponents: WithUnwrappedAxiosResponse<StoreCollisionComponentsApi>
  readonly storeCollisionSetups: WithUnwrappedAxiosResponse<StoreCollisionSetupsApi>
  readonly storeObject: WithUnwrappedAxiosResponse<StoreObjectApi>
  readonly system: WithUnwrappedAxiosResponse<SystemApi>
  readonly trajectoryCaching: WithUnwrappedAxiosResponse<TrajectoryCachingApi>
  readonly trajectoryExecution: WithUnwrappedAxiosResponse<TrajectoryExecutionApi>
  readonly trajectoryPlanning: WithUnwrappedAxiosResponse<TrajectoryPlanningApi>
  readonly version: WithUnwrappedAxiosResponse<VersionApi>
  readonly virtualController: WithUnwrappedAxiosResponse<VirtualControllerApi>
  readonly virtualControllerBehavior: WithUnwrappedAxiosResponse<VirtualControllerBehaviorApi>
  readonly virtualControllerIOs: WithUnwrappedAxiosResponse<VirtualControllerInputsOutputsApi>

  constructor(opts: NovaAPIClientOpts) {
    this.opts = opts

    this.application = wrapApi(ApplicationApi, opts)
    this.busIOs = wrapApi(BUSInputsOutputsApi, opts)
    this.cell = wrapApi(CellApi, opts)
    this.controller = wrapApi(ControllerApi, opts)
    this.controllerIOs = wrapApi(ControllerInputsOutputsApi, opts)
    this.jogging = wrapApi(JoggingApi, opts)
    this.kinematics = wrapApi(KinematicsApi, opts)
    this.license = wrapApi(LicenseApi, opts)
    this.motionGroup = wrapApi(MotionGroupApi, opts)
    this.motionGroupModels = wrapApi(MotionGroupModelsApi, opts)
    this.novaCloud = wrapApi(NOVACloudApi, opts)
    this.program = wrapApi(ProgramApi, opts)
    this.robotConfigurations = wrapApi(RobotConfigurationsApi, opts)
    this.session = wrapApi(SessionApi, opts)
    this.storeCollisionComponents = wrapApi(StoreCollisionComponentsApi, opts)
    this.storeCollisionSetups = wrapApi(StoreCollisionSetupsApi, opts)
    this.storeObject = wrapApi(StoreObjectApi, opts)
    this.system = wrapApi(SystemApi, opts)
    this.trajectoryCaching = wrapApi(TrajectoryCachingApi, opts)
    this.trajectoryExecution = wrapApi(TrajectoryExecutionApi, opts)
    this.trajectoryPlanning = wrapApi(TrajectoryPlanningApi, opts)
    this.version = wrapApi(VersionApi, opts)
    this.virtualController = wrapApi(VirtualControllerApi, opts)
    this.virtualControllerBehavior = wrapApi(VirtualControllerBehaviorApi, opts)
    this.virtualControllerIOs = wrapApi(VirtualControllerInputsOutputsApi, opts)
  }
}
