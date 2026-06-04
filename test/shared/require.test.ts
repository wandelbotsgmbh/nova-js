/// <reference types="node" />
import { execFileSync } from "node:child_process"
import { describe, expect, test } from "vitest"

// Test that require(esm) fallback will work in node 20+ once
// we drop CJS builds, for execution contexts like vscode extensions
describe("require(esm) fallback", () => {
  const entries = [
    ["@wandelbots/nova-js", "."],
    ["@wandelbots/nova-js/v1", "./v1"],
    ["@wandelbots/nova-js/v2", "./v2"],
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
