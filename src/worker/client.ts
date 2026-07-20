import * as Comlink from 'comlink';
import type { SimWorkerApi } from './sim.worker.ts';

/**
 * Spawn the simulation worker and wrap it with a Comlink proxy.
 *
 * The `new URL(..., import.meta.url)` form is what lets Vite discover and
 * bundle the worker (and its WASM import) as a separate ES-module chunk.
 */
export function createSimWorker(): {
  proxy: Comlink.Remote<SimWorkerApi>;
  worker: Worker;
} {
  const worker = new Worker(new URL('./sim.worker.ts', import.meta.url), {
    type: 'module',
  });
  const proxy = Comlink.wrap<SimWorkerApi>(worker);
  return { proxy, worker };
}
