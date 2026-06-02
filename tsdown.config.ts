import { defineConfig } from "tsdown"

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/lib/deprecated/v1/index.ts",
    "src/lib/v2/index.ts",
  ],
  format: ["esm", "cjs"],
  clean: true,
  sourcemap: true,
})
