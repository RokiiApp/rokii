import { rmSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-electron-plugin';
import { customStart, loadViteEnv } from 'vite-electron-plugin/plugin';
import renderer from 'vite-plugin-electron-renderer';
import pkg from './package.json';

function debounce<Fn extends (...args: any[]) => void>(
  fn: Fn,
  delay = 299
): Fn {
  let t: NodeJS.Timeout;
  return ((...args: Parameters<Fn>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  }) as Fn;
}

export default defineConfig(({ command }) => {
  rmSync('dist-server', { recursive: true, force: true });

  const sourcemap = command === 'serve' || !!process.env.VSCODE_DEBUG;

  return {
    root: './frontend',
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'frontend', 'index.html'),
          worker: path.resolve(__dirname, 'frontend', 'worker.html')
        }
      }
    },
    resolve: {
      alias: {
        common: path.join(__dirname, 'server', 'common'),
        '@': path.join(__dirname, 'frontend')
      }
    },
    plugins: [
      react(),
      electron({
        outDir: 'dist-server',
        include: ['server'],
        transformOptions: {
          sourcemap
        },
        plugins: [
          ...(process.env.VSCODE_DEBUG
            ? [
                // Will start Electron via VSCode Debug
                customStart(
                  debounce(() =>
                    console.log(
                      /* For `.vscode/.debug.script.mjs` */ '[startup] Electron App'
                    )
                  )
                )
              ]
            : []),
          // Allow use `import.meta.env.VITE_SOME_KEY` in Electron-Main
          loadViteEnv()
        ]
      }),
      // Use Node.js API in the Renderer-process
      renderer({
        nodeIntegration: true,
        optimizeDeps: {
          include: ['fs-extra']
        }
      })
    ],
    server: process.env.VSCODE_DEBUG
      ? (() => {
          const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
          return {
            host: url.hostname,
            port: +url.port
          };
        })()
      : undefined,
    clearScreen: false
  };
});
