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

function unwrap<T extends BaseAPI>(
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

    this.application = unwrap(ApplicationApi, opts)
    this.busIOs = unwrap(BUSInputsOutputsApi, opts)
    this.cell = unwrap(CellApi, opts)
    this.controller = unwrap(ControllerApi, opts)
    this.controllerIOs = unwrap(ControllerInputsOutputsApi, opts)
    this.jogging = unwrap(JoggingApi, opts)
    this.kinematics = unwrap(KinematicsApi, opts)
    this.license = unwrap(LicenseApi, opts)
    this.motionGroup = unwrap(MotionGroupApi, opts)
    this.motionGroupModels = unwrap(MotionGroupModelsApi, opts)
    this.novaCloud = unwrap(NOVACloudApi, opts)
    this.program = unwrap(ProgramApi, opts)
    this.robotConfigurations = unwrap(RobotConfigurationsApi, opts)
    this.session = unwrap(SessionApi, opts)
    this.storeCollisionComponents = unwrap(StoreCollisionComponentsApi, opts)
    this.storeCollisionSetups = unwrap(StoreCollisionSetupsApi, opts)
    this.storeObject = unwrap(StoreObjectApi, opts)
    this.system = unwrap(SystemApi, opts)
    this.trajectoryCaching = unwrap(TrajectoryCachingApi, opts)
    this.trajectoryExecution = unwrap(TrajectoryExecutionApi, opts)
    this.trajectoryPlanning = unwrap(TrajectoryPlanningApi, opts)
    this.version = unwrap(VersionApi, opts)
    this.virtualController = unwrap(VirtualControllerApi, opts)
    this.virtualControllerBehavior = unwrap(VirtualControllerBehaviorApi, opts)
    this.virtualControllerIOs = unwrap(VirtualControllerInputsOutputsApi, opts)
  }
}
