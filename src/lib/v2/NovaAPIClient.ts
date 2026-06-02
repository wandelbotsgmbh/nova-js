import type {
  BaseAPI,
  Configuration as BaseConfiguration,
} from "@wandelbots/nova-api/v2"
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

/**
 * Filters nova-api/v2 exports to just the API class constructors,
 * excluding helper factories and param creators.
 */
type ApiConstructors = {
  [K in keyof typeof novaApiV2 as K extends `${string}Api`
    ? K extends
        | `${string}Factory${string}`
        | `${string}Fp${string}`
        | `${string}ParamCreator${string}`
      ? never
      : K
    : never]: (typeof novaApiV2)[K]
}

/**
 * Lowercases leading uppercase characters to produce a camelCase property name.
 * e.g. "BUSInputsOutputs" -> "busInputsOutputs", "NOVACloud" -> "novaCloud",
 *      "Application" -> "application"
 */
type CamelCase<S extends string> =
  S extends `${Uppercase<infer A>}${Uppercase<infer B>}${infer Rest}`
    ? Rest extends `${Lowercase<string>}${string}`
      ? `${Lowercase<A>}${CamelCase<`${Uppercase<B>}${Rest}`>}`
      : `${Lowercase<A>}${CamelCase<`${Uppercase<B>}${Rest}`>}`
    : Uncapitalize<S>

/**
 * Maps API class names to property names by stripping "Api" and converting
 * the leading acronym to lowercase camelCase.
 */
type ApiProperties = {
  readonly [K in keyof ApiConstructors as K extends `${infer P}Api`
    ? CamelCase<P>
    : never]: ApiConstructors[K] extends new (
    // biome-ignore lint/suspicious/noExplicitAny: needed for contravariant parameter matching
    ...args: any[]
  ) => infer I
    ? WithUnwrappedAxiosResponse<I>
    : never
}

type NovaAPIClientOpts = BaseConfiguration & {
  axiosInstance?: AxiosInstance
  mock?: boolean
}

function isApiClass(
  name: string,
  value: unknown,
): value is new (
  config: BaseConfiguration,
  basePath: string,
  axios: AxiosInstance,
) => BaseAPI {
  return (
    name.endsWith("Api") &&
    typeof value === "function" &&
    !name.includes("Factory") &&
    !name.includes("Fp") &&
    !name.includes("ParamCreator")
  )
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
 * instance. API sections are auto-discovered from @wandelbots/nova-api/v2
 * at runtime, so new sections added upstream are exposed automatically.
 */
export const NovaAPIClient = class NovaAPIClient {
  readonly opts: NovaAPIClientOpts

  constructor(opts: NovaAPIClientOpts) {
    this.opts = opts

    for (const [name, value] of Object.entries(novaApiV2)) {
      if (isApiClass(name, value)) {
        const stripped = name.slice(0, -3)
        // Lowercase leading acronym run: "BUSInputsOutputs" -> "busInputsOutputs"
        let i = 0
        while (
          i < stripped.length &&
          stripped[i] === stripped[i].toUpperCase() &&
          stripped[i] !== stripped[i].toLowerCase()
        ) {
          i++
        }
        // If multiple uppercase chars, keep the last one uppercase (it starts the next word)
        const boundary = i > 1 ? i - 1 : i
        const propName =
          stripped.slice(0, boundary).toLowerCase() + stripped.slice(boundary)
        // biome-ignore lint/suspicious/noExplicitAny: dynamically assigning discovered API properties
        ;(this as any)[propName] = wrapApi(value, opts)
      }
    }
  }
} as {
  new (
    opts: NovaAPIClientOpts,
  ): ApiProperties & {
    readonly cellId: string
    readonly opts: NovaAPIClientOpts
  }
}

export type NovaAPIClient = InstanceType<typeof NovaAPIClient>
