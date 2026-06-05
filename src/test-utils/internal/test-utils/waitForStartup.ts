import { delay, makeErrorMessage } from "../../../lib/errorHandling"
import type { Nova } from "../../../lib/v2/Nova"

export type WaitOptions = {
  /** Maximum time to wait before throwing, in milliseconds. */
  timeoutMs?: number

  /** How long to wait between status polls, in milliseconds. Default 5000. */
  pollIntervalMs?: number

  /** Logger used for progress output. Defaults to `console.log`. */
  log?: (...args: unknown[]) => void
}

export type WaitForInstanceOptions = WaitOptions & {
  /**
   * Names of services that must appear in the system status before the
   * instance is considered to have started booting. Useful when the API comes
   * up before all expected services have been registered. Empty by default.
   */
  requiredServices?: string[]
}

/**
 * Polls the system status until all backend services are running.
 *
 * This checks the instance in general, not a specific cell — use
 * {@link waitForCellStartup} for that.
 */
export async function waitForNovaInstanceStartup(
  nova: Nova,
  opts: WaitForInstanceOptions = {},
): Promise<void> {
  const timeout = opts.timeoutMs ?? 60 * 60 * 1000
  const pollInterval = opts.pollIntervalMs ?? 5000
  const requiredServices = opts.requiredServices ?? []
  const log = opts.log ?? console.log
  const startTime = Date.now()
  const instanceUrl = nova.instanceUrl.href

  log("Waiting for NOVA instance to be ready...")

  while (true) {
    try {
      const services = await nova.api.system.getSystemStatus()

      const serviceNames = services.map((s) => s.service)
      const missingServices = requiredServices.filter(
        (s) => !serviceNames.includes(s),
      )

      if (services.length === 0 || missingServices.length > 0) {
        log(
          "Waiting for instance services to appear..." +
            (missingServices.length > 0
              ? ` Need: ${missingServices.join(", ")}`
              : ""),
        )
        await delay(1000)
        continue
      }

      const notRunningServices = services.filter(
        (s) => s.status.code !== "Running",
      )

      if (notRunningServices.length === 0) {
        log(
          `All instance services running: ${services.map((s) => s.service).join(", ")}`,
        )
        break
      }

      log(
        `Waiting for services: ${notRunningServices.map((s) => `${s.service} ${s.status.code}`).join(", ")}`,
      )

      if (Date.now() - startTime > timeout) {
        throw new Error(
          `Timed out after ${timeout}ms waiting for all services to run at ${instanceUrl}. ${notRunningServices.length}/${services.length} services failed to start: ${notRunningServices.map((s) => s.service).join(", ")}`,
        )
      }
    } catch (err) {
      if (Date.now() - startTime > timeout) {
        throw new Error(
          `Timed out after ${timeout}ms waiting for NOVA instance to boot at ${instanceUrl}. ${makeErrorMessage(err)}`,
        )
      }
    }

    await delay(pollInterval)
  }
}

/**
 * Polls the cell status until all services in the cell are running.
 */
export async function waitForCellStartup(
  nova: Nova,
  cellId: string,
  opts: WaitOptions = {},
): Promise<void> {
  const timeout = opts.timeoutMs ?? 360000
  const pollInterval = opts.pollIntervalMs ?? 5000
  const log = opts.log ?? console.log
  const start = Date.now()
  const instanceUrl = nova.instanceUrl.href

  while (true) {
    try {
      const { service_status: services } =
        await nova.api.cell.getCellStatus(cellId)

      if (services.length === 0) {
        log("Waiting for cell services to appear...")
        await delay(1000)
        continue
      }

      const notRunningServices = services.filter(
        (s) => s.status.code !== "Running",
      )

      if (notRunningServices.length === 0) {
        log(
          `All cell services running: ${services.map((s) => s.service).join(", ")}`,
        )
        break
      }

      if (Date.now() - start > timeout) {
        throw new Error(
          `Timed out after ${timeout}ms waiting for ${cellId} services to run at ${instanceUrl}. ${notRunningServices.length}/${services.length} services failed to start: ${notRunningServices.map((s) => s.service).join(", ")}`,
        )
      }

      log(
        `Waiting for cell services: ${notRunningServices.map((s) => `${s.service} ${s.status.code}`).join(", ")}`,
      )
    } catch (err) {
      if (Date.now() - start > timeout) {
        throw new Error(
          `Timed out after ${timeout}ms waiting for ${cellId} services to run at ${instanceUrl}. ${makeErrorMessage(err)}`,
        )
      }
    }

    await delay(pollInterval)
  }
}

/**
 * Polls the cell status until every configured robot controller is running.
 * Returns immediately if the cell has no robot controllers configured.
 */
export async function waitForRobotControllerStartup(
  nova: Nova,
  cellId: string,
  opts: WaitOptions = {},
): Promise<void> {
  const timeout = opts.timeoutMs ?? 60 * 60 * 1000
  const pollInterval = opts.pollIntervalMs ?? 5000
  const log = opts.log ?? console.log
  const start = Date.now()

  const expectedControllers =
    await nova.api.controller.listRobotControllers(cellId)

  if (expectedControllers.length === 0) {
    log("No robot controllers configured, skipping controller startup wait")
    return
  }

  while (true) {
    const { service_status: services } =
      await nova.api.cell.getCellStatus(cellId)

    const runningControllers = new Set(
      services
        .filter(
          (service) =>
            service.group === "RobotController" &&
            service.status.code === "Running",
        )
        .map((service) => service.service),
    )

    const allControllersRunning = expectedControllers.every((controller) =>
      runningControllers.has(controller),
    )

    if (allControllersRunning) {
      log(`All robot controllers running: ${expectedControllers.join(", ")}`)
      break
    }

    if (Date.now() - start > timeout) {
      throw new Error(
        `Timed out after ${timeout}ms waiting for robot controllers to run in cell ${cellId}: ${expectedControllers
          .filter((c) => !runningControllers.has(c))
          .join(", ")}`,
      )
    }

    await delay(pollInterval)
  }
}
