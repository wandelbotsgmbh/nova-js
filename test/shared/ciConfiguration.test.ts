import { readFileSync } from "node:fs"
import { expect, test } from "vitest"
import { parse } from "yaml"

test("check workflow reports a stable ci status", () => {
  const workflow = parse(readFileSync(".github/workflows/ci.yml", "utf8")) as {
    jobs: Record<string, { needs?: string | string[]; strategy?: unknown }>
  }

  const ciJob = workflow.jobs.ci
  const testJob = workflow.jobs.test
  expect(ciJob).toBeDefined()
  expect(testJob).toBeDefined()

  if (!(ciJob && testJob)) {
    return
  }

  expect(ciJob.strategy).toBeUndefined()
  expect(ciJob.needs).toEqual(["typecheck", "biome", "knip", "test"])
  expect(testJob.strategy).toBeDefined()
})
