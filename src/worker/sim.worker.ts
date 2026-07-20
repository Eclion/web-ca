/// <reference lib="webworker" />
import * as Comlink from 'comlink';
import init, { add, core_version } from '../wasm/core_wasm.js';

/**
 * Simulation worker API.
 *
 * M0 scaffold: this exposes only what the end-to-end smoke test needs — WASM
 * initialisation plus the two trivial exports — to prove the
 * Vite → Worker → Comlink → WASM pipeline. The real batch/step API
 * (start/pause/step/seed/config, per-step samples) lands from M4 onward.
 */
export interface SimWorkerApi {
  /** Instantiate the WASM module. Must be called before any other method. */
  ready(): Promise<void>;
  /** Version banner from the Rust core; proves a WASM call round-trips. */
  version(): string;
  /** Trivial add, proves arguments/returns cross the JS↔WASM boundary. */
  add(a: number, b: number): number;
  /** True once `crossOriginIsolated`, i.e. COOP/COEP headers took effect. */
  isCrossOriginIsolated(): boolean;
}

let initialised = false;

const api: SimWorkerApi = {
  async ready() {
    if (initialised) return;
    await init();
    initialised = true;
  },
  version() {
    return core_version();
  },
  add(a, b) {
    return add(a, b);
  },
  isCrossOriginIsolated() {
    return globalThis.crossOriginIsolated === true;
  },
};

Comlink.expose(api);
