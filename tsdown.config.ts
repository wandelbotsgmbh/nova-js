/// <reference types="node" />
import { defineConfig } from "tsdown"
import ApiSnapshot from "tsnapi/rolldown"

const entry = [
  "src/index.ts",
  "src/lib/deprecated/v1/index.ts",
  "src/lib/v2/index.ts",
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
