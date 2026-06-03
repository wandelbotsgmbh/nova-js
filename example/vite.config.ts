import react from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig, loadEnv } from "vite"

// In production on NOVA OS, the base path is supplied by a runtime env variable
// at container start. We use a placeholder at build time and rewrite it on
// startup (see scripts/entrypoint.sh).
const PROD_BASE_PATH_PLACEHOLDER = "/__REPLACE_ME_BASE_PATH__"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const base =
    mode === "production"
      ? `${PROD_BASE_PATH_PLACEHOLDER}/`
      : `${env.BASE_PATH || ""}/`

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // Ensure transitive imports of @wandelbots/nova-js (e.g. from
      // wandelbots-js-react-components) resolve to the same copy that this
      // app installs. Needed when the workspace nova-js package doesn't
      // satisfy the peer-dep version range and pnpm doesn't hoist it next
      // to react-components in the .pnpm store.
      dedupe: ["@wandelbots/nova-js"],
    },
    server: {
      port: 3000,
    },
    preview: {
      port: 3000,
    },
    define: {
      // Expose selected runtime env vars at build time for local dev.
      // In production, these are injected from the server env at runtime
      // via a small script tag in index.html (see entrypoint.sh).
      "import.meta.env.VITE_NOVA": JSON.stringify(env.NOVA || ""),
      "import.meta.env.VITE_NOVA_DEV_ACCESS_TOKEN": JSON.stringify(
        env.NOVA_DEV_ACCESS_TOKEN || "",
      ),
      "import.meta.env.VITE_CELL_ID": JSON.stringify(env.CELL_ID || "cell"),
    },
  }
})
