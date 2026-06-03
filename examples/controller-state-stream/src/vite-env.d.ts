/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOVA_DEV_INSTANCE_URL?: string
  readonly VITE_NOVA_DEV_ACCESS_TOKEN?: string
  readonly VITE_CELL_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
