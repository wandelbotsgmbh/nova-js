import fs from "node:fs/promises"
import { makeErrorMessage } from "../errorHandling"
import { Nova } from "../Nova"
import { patchLocalEnv } from "./patchLocalEnv"
import type { InstanceProvider } from "./providers"
import {
  type WaitForInstanceOptions,
  waitForCellStartup,
  waitForNovaInstanceStartup,
} from "./waitForStartup"

/**
 * Controls how instance details get written to a local dotenv file after a
 * deployment, so subsequent dev/test runs can connect to the same instance.
 */
export type WriteEnvOptions = {
  /** Path of the env file to write. Defaults to `.env.local`. */
  path?: string

  /**
   * Name of the env var to store the instance URL in. Defaults to
   * `WANDELAPI_BASE_URL`.
   */
  instanceUrlVar?: string

  /**
   * Store only the hostname/ip in {@link instanceUrlVar} rather than the full
   * URL. Defaults to `false`. Some apps (e.g. novadeck's `API_GATEWAY_BASE`)
   * expect just the host.
   */
  instanceUrlAsHostname?: boolean

  /**
   * Name of the env var to store the instance id in. Defaults to
   * `INSTANCE_ID`. Set to `false` to skip writing the instance id.
   */
  instanceIdVar?: string | false

  /**
   * Name of the env var to store the cell id in. Defaults to `CELL_ID`. Set to
   * `false` to skip writing the cell id.
   */
  cellIdVar?: string | false
}

export type TestDeployOptions = {
  /** Provider used to reserve and manage the NOVA instance. */
  provider: InstanceProvider

  /**
   * Lifetime of a freshly reserved instance, in minutes. Defaults to 10.
   */
  instanceLifetimeMins?: number

  /** Cell id to set up. Defaults to `"cell"`. */
  cellId?: string

  /**
   * Bearer access token used to authenticate the NOVA client against the
   * instance. Required for authenticated instances (e.g. portal).
   */
  accessToken?: string

  /**
   * URL or hostname of an already-reserved instance to consider reusing
   * instead of always reserving a fresh one.
   */
  existingInstance?: string

  /**
   * What to do when {@link existingInstance} is provided:
   * - `"reuse"`: extend its lifetime and connect to it (skips reserving a new
   *   instance). Falls back to reserving a fresh instance if the existing one
   *   has expired. This mirrors robot-pad's behaviour.
   * - `"replace"`: release it and reserve a fresh instance. This mirrors
   *   novadeck's behaviour.
   *
   * Defaults to `"reuse"`.
   */
  existingInstanceStrategy?: "reuse" | "replace"

  /** Comment/label to associate with reserved instances. */
  comment?: string

  /**
   * Whether to install the service manager on reserved instances (k8s only).
   * Defaults to `true`.
   */
  installServiceManager?: boolean

  /** Specific service manager version to install (k8s only). */
  serviceManagerVersion?: string

  /**
   * Options for waiting on instance startup, or `false` to skip the wait.
   */
  waitForInstance?: WaitForInstanceOptions | false

  /**
   * Callback to configure the cell once the instance is up. Receives a
   * connected {@link Nova} client and the cell id. If omitted, an empty cell
   * is created and awaited.
   */
  setupCell?: (nova: Nova, cellId: string) => Promise<void>

  /**
   * When reusing an existing instance that already has robot controllers,
   * skip {@link setupCell}. Defaults to `true`.
   */
  skipSetupIfControllersExist?: boolean

  /**
   * Callback invoked after the cell has been set up, for any additional
   * fixture data (e.g. signals). Receives the connected client and cell id.
   */
  onDeployed?: (nova: Nova, cellId: string) => Promise<void>

  /**
   * Write instance details to a local dotenv file, or `false` to skip.
   * Defaults to writing `.env.local`.
   */
  writeEnv?: WriteEnvOptions | false

  /**
   * Path to write the instance kubeconfig to (if the provider returns one),
   * or `false` to skip. Defaults to `false`.
   */
  kubeconfigPath?: string | false

  /** Logger used for progress output. Defaults to `console.log`. */
  log?: (...args: unknown[]) => void
}

export type TestDeployResult = {
  /** Connected NOVA client for the deployed instance. */
  nova: Nova

  /** Full base URL of the deployed instance. */
  instanceUrl: string

  /** Provider-specific identifier of the instance, if known. */
  instanceId?: string

  /** Cell id that was set up. */
  cellId: string

  /** Whether an existing instance was reused rather than freshly reserved. */
  reused: boolean
}

async function createEmptyCell(
  nova: Nova,
  cellId: string,
  log: (...args: unknown[]) => void,
): Promise<void> {
  log(`Creating empty cell '${cellId}'`)
  await nova.api.cell.updateCell(cellId, { name: cellId })
  await waitForCellStartup(nova, cellId, { log })
}

/**
 * Set up a NOVA instance with a cell for development or e2e testing,
 * abstracting over the underlying instance provider (k8s.wabo.run, portal,
 * etc.) and over the differences between consuming apps via options/callbacks.
 *
 * @example
 * ```ts
 * await testDeploy({
 *   provider: new K8sWaboRunProvider(),
 *   comment: "myapp:dev",
 *   setupCell: (nova, cellId) => makeDefaultCell(nova, cellId),
 * })
 * ```
 */
export async function testDeploy(
  opts: TestDeployOptions,
): Promise<TestDeployResult> {
  const log = opts.log ?? console.log
  const startTime = Date.now()
  const provider = opts.provider
  const cellId = opts.cellId ?? "cell"
  const lifetimeMins = opts.instanceLifetimeMins ?? 10
  const strategy = opts.existingInstanceStrategy ?? "reuse"

  let instanceUrl: string | undefined
  let instanceId: string | undefined
  let reused = false

  if (opts.existingInstance) {
    if (strategy === "reuse" && provider.extendInstance) {
      log(`Found existing instance ${opts.existingInstance}`)
      const extended = await provider.extendInstance(
        opts.existingInstance,
        lifetimeMins,
      )
      if (extended) {
        log(`Extended existing instance for ${lifetimeMins} mins`)
        instanceUrl = /^https?:\/\//.test(opts.existingInstance)
          ? opts.existingInstance
          : `http://${opts.existingInstance}`
        reused = true
      } else {
        log("Existing instance expired, reserving a fresh one")
      }
    } else if (strategy === "replace" && provider.releaseInstance) {
      log(`Releasing existing instance ${opts.existingInstance}`)
      await provider.releaseInstance(opts.existingInstance)
    }
  }

  if (!instanceUrl) {
    log(`Reserving new ${provider.name} instance`)
    const instance = await provider.reserveInstance({
      lifetimeMins,
      comment: opts.comment,
      installServiceManager: opts.installServiceManager,
      serviceManagerVersion: opts.serviceManagerVersion,
    })
    log(`Instance reserved for ${lifetimeMins} mins: ${instance.instanceUrl}`)
    instanceUrl = instance.instanceUrl
    instanceId = instance.instanceId

    if (instance.kubeconfig && opts.kubeconfigPath) {
      await fs.writeFile(opts.kubeconfigPath, instance.kubeconfig)
      log(`Wrote kubeconfig to ${opts.kubeconfigPath}`)
    }
  }

  if (opts.writeEnv !== false) {
    const writeEnv = opts.writeEnv ?? {}
    const url = new URL(instanceUrl)
    const changes: Record<string, string> = {
      [writeEnv.instanceUrlVar ?? "WANDELAPI_BASE_URL"]:
        writeEnv.instanceUrlAsHostname ? url.hostname : instanceUrl,
    }
    if (writeEnv.instanceIdVar !== false && instanceId) {
      changes[writeEnv.instanceIdVar ?? "INSTANCE_ID"] = instanceId
    }
    if (writeEnv.cellIdVar !== false) {
      changes[writeEnv.cellIdVar ?? "CELL_ID"] = cellId
    }
    await patchLocalEnv(changes, { path: writeEnv.path, log })
  }

  const nova = new Nova({
    instanceUrl,
    accessToken: opts.accessToken,
  })

  if (opts.waitForInstance !== false) {
    await waitForNovaInstanceStartup(nova, {
      log,
      ...opts.waitForInstance,
    })
  }

  let skipCellSetup = false
  if (reused && (opts.skipSetupIfControllersExist ?? true)) {
    const controllers = await nova.api.controller
      .listRobotControllers(cellId)
      .catch(() => [] as string[])
    if (controllers.length > 0) {
      log(`Cell '${cellId}' already has robot controllers, skipping cell setup`)
      skipCellSetup = true
    }
  }

  if (!skipCellSetup) {
    if (opts.setupCell) {
      await opts.setupCell(nova, cellId)
    } else {
      await createEmptyCell(nova, cellId, log)
    }
  }

  await opts.onDeployed?.(nova, cellId)

  log(`test deployment completed in ${Date.now() - startTime}ms`)

  return { nova, instanceUrl, instanceId, cellId, reused }
}

/**
 * Convenience wrapper that runs {@link testDeploy} and exits the process with
 * code 1 (after logging a helpful error message) if it throws. Intended for
 * use as the body of a deployment script's `main()`.
 */
export async function runTestDeploy(opts: TestDeployOptions): Promise<void> {
  try {
    await testDeploy(opts)
  } catch (err) {
    console.error(makeErrorMessage(err))
    process.exit(1)
  }
}
