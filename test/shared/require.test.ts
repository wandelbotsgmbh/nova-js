/// <reference types="node" />
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, test } from "vitest"

// Test that require(esm) fallback will work in node 20+ once
// we drop CJS builds, for execution contexts like vscode extensions
describe("require(esm) fallback", () => {
  const entries = [
    ["@wandelbots/nova-js", "."],
    ["@wandelbots/nova-js/v2", "./v2"],
    ["@wandelbots/nova-js/experimental/nats", "./experimental/nats"],
  ] as const

  for (const [specifier] of entries) {
    test(`require("${specifier}") works`, () => {
      // Use Node's self-referencing support to require the package by name,
      // testing that the exports map falls through to the "import" condition
      const result = execFileSync(
        process.execPath,
        [
          "--input-type=commonjs",
          "-e",
          `const mod = require("${specifier}"); console.log(JSON.stringify(Object.keys(mod)))`,
        ],
        {
          encoding: "utf-8",
          cwd: process.cwd(),
        },
      )
      const exports = JSON.parse(result.trim())
      expect(exports).toBeInstanceOf(Array)
      expect(exports.length).toBeGreaterThan(0)
    })
  }
})

test("deprecated APIs are not exported", async () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf-8"))
  expect(packageJson.exports).not.toHaveProperty("./v1")

  const root = await import("@wandelbots/nova-js")
  expect(root).not.toHaveProperty("NovaClient")
  expect(root).not.toHaveProperty("poseToWandelscriptString")
  expect(root).not.toHaveProperty("makeShortErrorMessage")

  const v2 = await import("@wandelbots/nova-js/v2")
  expect(v2).not.toHaveProperty("NovaClient")
  expect(v2).not.toHaveProperty("NovaCellAPIClient")
  expect(v2).not.toHaveProperty("poseToWandelscriptString")
})

test("package exports are ESM-only", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf-8"))

  expect(packageJson.types).toBe("./dist/index.d.mts")
  for (const entry of Object.values(packageJson.exports)) {
    expect(entry).toEqual({
      default: expect.stringMatching(/\.mjs$/),
      types: expect.stringMatching(/\.d\.mts$/),
    })
  }
})
