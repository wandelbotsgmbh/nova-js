/**
 * Runtime environment variables.
 *
 * In local dev these come from `.env` / `.env.local` via Vite (VITE_* prefixed
 * variables, inlined at build time).
 *
 * In production on NOVA OS, values are injected at container startup by
 * `scripts/entrypoint.sh`, which writes a `config.js` setting `window.__NOVA_ENV__`
 * before the app loads.
 */

declare global {
  interface Window {
    __NOVA_ENV__?: {
      NOVA_DEV_INSTANCE_URL?: string
      NOVA_DEV_ACCESS_TOKEN?: string
      CELL_ID?: string
    }
  }
}

const runtime =
  (typeof window !== "undefined" && window.__NOVA_ENV__) || undefined

export const env = {
  NODE_ENV: import.meta.env.MODE,
  NOVA_DEV_INSTANCE_URL:
    runtime?.NOVA_DEV_INSTANCE_URL ||
    import.meta.env.VITE_NOVA_DEV_INSTANCE_URL ||
    "",
  NOVA_DEV_ACCESS_TOKEN:
    runtime?.NOVA_DEV_ACCESS_TOKEN ||
    import.meta.env.VITE_NOVA_DEV_ACCESS_TOKEN ||
    "",
  CELL_ID: runtime?.CELL_ID || import.meta.env.VITE_CELL_ID || "cell",
}
