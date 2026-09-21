import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    setupFiles: ["./test/shared/setup.ts"],
    // Only show console output for failing tests
    silent: "passed-only",
    projects: [
      {
        // Browser-like environment with a DOM. Runs the shared tests plus the
        // browser-specific tests, where the Nova client attaches its
        // auth/reload response interceptor.
        extends: true,
        test: {
          name: "browser",
          environment: "jsdom",
          include: ["test/**/*.test.ts"],
          exclude: ["test/server/**", "test/rn/**"],
        },
      },
      {
        // Plain node environment with no `window`. Runs the shared tests plus
        // the server-specific tests, where errors should bubble up rather than
        // being intercepted.
        extends: true,
        test: {
          name: "server",
          environment: "node",
          include: ["test/**/*.test.ts"],
          exclude: ["test/browser/**", "test/rn/**"],
        },
      },
      {
        // React Native execution environment: `window` exists, but it is
        // `global` and has no `location`, no `document` and no web storage.
        // Runs the shared tests plus the React-Native-specific ones
        // (test/rn/setup.ts installs the globals).
        extends: true,
        test: {
          name: "rn",
          environment: "node",
          include: ["test/**/*.test.ts"],
          exclude: ["test/browser/**", "test/server/**"],
          setupFiles: ["./test/shared/setup.ts", "./test/rn/setup.ts"],
        },
      },
    ],
  },
})
