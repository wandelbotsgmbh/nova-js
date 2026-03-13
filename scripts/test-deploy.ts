import axios, { isAxiosError } from "axios"
import fs from "node:fs"
import fsPromises from "node:fs/promises"
import path from "node:path"

// --- Utilities ---

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function makeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

type ServiceStatus = {
  service: string
  group?: string
  status: {
    code: string
  }
}

type CellServiceStatus = {
  service: string
  group: string
  status: {
    code: string
    severity: string
  }
}

/**
 * Update our .env.local file with the given env changes
 */
async function patchLocalEnv(changes: Record<string, string>) {
  console.log(`Patching .env.local with ${JSON.stringify(changes, null, 2)}`)

  let envLocal = ""
  try {
    envLocal = await fsPromises.readFile(".env.local", "utf-8")
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      // Doesn't exist yet, which is fine
    } else {
      throw err
    }
  }

  for (const [key, value] of Object.entries(changes)) {
    if (envLocal.includes(`${key}=`)) {
      envLocal = envLocal.replace(new RegExp(`${key}=.*`), `${key}=${value}`)
    } else {
      envLocal += `\n${key}=${value}`
    }
  }

  await fsPromises.writeFile(".env.local", envLocal)
  Object.assign(process.env, changes)
}

/**
 * Polls system status until all backend services are running.
 */
async function waitForNovaInstanceStartup(instanceUrl: string) {
  const timeout = 180000
  const startTime = Date.now()
  console.log("Waiting for NOVA instance to be ready...")

  while (true) {
    try {
      const { data: services } = (await axios.get(
        `${instanceUrl}/api/v2/system/status`,
      )) as { data: ServiceStatus[] }

      if (services.length === 0) {
        console.log("Waiting for instance services to appear...")
        await delay(1000)
        continue
      }

      const notRunning = services.filter((s) => s.status.code !== "Running")

      if (notRunning.length === 0) {
        console.log(
          `All instance services running: ${services.map((s) => s.service).join(", ")}`,
        )
        break
      }

      console.log(
        `Waiting for services: ${notRunning.map((s) => `${s.service} ${s.status.code}`).join(", ")}`,
      )

      if (Date.now() - startTime > timeout) {
        throw new Error(
          `Timed out after ${timeout}ms waiting for all services to run at ${instanceUrl}. ${notRunning.length}/${services.length} services failed to start: ${notRunning.map((s) => s.service).join(", ")}`,
        )
      }
    } catch (err) {
      if (Date.now() - startTime > timeout) {
        throw new Error(
          `Timed out after ${timeout}ms waiting for NOVA instance to boot at ${instanceUrl}. ${makeErrorMessage(err)}`,
        )
      }
    }

    await delay(5000)
  }
}

/**
 * Polls cell status until all services are running.
 */
async function waitForCellStartup(
  instanceUrl: string,
  cell: string,
  opts: { timeout?: number } = {},
) {
  const timeout = opts.timeout ?? 180000
  const start = Date.now()

  while (true) {
    try {
      const { data } = await axios.get(
        `${instanceUrl}/api/v2/cells/${cell}/status`,
      )

      const services: CellServiceStatus[] = Array.isArray(data)
        ? data
        : (data?.service_status ?? [])

      if (services.length === 0) {
        console.log("Waiting for cell services to appear...")
        await delay(1000)
        continue
      }

      const notRunning = services.filter((s) => s.status.code !== "Running")

      if (notRunning.length === 0) {
        console.log(
          `All cell services running: ${services.map((s) => s.service).join(", ")}`,
        )
        break
      }

      if (Date.now() - start > timeout) {
        throw new Error(
          `Timed out after ${timeout}ms waiting for ${cell} services to run at ${instanceUrl}. ${notRunning.length}/${services.length} services failed to start: ${notRunning.map((s) => s.service).join(", ")}`,
        )
      } else if (services.length) {
        console.log(
          `Waiting for cell services: ${notRunning.map((s) => `${s.service} ${s.status.code}`).join(", ")}`,
        )
      }
    } catch (err) {
      if (Date.now() - start > timeout) {
        throw new Error(
          `Timed out after ${timeout}ms waiting for ${cell} services to run at ${instanceUrl}. ${makeErrorMessage(err)}`,
        )
      }
    }

    await delay(5000)
  }
}

/**
 * Load .env.local and set any KEY=VALUE pairs into process.env
 */
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, "utf-8").split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex)
    const value = trimmed.slice(eqIndex + 1)
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

// --- Instance provisioning ---

/**
 * Set up a NOVA instance with a testing cell and virtual robots.
 * Used for both development and e2e testing.
 */

const defaultControllers: Record<string, unknown>[] = [
  {
    name: "mock-ur5e",
    configuration: {
      kind: "VirtualController",
      manufacturer: "universalrobots",
      type: "UniversalrobotsUr5e",
      position: "[1.17, -1.57, 1.36, 1.03, 1.29, 1.28, 0]",
    },
  },
]

/**
 * Try to extend the lifetime of an existing instance.
 * Returns the instance URL if successful, undefined otherwise.
 */
async function tryExtendInstance(
  instanceProvider: string,
  instanceIp: string,
  durationMins: number,
): Promise<string | undefined> {
  console.log(`Found existing instance at ${instanceIp}, extending...`)
  try {
    await axios.put(
      `https://${instanceProvider}/instance?instance_ip=${encodeURIComponent(instanceIp)}&duration=${durationMins}`,
    )
    console.log(`Extended existing instance for ${durationMins} mins`)
    return `http://${instanceIp}`
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) {
      console.log("Previous instance expired")
    } else {
      throw err
    }
  }
  return undefined
}

/**
 * Reserve a new instance from the instance provider.
 */
async function reserveNewInstance(
  instanceProvider: string,
  durationMins: number,
): Promise<string> {
  console.log(`Reserving new instance from ${instanceProvider}...`)

  const { data: instance } = await axios.get(
    `https://${instanceProvider}/instance`,
    {
      params: {
        duration: durationMins,
        install_service_manager: true,
      },
    },
  )

  const instanceUrl = `http://${instance.ip}`
  console.log(
    `Instance reserved for ${durationMins} mins: ${instanceUrl} (id: ${instance.id})`,
  )

  if (instance.kubeconfig) {
    const kubeconfig = Buffer.from(instance.kubeconfig, "base64").toString(
      "utf-8",
    )
    await fsPromises.writeFile("kubeconfig.yml", kubeconfig)
    console.log("Wrote kubeconfig.yml")
  }

  return instanceUrl
}

/**
 * Resolve the NOVA instance URL: extend an existing one, or provision a new one.
 * NOVA_INSTANCE_PROVIDER is always required.
 */
async function resolveNovaUrl(opts: {
  existingNovaUrl?: string
  instanceProvider: string
  durationMins: number
}): Promise<string> {
  const { existingNovaUrl, instanceProvider, durationMins } = opts

  // If we already have an instance, try to extend it
  if (existingNovaUrl) {
    const ip = existingNovaUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")
    const extended = await tryExtendInstance(instanceProvider, ip, durationMins)
    if (extended) return extended
    console.log("Could not extend existing instance, provisioning a new one...")
  }

  // Provision a new instance
  return reserveNewInstance(instanceProvider, durationMins)
}

async function testDeploy(opts: { novaUrl: string; cell?: string }) {
  const startTime = Date.now()
  const instanceUrl = opts.novaUrl.replace(/\/+$/, "")
  const cell = opts.cell ?? "cell"

  console.log(`Using NOVA instance at ${instanceUrl}`)

  await patchLocalEnv({ NOVA: instanceUrl })

  // Wait for the API to come up
  await waitForNovaInstanceStartup(instanceUrl)

  // Check if cell already exists
  let cellExists = false
  try {
    const { data } = await axios.get(
      `${instanceUrl}/api/v2/cells/${cell}/status`,
    )
    const services: CellServiceStatus[] = Array.isArray(data)
      ? data
      : (data?.service_status ?? [])

    if (services.length > 0) {
      cellExists = true
      const notRunning = services.filter((s) => s.status.code !== "Running")
      if (notRunning.length === 0) {
        console.log(
          `Cell "${cell}" already exists and all services are running`,
        )
      } else {
        console.log(
          `Cell "${cell}" exists but some services not ready: ${notRunning.map((s) => `${s.service} ${s.status.code}`).join(", ")}`,
        )
      }
    }
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) {
      console.log(`Cell "${cell}" does not exist yet`)
    } else {
      console.log(
        `Could not check cell status: ${makeErrorMessage(err)}, assuming cell needs creation`,
      )
    }
  }

  if (!cellExists) {
    // Create the cell with virtual controllers
    console.log(`Setting up cell "${cell}" with virtual controllers...`)
    try {
      await axios.put(
        `${instanceUrl}/api/v1/internal/cells/${cell}?completionTimeout=360`,
        {
          name: cell,
          controllers: defaultControllers,
        } as Record<string, unknown>,
        { timeout: 400000 },
      )
      console.log(`Cell "${cell}" configured`)
    } catch (err) {
      if (isAxiosError(err)) {
        console.error(
          `Cell setup request failed: ${err.response?.status} ${err.response?.statusText}`,
          err.response?.data,
        )
      }
      throw err
    }
  }

  // Wait for cell services to be fully running
  await waitForCellStartup(instanceUrl, cell, {
    timeout: 180000,
  })

  console.log(`Test deployment completed in ${Date.now() - startTime}ms`)
}

async function main() {
  loadEnvLocal()

  const durationMins = process.env.INSTANCE_LIFETIME_MINS
    ? parseInt(process.env.INSTANCE_LIFETIME_MINS, 10)
    : 720

  const instanceProvider = process.env.NOVA_INSTANCE_PROVIDER
  if (!instanceProvider) {
    console.error(
      "NOVA_INSTANCE_PROVIDER is not set in .env.local.\n" +
        "Set it to your instance provider host to provision or extend instances.",
    )
    process.exit(1)
  }

  const novaUrl = await resolveNovaUrl({
    existingNovaUrl: process.env.NOVA,
    instanceProvider,
    durationMins,
  })

  try {
    await testDeploy({ novaUrl })
    process.exit(0)
  } catch (err) {
    console.error(makeErrorMessage(err))
    process.exit(1)
  }
}

void main()
