import fs from "node:fs/promises"

export type PatchLocalEnvOptions = {
  /** Path of the env file to patch. Defaults to `.env.local`. */
  path?: string

  /**
   * Whether to also apply the changes to `process.env`. Defaults to `true`.
   */
  mutateProcessEnv?: boolean

  /** Logger used for progress output. Defaults to `console.log`. */
  log?: (...args: unknown[]) => void
}

/**
 * Update a local dotenv file (`.env.local` by default) with the given env
 * changes, creating it if it doesn't exist. Existing keys are replaced in
 * place; new keys are appended.
 *
 * By default the changes are also applied to `process.env` so they take effect
 * for the current process.
 */
export async function patchLocalEnv(
  changes: Record<string, string>,
  opts: PatchLocalEnvOptions = {},
): Promise<void> {
  const path = opts.path ?? ".env.local"
  const log = opts.log ?? console.log

  log(`Patching ${path} with ${JSON.stringify(changes, null, 2)}`)

  let envFile = ""
  try {
    envFile = await fs.readFile(path, "utf-8")
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      // Doesn't exist yet, which is fine
    } else {
      throw err
    }
  }

  for (const [key, value] of Object.entries(changes)) {
    if (new RegExp(`^${key}=.*$`, "m").test(envFile)) {
      envFile = envFile.replace(
        new RegExp(`^${key}=.*$`, "m"),
        `${key}=${value}`,
      )
    } else {
      envFile += `${envFile.endsWith("\n") || envFile === "" ? "" : "\n"}${key}=${value}\n`
    }
  }

  await fs.writeFile(path, envFile)

  if (opts.mutateProcessEnv ?? true) {
    Object.assign(process.env, changes)
  }
}
