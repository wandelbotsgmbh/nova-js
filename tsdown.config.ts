/// <reference types="node" />
import { defineConfig } from "tsdown"
import ApiSnapshot from "tsnapi/rolldown"

const entry = [
  "src/index.ts",
  "src/v1/index.ts",
  "src/v2/index.ts",
  "src/experimental/nats/index.ts",
]

export default defineConfig([
  {
    entry,
    format: "esm",
    clean: true,
    sourcemap: true,
    plugins: [ApiSnapshot({ update: !process.env.CI })],
  },
  {
    entry,
    format: "cjs",
    clean: true,
    sourcemap: true,
  },
])
