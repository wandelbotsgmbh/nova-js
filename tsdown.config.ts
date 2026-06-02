/// <reference types="node" />
import { defineConfig } from "tsdown"
import ApiSnapshot from "tsnapi/rolldown"

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/lib/deprecated/v1/index.ts",
    "src/lib/v2/index.ts",
  ],
  format: ["esm", "cjs"],
  clean: true,
  sourcemap: true,
  plugins: [ApiSnapshot({ update: !process.env.CI })],
})
