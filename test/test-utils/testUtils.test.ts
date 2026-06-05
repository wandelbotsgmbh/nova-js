import type { InstanceProvider } from "@wandelbots/nova-js/test-utils"
import {
  K8sWaboRunProvider,
  patchLocalEnv,
  PortalProvider,
  testDeploy,
  toSandboxName,
} from "@wandelbots/nova-js/test-utils"
import axios from "axios"
import { mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

describe("toSandboxName", () => {
  test("sanitizes invalid characters", () => {
    expect(toSandboxName("robot-pad:ci:feat/RB-123")).toBe(
      "robot-pad-ci-feat-RB-123",
    )
  })

  test("truncates to 24 chars without trailing dash", () => {
    const name = toSandboxName("a".repeat(20) + ":::extra")
    expect(name.length).toBeLessThanOrEqual(24)
    expect(name).not.toMatch(/-$/)
    expect(name).toMatch(/^[A-Za-z0-9-]*$/)
  })

  test("falls back to a default for empty input", () => {
    expect(toSandboxName(undefined)).toBe("sandbox")
    expect(toSandboxName("///")).toBe("sandbox")
  })
})

describe("K8sWaboRunProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("reserves an instance and decodes the kubeconfig", async () => {
    const getSpy = vi.spyOn(axios, "get").mockResolvedValue({
      data: {
        ip: "1.2.3.4",
        id: "instance-id",
        kubeconfig: Buffer.from("kube: config").toString("base64"),
      },
    })

    const provider = new K8sWaboRunProvider()
    const instance = await provider.reserveInstance({
      lifetimeMins: 30,
      comment: "myapp:dev",
      serviceManagerVersion: "1.2.3",
    })

    expect(instance).toEqual({
      instanceUrl: "http://1.2.3.4",
      instanceId: "instance-id",
      kubeconfig: "kube: config",
    })

    expect(getSpy).toHaveBeenCalledWith("https://k8s.wabo.run/instance", {
      params: {
        duration: 30,
        install_service_manager: true,
        comment: "myapp:dev",
        service_manager_version: "1.2.3",
      },
    })
  })

  test("uses https scheme when configured", async () => {
    vi.spyOn(axios, "get").mockResolvedValue({ data: { ip: "5.6.7.8" } })
    const provider = new K8sWaboRunProvider({ https: true })
    const instance = await provider.reserveInstance({ lifetimeMins: 10 })
    expect(instance.instanceUrl).toBe("https://5.6.7.8")
  })

  test("extendInstance returns false on 404", async () => {
    const error = new axios.AxiosError("not found")
    error.response = { status: 404 } as never
    vi.spyOn(axios, "put").mockRejectedValue(error)
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true)

    const provider = new K8sWaboRunProvider()
    expect(await provider.extendInstance("http://1.2.3.4", 10)).toBe(false)
  })

  test("extendInstance accepts a full URL or bare host", async () => {
    const putSpy = vi.spyOn(axios, "put").mockResolvedValue({ data: {} })
    const provider = new K8sWaboRunProvider()

    await provider.extendInstance("http://1.2.3.4", 20)
    await provider.extendInstance("1.2.3.4", 20)

    expect(putSpy).toHaveBeenNthCalledWith(
      1,
      "https://k8s.wabo.run/instance?instance_ip=1.2.3.4&duration=20",
    )
    expect(putSpy).toHaveBeenNthCalledWith(
      2,
      "https://k8s.wabo.run/instance?instance_ip=1.2.3.4&duration=20",
    )
  })
})

describe("PortalProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("creates an instance via the portal API", async () => {
    const postSpy = vi.spyOn(axios, "post").mockResolvedValue({
      data: {
        host: "https://foo.instance.wandelbots.io",
        instance_id: "portal-id",
        msg: "ok",
      },
    })

    const provider = new PortalProvider({ accessToken: "tok" })
    const instance = await provider.reserveInstance({
      lifetimeMins: 30,
      comment: "novadeck:dev:evan",
    })

    expect(instance).toEqual({
      instanceUrl: "https://foo.instance.wandelbots.io",
      instanceId: "portal-id",
    })

    expect(postSpy).toHaveBeenCalledWith(
      "https://api.portal.dev.wandelbots.io/v1/instances",
      { sandbox_name: "novadeck-dev-evan" },
      {
        headers: {
          Authorization: "Bearer tok",
          "Content-Type": "application/json",
        },
      },
    )
  })
})

describe("patchLocalEnv", () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "nova-js-test-"))
  })

  test("creates a new env file", async () => {
    const path = join(dir, ".env.local")
    await patchLocalEnv(
      { FOO: "1", BAR: "2" },
      { path, mutateProcessEnv: false, log: () => {} },
    )
    const contents = await readFile(path, "utf-8")
    expect(contents).toContain("FOO=1")
    expect(contents).toContain("BAR=2")
  })

  test("replaces existing keys in place and appends new ones", async () => {
    const path = join(dir, ".env.local")
    await writeFile(path, "FOO=old\nKEEP=yes\n")
    await patchLocalEnv(
      { FOO: "new", ADDED: "3" },
      { path, mutateProcessEnv: false, log: () => {} },
    )
    const contents = await readFile(path, "utf-8")
    expect(contents).toContain("FOO=new")
    expect(contents).not.toContain("FOO=old")
    expect(contents).toContain("KEEP=yes")
    expect(contents).toContain("ADDED=3")
  })
})

describe("testDeploy", () => {
  function makeFakeProvider(
    overrides: Partial<InstanceProvider> = {},
  ): InstanceProvider & {
    reserveInstance: ReturnType<typeof vi.fn>
    extendInstance: ReturnType<typeof vi.fn>
    releaseInstance: ReturnType<typeof vi.fn>
  } {
    return {
      name: "fake",
      reserveInstance: vi.fn().mockResolvedValue({
        instanceUrl: "http://1.2.3.4",
        instanceId: "fresh-id",
      }),
      extendInstance: vi.fn().mockResolvedValue(true),
      releaseInstance: vi.fn().mockResolvedValue(undefined),
      ...overrides,
    } as never
  }

  test("reserves a fresh instance and runs setupCell", async () => {
    const dir = await mkdtemp(join(tmpdir(), "nova-js-test-"))
    const provider = makeFakeProvider()
    const setupCell = vi.fn().mockResolvedValue(undefined)
    const onDeployed = vi.fn().mockResolvedValue(undefined)

    const result = await testDeploy({
      provider,
      comment: "myapp:dev",
      waitForInstance: false,
      setupCell,
      onDeployed,
      writeEnv: { path: join(dir, ".env.local") },
      log: () => {},
    })

    expect(provider.reserveInstance).toHaveBeenCalledOnce()
    expect(provider.extendInstance).not.toHaveBeenCalled()
    expect(setupCell).toHaveBeenCalledWith(result.nova, "cell")
    expect(onDeployed).toHaveBeenCalledWith(result.nova, "cell")
    expect(result.instanceUrl).toBe("http://1.2.3.4")
    expect(result.instanceId).toBe("fresh-id")
    expect(result.reused).toBe(false)

    const env = await readFile(join(dir, ".env.local"), "utf-8")
    expect(env).toContain("WANDELAPI_BASE_URL=http://1.2.3.4")
    expect(env).toContain("INSTANCE_ID=fresh-id")
    expect(env).toContain("CELL_ID=cell")
  })

  test("reuse strategy extends an existing instance instead of reserving", async () => {
    const provider = makeFakeProvider()
    const setupCell = vi.fn().mockResolvedValue(undefined)

    const result = await testDeploy({
      provider,
      existingInstance: "http://9.9.9.9",
      existingInstanceStrategy: "reuse",
      skipSetupIfControllersExist: false,
      waitForInstance: false,
      writeEnv: false,
      setupCell,
      log: () => {},
    })

    expect(provider.extendInstance).toHaveBeenCalledWith("http://9.9.9.9", 10)
    expect(provider.reserveInstance).not.toHaveBeenCalled()
    expect(result.reused).toBe(true)
    expect(result.instanceUrl).toBe("http://9.9.9.9")
  })

  test("reuse falls back to reserving when the instance expired", async () => {
    const provider = makeFakeProvider({
      extendInstance: vi.fn().mockResolvedValue(false),
    })

    const result = await testDeploy({
      provider,
      existingInstance: "9.9.9.9",
      existingInstanceStrategy: "reuse",
      waitForInstance: false,
      writeEnv: false,
      setupCell: vi.fn().mockResolvedValue(undefined),
      log: () => {},
    })

    expect(provider.reserveInstance).toHaveBeenCalledOnce()
    expect(result.reused).toBe(false)
    expect(result.instanceUrl).toBe("http://1.2.3.4")
  })

  test("replace strategy releases the existing instance and reserves a fresh one", async () => {
    const provider = makeFakeProvider()

    await testDeploy({
      provider,
      existingInstance: "9.9.9.9",
      existingInstanceStrategy: "replace",
      waitForInstance: false,
      writeEnv: false,
      setupCell: vi.fn().mockResolvedValue(undefined),
      log: () => {},
    })

    expect(provider.releaseInstance).toHaveBeenCalledWith("9.9.9.9")
    expect(provider.extendInstance).not.toHaveBeenCalled()
    expect(provider.reserveInstance).toHaveBeenCalledOnce()
  })

  test("writeEnv can store only the hostname under a custom var", async () => {
    const dir = await mkdtemp(join(tmpdir(), "nova-js-test-"))
    const provider = makeFakeProvider()

    await testDeploy({
      provider,
      waitForInstance: false,
      setupCell: vi.fn().mockResolvedValue(undefined),
      writeEnv: {
        path: join(dir, ".env.local"),
        instanceUrlVar: "API_GATEWAY_BASE",
        instanceUrlAsHostname: true,
      },
      log: () => {},
    })

    const env = await readFile(join(dir, ".env.local"), "utf-8")
    expect(env).toContain("API_GATEWAY_BASE=1.2.3.4")
    expect(env).not.toContain("WANDELAPI_BASE_URL")
  })
})
