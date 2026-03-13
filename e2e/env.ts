import fs from "node:fs"
import path from "node:path"

// Load .env.local if present (lightweight dotenv replacement)
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
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

if (!process.env.NOVA) {
  throw new Error(
    "NOVA=... environment variable must be set to target e2e tests.\n" +
      "Set it in .env.local or pass it directly: NOVA=http://... pnpm run e2e",
  )
}

export const env = process.env as NodeJS.ProcessEnv & {
  NOVA: string
}
