import type {
  BaseAPI,
  Configuration as BaseConfiguration,
} from "@wandelbots/nova-api/v2"
// Value import used to enumerate the generated API classes at runtime (see constructor below)
import * as novaApiV2 from "@wandelbots/nova-api/v2"
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

type ApiConstructor = new (
  config: BaseConfiguration,
  basePath: string,
  axios: AxiosInstance,
) => BaseAPI

// Generated exports we care about are classes, unlike the Fp/Factory helpers nova-api also exports
function isApiConstructor(value: unknown): value is ApiConstructor {
  return typeof value === "function"
}

// Generated names whose default (Uncapitalize) conversion reads oddly, kept for
// backwards compatibility. Anything not listed here (e.g. a newly added
// "DatasetsApi") falls back to the default rule below and needs no update.
// Exported so apiCoverage.test.ts can verify every other name still looks like
// clean camelCase, since anything ugly here would be a breaking rename later.
export const API_NAME_OVERRIDES = {
  BUSInputsOutputsApi: "busIOs",
  ControllerInputsOutputsApi: "controllerIOs",
  NOVACloudApi: "novaCloud",
  VirtualControllerInputsOutputsApi: "virtualControllerIOs",
} as const satisfies Record<string, string>

// Single source of truth for the "ApplicationApi" -> "application" naming
// convention, shared by the runtime constructor loop and the type below
type ApiPropertyName<Name extends string> =
  Name extends keyof typeof API_NAME_OVERRIDES
    ? (typeof API_NAME_OVERRIDES)[Name]
    : Name extends `${infer Base}Api`
      ? Uncapitalize<Base>
      : never

function toPropertyName(apiName: string): string {
  if (apiName in API_NAME_OVERRIDES) {
    return API_NAME_OVERRIDES[apiName as keyof typeof API_NAME_OVERRIDES]
  }
  const base = apiName.slice(0, -"Api".length)
  return base.charAt(0).toLowerCase() + base.slice(1)
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

// The set of generated API classes, derived from whatever @wandelbots/nova-api
// currently exports, so new sections (e.g. a future DatasetsApi) get typed
// properties here automatically without editing this file
type NovaApiV2Exports = typeof novaApiV2
type GeneratedApiClassName = Extract<keyof NovaApiV2Exports, `${string}Api`>

type GeneratedApiProperties = {
  [K in GeneratedApiClassName as ApiPropertyName<
    K & string
  >]: NovaApiV2Exports[K] extends new (
    // biome-ignore lint/suspicious/noExplicitAny: constructor signature varies per generated API class
    ...args: any[]
  ) => infer Instance
    ? Instance extends BaseAPI
      ? WithUnwrappedAxiosResponse<Instance>
      : never
    : never
}

/**
 * API client providing type-safe access to all the endpoints of a NOVA
 * instance.
 *
 * The endpoints available here (`nova.api.controller`, `nova.api.cell`, etc.)
 * are not listed explicitly in this file: they mirror every `*Api` class
 * exported from `@wandelbots/nova-api/v2`. To see the full list without a
 * TypeScript compiler, check that package's exports directly, or at runtime
 * via `Object.keys(nova.api)`; the property name is that class name with the
 * trailing "Api" removed and the first letter lowercased, except for the
 * overrides listed in API_NAME_OVERRIDES above.
 */
// The generated API properties (application, controller, etc.) are declared
// via this interface merge rather than as class fields, since they're derived
// from a type and assigned dynamically in the constructor below
export interface NovaAPIClient extends GeneratedApiProperties {}

// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: properties are assigned dynamically in the constructor, not declared as class fields
export class NovaAPIClient {
  readonly opts: NovaAPIClientOpts

  constructor(opts: NovaAPIClientOpts) {
    this.opts = opts

    // Discover API classes at runtime instead of hardcoding them, so newly
    // generated sections show up automatically when testing against a dev
    // build of nova-api without needing a NovaAPIClient update first
    for (const [apiName, ApiConstructor] of Object.entries(novaApiV2)) {
      if (!apiName.endsWith("Api") || !isApiConstructor(ApiConstructor)) {
        continue
      }

      const propertyName = toPropertyName(apiName)
      ;(this as Record<string, unknown>)[propertyName] = unwrap(
        ApiConstructor,
        opts,
      )
    }
  }
}
