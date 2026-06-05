import axios, { isAxiosError } from "axios"

/**
 * A NOVA instance that has been reserved/created by an {@link InstanceProvider}.
 */
export type ReservedInstance = {
  /**
   * Full base URL of the instance, e.g. `https://1.2.3.4` or
   * `https://foo.instance.wandelbots.io`.
   */
  instanceUrl: string

  /** Provider-specific identifier of the reserved instance, if any. */
  instanceId?: string

  /**
   * Decoded kubeconfig contents for the instance, if the provider supplies
   * one (e.g. k8s.wabo.run). Portal instances do not return a kubeconfig.
   */
  kubeconfig?: string
}

/**
 * Options describing the instance to reserve. Providers ignore any fields they
 * don't support.
 */
export type ReserveInstanceOptions = {
  /** How long the freshly reserved instance should live, in minutes. */
  lifetimeMins: number

  /** Human-readable comment/label to associate with the instance. */
  comment?: string

  /**
   * Whether to install the service manager on the instance. Only relevant for
   * providers that support it (k8s.wabo.run). Defaults to `true`.
   */
  installServiceManager?: boolean

  /**
   * Specific service manager version to install. Only relevant for providers
   * that support it (k8s.wabo.run).
   */
  serviceManagerVersion?: string
}

/**
 * Abstraction over the various services that can hand out a NOVA instance for
 * testing, e.g. k8s.wabo.run or the Wandelbots Portal. Implement this to add
 * support for a new provider.
 */
export interface InstanceProvider {
  /** Short identifier for the provider, used in log output. */
  readonly name: string

  /** Reserve/create a fresh NOVA instance. */
  reserveInstance(opts: ReserveInstanceOptions): Promise<ReservedInstance>

  /**
   * Extend the lifetime of an already-reserved instance so it can be reused.
   * Resolves to `false` if the instance no longer exists, `true` if it was
   * successfully extended. Omit if the provider has no concept of instance
   * lifetimes.
   */
  extendInstance?(
    instanceUrlOrHost: string,
    lifetimeMins: number,
  ): Promise<boolean>

  /**
   * Release/expire an already-reserved instance early. Omit if the provider
   * has no concept of releasing instances.
   */
  releaseInstance?(instanceUrlOrHost: string): Promise<void>
}

/**
 * Extract a bare hostname/ip from either a full URL or an already-bare host.
 */
function toHost(instanceUrlOrHost: string): string {
  try {
    return new URL(instanceUrlOrHost).hostname
  } catch {
    // Not a full URL, assume it's already a bare host/ip
    return instanceUrlOrHost
  }
}

export type K8sWaboRunProviderOptions = {
  /** Base URL of the reservation service. Defaults to `https://k8s.wabo.run`. */
  baseUrl?: string

  /**
   * Whether reserved instance URLs should use `https`. Defaults to `false`
   * (instances are reached over plain http by ip).
   */
  https?: boolean
}

type K8sInstanceResponse = {
  ip: string
  id?: string
  kubeconfig?: string
}

/**
 * Reserves ephemeral NOVA instances from the internal k8s.wabo.run service.
 */
export class K8sWaboRunProvider implements InstanceProvider {
  readonly name = "k8s.wabo.run"
  readonly baseUrl: string
  readonly https: boolean

  constructor(opts: K8sWaboRunProviderOptions = {}) {
    this.baseUrl = opts.baseUrl ?? "https://k8s.wabo.run"
    this.https = opts.https ?? false
  }

  async reserveInstance(
    opts: ReserveInstanceOptions,
  ): Promise<ReservedInstance> {
    const { data: instance } = await axios.get<K8sInstanceResponse>(
      `${this.baseUrl}/instance`,
      {
        params: {
          duration: opts.lifetimeMins,
          install_service_manager: opts.installServiceManager ?? true,
          ...(opts.comment ? { comment: opts.comment } : {}),
          ...(opts.serviceManagerVersion
            ? { service_manager_version: opts.serviceManagerVersion }
            : {}),
        },
      },
    )

    const scheme = this.https ? "https" : "http"
    return {
      instanceUrl: `${scheme}://${instance.ip}`,
      instanceId: instance.id,
      kubeconfig: instance.kubeconfig
        ? Buffer.from(instance.kubeconfig, "base64").toString("utf-8")
        : undefined,
    }
  }

  async extendInstance(
    instanceUrlOrHost: string,
    lifetimeMins: number,
  ): Promise<boolean> {
    const host = toHost(instanceUrlOrHost)
    try {
      await axios.put(
        `${this.baseUrl}/instance?instance_ip=${host}&duration=${lifetimeMins}`,
      )
      return true
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        return false
      }
      throw err
    }
  }

  async releaseInstance(instanceUrlOrHost: string): Promise<void> {
    const host = toHost(instanceUrlOrHost)
    try {
      await axios.put(`${this.baseUrl}/instance?instance_ip=${host}&duration=0`)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        // Already gone, nothing to release
        return
      }
      throw err
    }
  }
}

export type PortalProviderOptions = {
  /**
   * Base URL of the portal API (without trailing slash). Defaults to
   * `https://api.portal.dev.wandelbots.io/v1`.
   */
  baseUrl?: string

  /** Bearer access token used to authenticate against the portal. */
  accessToken: string
}

type PortalInstanceResponse = {
  host: string
  instance_id: string
  msg?: string
}

/**
 * Derive a valid portal `sandbox_name` from an arbitrary comment string.
 * Portal sandbox names must match `^[A-Za-z0-9-]*$` and be at most 24 chars.
 */
export function toSandboxName(comment: string | undefined): string {
  const sanitized = (comment ?? "")
    .replace(/[^A-Za-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24)
    .replace(/-+$/g, "")
  return sanitized || "sandbox"
}

/**
 * Creates NOVA instances via the Wandelbots Portal API.
 *
 * @see https://api.portal.dev.wandelbots.io/v1/ui/#/operations/createInstance
 */
export class PortalProvider implements InstanceProvider {
  readonly name = "portal"
  readonly baseUrl: string
  readonly accessToken: string

  constructor(opts: PortalProviderOptions) {
    this.baseUrl = opts.baseUrl ?? "https://api.portal.dev.wandelbots.io/v1"
    this.accessToken = opts.accessToken
  }

  async reserveInstance(
    opts: ReserveInstanceOptions,
  ): Promise<ReservedInstance> {
    const { data: instance } = await axios.post<PortalInstanceResponse>(
      `${this.baseUrl}/instances`,
      { sandbox_name: toSandboxName(opts.comment) },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    return {
      instanceUrl: instance.host,
      instanceId: instance.instance_id,
    }
  }
}
