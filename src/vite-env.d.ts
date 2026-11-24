/// <reference types="vite/client" />

declare const __BUILD_STAMP__: string

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
