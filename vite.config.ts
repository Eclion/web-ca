import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Cross-origin isolation headers. Required so `SharedArrayBuffer` (and, later,
// wasm threads/atomics) are available in the browser. Applied to both the dev
// server and `vite preview` so behaviour is identical in dev and prod-preview.
// See PRD §5.6.
const crossOriginIsolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

export default defineConfig({
  // Served from the domain root in dev/preview; the GitHub Pages build sets
  // VITE_BASE=/web-ca/ so asset + worker URLs resolve under the project subpath.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: {
    headers: crossOriginIsolationHeaders,
  },
  preview: {
    headers: crossOriginIsolationHeaders,
  },
  worker: {
    format: 'es',
  },
  // wasm-pack emits an ES module + a `.wasm` asset; keep the .wasm out of
  // dependency pre-bundling so its URL resolution works inside the worker.
  optimizeDeps: {
    exclude: ['core-wasm'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
