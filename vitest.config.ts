import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.ts"],
    // Only show console output for failing tests
    silent: "passed-only",
  },
})
