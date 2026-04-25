import type {
  Program,
  ProgramRun,
  ProgramRunState,
  ProgramStartRequest,
  ProgramApi,
} from "@wandelbots/nova-api/v2"
import type { NovaCellAPIClient, WithCellId } from "./NovaCellAPIClient.js"

/**
 * Enhanced client for the Programs API providing intuitive program management
 */
export class ProgramsClient {
  constructor(private client: NovaCellAPIClient) {}

  /**
   * Get the underlying programs API for direct access
   */
  get api(): WithCellId<ProgramApi> {
    return this.client.programs
  }

  /**
   * List all programs available in the cell
   */
  async list(): Promise<Program[]> {
    return await this.api.listPrograms()
  }

  /**
   * Get details of a specific program
   */
  async get(programId: string): Promise<Program> {
    return await this.api.getProgram(programId)
  }

  /**
   * Start a program with the given arguments
   */
  async start(
    programId: string,
    args: object = {},
  ): Promise<ProgramRun> {
    const startRequest: ProgramStartRequest = {
      arguments: args,
    }
    return await this.api.startProgram(programId, startRequest)
  }

  /**
   * Stop a running program
   */
  async stop(programId: string): Promise<void> {
    return await this.api.stopProgram(programId)
  }

  /**
   * Execute a program and wait for it to complete
   * 
   * Note: This method has limitations due to current API constraints.
   * Real-time program state tracking will be available via NATS messaging
   * in future versions. For now, this provides basic start functionality.
   * 
   * @param programId - The program identifier
   * @param args - Arguments to pass to the program
   * @param options - Basic execution options
   */
  async execute(
    programId: string,
    args: object = {},
    options: {
      onStart?: (run: ProgramRun) => void
    } = {},
  ): Promise<ProgramRun> {
    const { onStart } = options

    // Start the program
    const run = await this.start(programId, args)
    
    if (onStart) {
      onStart(run)
    }

    // Note: Cannot wait for completion due to API limitations
    // Real-time state tracking will be available via NATS messaging
    return run
  }

  /**
   * Create a program runner helper for a specific program
   */
  forProgram(programId: string): ProgramRunner {
    return new ProgramRunner(this, programId)
  }
}

/**
 * Helper class for managing a specific program
 */
export class ProgramRunner {
  constructor(
    private programs: ProgramsClient,
    private programId: string,
  ) {}

  /**
   * Get program details
   */
  async getDetails(): Promise<Program> {
    return await this.programs.get(this.programId)
  }

  /**
   * Start this program
   */
  async start(args: object = {}): Promise<ProgramRun> {
    return await this.programs.start(this.programId, args)
  }

  /**
   * Stop this program
   */
  async stop(): Promise<void> {
    return await this.programs.stop(this.programId)
  }

  /**
   * Execute this program (start and get initial run information)
   * 
   * Note: This method has limitations due to current API constraints.
   * Real-time program state tracking will be available via NATS messaging
   * in future versions.
   */
  async execute(
    args: object = {},
    options: {
      onStart?: (run: ProgramRun) => void
    } = {},
  ): Promise<ProgramRun> {
    return await this.programs.execute(this.programId, args, options)
  }
}

// Re-export types for convenience
export type {
  Program,
  ProgramRun,
  ProgramRunState,
  ProgramStartRequest,
}
