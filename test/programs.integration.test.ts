import { describe, it, expect } from "vitest"
import { NovaCellAPIClient } from "../src/lib/v2/NovaCellAPIClient"

describe("ProgramsClient Integration", () => {
  it("should be accessible from NovaCellAPIClient", () => {
    const client = new NovaCellAPIClient("test-cell", {
      basePath: "https://test.example.com/api/v2",
      accessToken: "test-token",
      isJsonMime: () => true,
    })

    // Test that the programs client is accessible
    expect(client.programsClient).toBeDefined()
    expect(typeof client.programsClient.list).toBe("function")
    expect(typeof client.programsClient.get).toBe("function")
    expect(typeof client.programsClient.start).toBe("function")
    expect(typeof client.programsClient.stop).toBe("function")
    expect(typeof client.programsClient.execute).toBe("function")
    expect(typeof client.programsClient.forProgram).toBe("function")

    // Test that the raw programs API is also accessible
    expect(client.programs).toBeDefined()
    expect(typeof client.programs.listPrograms).toBe("function")
    expect(typeof client.programs.getProgram).toBe("function")
    expect(typeof client.programs.startProgram).toBe("function")
    expect(typeof client.programs.stopProgram).toBe("function")
  })

  it("should create program runners correctly", () => {
    const client = new NovaCellAPIClient("test-cell", {
      basePath: "https://test.example.com/api/v2",
      accessToken: "test-token",
      isJsonMime: () => true,
    })

    const runner = client.programsClient.forProgram("test-program")
    
    expect(runner).toBeDefined()
    expect(typeof runner.getDetails).toBe("function")
    expect(typeof runner.start).toBe("function")
    expect(typeof runner.stop).toBe("function")
    expect(typeof runner.execute).toBe("function")
  })

  it("should provide access to underlying API", () => {
    const client = new NovaCellAPIClient("test-cell", {
      basePath: "https://test.example.com/api/v2",
      accessToken: "test-token",
      isJsonMime: () => true,
    })

    const api = client.programsClient.api
    
    expect(api).toBeDefined()
    expect(typeof api.listPrograms).toBe("function")
    expect(typeof api.getProgram).toBe("function")
    expect(typeof api.startProgram).toBe("function")
    expect(typeof api.stopProgram).toBe("function")
  })
})
