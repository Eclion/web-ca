/**
 * Runtime capability detection (PRD §5.6). The shipped core is compiled with
 * WebAssembly SIMD and runs single-threaded; these probes report what the host
 * supports so the UI can surface it (and so a future threaded build can be
 * gated behind them).
 */

export interface Capabilities {
  /** WebAssembly 128-bit SIMD — required to instantiate this build. */
  simd: boolean;
  /** `SharedArrayBuffer` + cross-origin isolation (prerequisite for threads). */
  threads: boolean;
  crossOriginIsolated: boolean;
}

// Minimal module exercising `i8x16.splat` / `i8x16.abs`; validates only where
// wasm SIMD is available (the standard wasm-feature-detect probe).
const SIMD_PROBE = new Uint8Array([
  0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15,
  253, 98, 11,
]);

export function detectCapabilities(): Capabilities {
  let simd = false;
  try {
    simd = WebAssembly.validate(SIMD_PROBE);
  } catch {
    simd = false;
  }
  const coi = globalThis.crossOriginIsolated === true;
  const threads = coi && typeof SharedArrayBuffer !== 'undefined';
  return { simd, threads, crossOriginIsolated: coi };
}
