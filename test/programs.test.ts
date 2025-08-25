import { describe, it, expect, vi, beforeEach } from "vitest"
import { NovaCellAPIClient } from "../src/lib/v2/NovaCellAPIClient"
import type { ProgramsClient, ProgramRunner } from "../src/lib/v2/ProgramsClient"
import type {
  Program,
  ProgramRun,
} from "@wandelbots/nova-api/v2"

// Mock the nova-api v2
vi.mock("@wandelbots/nova-api/v2", () => ({
  ProgramApi: vi.fn().mockImplementation(() => ({
    listPrograms: vi.fn(),
    getProgram: vi.fn(),
    startProgram: vi.fn(),
    stopProgram: vi.fn(),
  })),
  ApplicationApi: vi.fn(),
  BUSInputsOutputsApi: vi.fn(),
  CellApi: vi.fn(),
  ControllerApi: vi.fn(),
  ControllerInputsOutputsApi: vi.fn(),
  JoggingApi: vi.fn(),
  KinematicsApi: vi.fn(),
  MotionGroupApi: vi.fn(),
  MotionGroupModelsApi: vi.fn(),
  StoreCollisionComponentsApi: vi.fn(),
  StoreCollisionSetupsApi: vi.fn(),
  StoreObjectApi: vi.fn(),
  SystemApi: vi.fn(),
  TrajectoryCachingApi: vi.fn(),
  TrajectoryExecutionApi: vi.fn(),
  TrajectoryPlanningApi: vi.fn(),
  VirtualControllerApi: vi.fn(),
  VirtualControllerBehaviorApi: vi.fn(),
  VirtualControllerInputsOutputsApi: vi.fn(),
}))

interface MockProgramsApi {
  listPrograms: ReturnType<typeof vi.fn>
  getProgram: ReturnType<typeof vi.fn>
  startProgram: ReturnType<typeof vi.fn>
  stopProgram: ReturnType<typeof vi.fn>
}

describe("ProgramsClient", () => {
  let client: NovaCellAPIClient
  let programsClient: ProgramsClient
  let mockProgramsApi: MockProgramsApi

  const mockProgram: Program = {
    program: "test-program",
    name: "Test Program",
    description: "A test program",
    app: "test-app",
    input_schema: { type: "object" },
    preconditions: {},
  }

  const mockProgramRun: ProgramRun = {
    run: "test-run-id",
    program: "test-program",
    state: "RUNNING",
    logs: "Test logs",
    stdout: "Test output",
    stderr: "",
    start_time: "2025-08-25T09:00:00Z",
    input_data: { key: "value" },
  }

  beforeEach(() => {
    vi.clearAllMocks()

    client = new NovaCellAPIClient("test-cell", {
      basePath: "https://test.example.com/api/v2",
      accessToken: "test-token",
      isJsonMime: () => true,
    })

    programsClient = client.programsClient

    // Mock the programs API methods
    mockProgramsApi = {
      listPrograms: vi.fn(),
      getProgram: vi.fn(),
      startProgram: vi.fn(),
      stopProgram: vi.fn(),
    }

    // Replace the API with our mock
    Object.defineProperty(programsClient, "api", {
      get: () => mockProgramsApi,
    })
  })

  describe("list()", () => {
    it("should list all programs", async () => {
      const mockPrograms = [mockProgram]
      mockProgramsApi.listPrograms.mockResolvedValue(mockPrograms)

      const result = await programsClient.list()

      expect(mockProgramsApi.listPrograms).toHaveBeenCalledWith()
      expect(result).toEqual(mockPrograms)
    })

    it("should handle errors when listing programs", async () => {
      const error = new Error("API Error")
      mockProgramsApi.listPrograms.mockRejectedValue(error)

      await expect(programsClient.list()).rejects.toThrow("API Error")
    })
  })

  describe("get()", () => {
    it("should get a specific program", async () => {
      mockProgramsApi.getProgram.mockResolvedValue(mockProgram)

      const result = await programsClient.get("test-program")

      expect(mockProgramsApi.getProgram).toHaveBeenCalledWith("test-program")
      expect(result).toEqual(mockProgram)
    })

    it("should handle errors when getting a program", async () => {
      const error = new Error("Program not found")
      mockProgramsApi.getProgram.mockRejectedValue(error)

      await expect(programsClient.get("non-existent")).rejects.toThrow(
        "Program not found",
      )
    })
  })

  describe("start()", () => {
    it("should start a program with default arguments", async () => {
      mockProgramsApi.startProgram.mockResolvedValue(mockProgramRun)

      const result = await programsClient.start("test-program")

      expect(mockProgramsApi.startProgram).toHaveBeenCalledWith(
        "test-program",
        { arguments: {} },
      )
      expect(result).toEqual(mockProgramRun)
    })

    it("should start a program with custom arguments", async () => {
      const args = { key: "value", count: 5 }
      mockProgramsApi.startProgram.mockResolvedValue(mockProgramRun)

      const result = await programsClient.start("test-program", args)

      expect(mockProgramsApi.startProgram).toHaveBeenCalledWith(
        "test-program",
        { arguments: args },
      )
      expect(result).toEqual(mockProgramRun)
    })

    it("should handle errors when starting a program", async () => {
      const error = new Error("Failed to start program")
      mockProgramsApi.startProgram.mockRejectedValue(error)

      await expect(programsClient.start("test-program")).rejects.toThrow(
        "Failed to start program",
      )
    })
  })

  describe("stop()", () => {
    it("should stop a program", async () => {
      mockProgramsApi.stopProgram.mockResolvedValue(undefined)

      await programsClient.stop("test-program")

      expect(mockProgramsApi.stopProgram).toHaveBeenCalledWith("test-program")
    })

    it("should handle errors when stopping a program", async () => {
      const error = new Error("Failed to stop program")
      mockProgramsApi.stopProgram.mockRejectedValue(error)

      await expect(programsClient.stop("test-program")).rejects.toThrow(
        "Failed to stop program",
      )
    })
  })

  describe("execute()", () => {
    it("should execute a program and return initial run info", async () => {
      const completedRun: ProgramRun = {
        ...mockProgramRun,
        state: "COMPLETED",
      }
      mockProgramsApi.startProgram.mockResolvedValue(completedRun)

      const result = await programsClient.execute("test-program")

      expect(result).toEqual(completedRun)
      expect(mockProgramsApi.startProgram).toHaveBeenCalledWith(
        "test-program",
        { arguments: {} },
      )
    })

    it("should call onStart callback when provided", async () => {
      const preparingRun: ProgramRun = {
        ...mockProgramRun,
        state: "PREPARING",
      }
      mockProgramsApi.startProgram.mockResolvedValue(preparingRun)

      const onStart = vi.fn()
      const result = await programsClient.execute(
        "test-program",
        { speed: 100 },
        { onStart },
      )

      expect(onStart).toHaveBeenCalledWith(preparingRun)
      expect(result).toEqual(preparingRun)
      expect(mockProgramsApi.startProgram).toHaveBeenCalledWith(
        "test-program",
        { arguments: { speed: 100 } },
      )
    })
  })

  describe("forProgram()", () => {
    it("should create a ProgramRunner for a specific program", () => {
      const runner = programsClient.forProgram("test-program")

      expect(runner).toBeDefined()
      expect(typeof runner.getDetails).toBe("function")
      expect(typeof runner.start).toBe("function")
      expect(typeof runner.stop).toBe("function")
      expect(typeof runner.execute).toBe("function")
    })
  })

  describe("api property", () => {
    it("should provide access to the underlying API", () => {
      expect(programsClient.api).toBeDefined()
      expect(typeof programsClient.api.listPrograms).toBe("function")
    })
  })
})

describe("ProgramRunner", () => {
  let programsClient: ProgramsClient
  let programRunner: ProgramRunner
  let mockProgramsApi: MockProgramsApi

  const mockProgram: Program = {
    program: "test-program",
    name: "Test Program",
    description: "A test program",
    app: "test-app",
  }

  const mockProgramRun: ProgramRun = {
    run: "test-run-id",
    program: "test-program",
    state: "RUNNING",
  }

  beforeEach(() => {
    vi.clearAllMocks()

    const client = new NovaCellAPIClient("test-cell", {
      basePath: "https://test.example.com/api/v2",
      accessToken: "test-token",
      isJsonMime: () => true,
    })

    programsClient = client.programsClient

    // Mock the programs API methods
    mockProgramsApi = {
      listPrograms: vi.fn(),
      getProgram: vi.fn(),
      startProgram: vi.fn(),
      stopProgram: vi.fn(),
    }

    // Replace the API with our mock
    Object.defineProperty(programsClient, "api", {
      get: () => mockProgramsApi,
    })

    programRunner = programsClient.forProgram("test-program")
  })

  describe("getDetails()", () => {
    it("should get program details", async () => {
      mockProgramsApi.getProgram.mockResolvedValue(mockProgram)

      const result = await programRunner.getDetails()

      expect(mockProgramsApi.getProgram).toHaveBeenCalledWith("test-program")
      expect(result).toEqual(mockProgram)
    })
  })

  describe("start()", () => {
    it("should start the program", async () => {
      mockProgramsApi.startProgram.mockResolvedValue(mockProgramRun)

      const result = await programRunner.start({ key: "value" })

      expect(mockProgramsApi.startProgram).toHaveBeenCalledWith(
        "test-program",
        { arguments: { key: "value" } },
      )
      expect(result).toEqual(mockProgramRun)
    })

    it("should start with default empty arguments", async () => {
      mockProgramsApi.startProgram.mockResolvedValue(mockProgramRun)

      await programRunner.start()

      expect(mockProgramsApi.startProgram).toHaveBeenCalledWith(
        "test-program",
        { arguments: {} },
      )
    })
  })

  describe("stop()", () => {
    it("should stop the program", async () => {
      mockProgramsApi.stopProgram.mockResolvedValue(undefined)

      await programRunner.stop()

      expect(mockProgramsApi.stopProgram).toHaveBeenCalledWith("test-program")
    })
  })

  describe("execute()", () => {
    it("should execute the program", async () => {
      const completedRun: ProgramRun = {
        ...mockProgramRun,
        state: "COMPLETED",
      }
      mockProgramsApi.startProgram.mockResolvedValue(completedRun)

      const result = await programRunner.execute({ input: "test" })

      expect(mockProgramsApi.startProgram).toHaveBeenCalledWith(
        "test-program",
        { arguments: { input: "test" } },
      )
      expect(result).toEqual(completedRun)
    })

    it("should pass through execution options", async () => {
      const completedRun: ProgramRun = {
        ...mockProgramRun,
        state: "COMPLETED",
      }
      mockProgramsApi.startProgram.mockResolvedValue(completedRun)

      const onStart = vi.fn()
      const result = await programRunner.execute(
        { input: "test" },
        { onStart },
      )

      expect(onStart).toHaveBeenCalledWith(completedRun)
      expect(result).toEqual(completedRun)
    })
  })
})
