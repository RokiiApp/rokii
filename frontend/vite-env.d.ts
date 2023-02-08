/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    VSCODE_DEBUG?: "true";
    DIST_ELECTRON: string;
    DIST: string;
    /** /dist/ or /public/ */
    PUBLIC: string;
    readonly ROKI_DATA_PATH: string;
    readonly ROKI_VERSION: string;
  }
}
