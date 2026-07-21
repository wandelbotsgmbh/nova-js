/// <reference types="node" />
import { defineConfig } from "tsdown"
import ApiSnapshot from "tsnapi/rolldown"

const entry = [
  "src/index.ts",
  "src/v2/index.ts",
  "src/experimental/nats/index.ts",
]

export default defineConfig({
  entry,
  format: "esm",
  clean: true,
  sourcemap: true,
  deps: {
    // Inline the generated nova-api package into our bundle
    // Main reason for this is so AI searching the dist bundle for
    // specific endpoint strings will find them, rather than being
    // confused by the transitive dependency.
    alwaysBundle: ["@wandelbots/nova-api"],
    dts: {
      alwaysBundle: ["@wandelbots/nova-api"],
    },
  },
  plugins: [ApiSnapshot({ update: !process.env.CI })],
})
