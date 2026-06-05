/// <reference types="node" />
import { defineConfig } from "tsdown"
import ApiSnapshot from "tsnapi/rolldown"

const entry = [
  "src/index.ts",
  "src/lib/deprecated/v1/index.ts",
  "src/lib/v2/index.ts",
]

// The test-utils entry is built separately so that bundling it (which pulls in
// the v2 `Nova` client) does not hoist shared code out of the main entries and
// perturb their public API snapshots. The entry is given as a map so its output
// keeps the `test-utils/index` path rather than collapsing to `dist/index`.
const testUtilsEntry = { "test-utils/index": "src/test-utils/index.ts" }

export default defineConfig([
  {
    entry,
    format: "esm",
    clean: false,
    sourcemap: true,
    plugins: [ApiSnapshot({ update: !process.env.CI })],
  },
  {
    entry,
    format: "cjs",
    clean: false,
    sourcemap: true,
  },
  {
    entry: testUtilsEntry,
    format: "esm",
    clean: false,
    sourcemap: true,
    plugins: [ApiSnapshot({ update: !process.env.CI })],
  },
  {
    entry: testUtilsEntry,
    format: "cjs",
    clean: false,
    sourcemap: true,
  },
])
