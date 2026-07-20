import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import init, { add, core_version } from '../wasm/core_wasm.js';

// Loads the actual wasm-pack artifact and instantiates it from raw bytes (no
// browser fetch needed), then exercises the trivial exports. This is the
// Node-side half of the M0 smoke test: it proves the compiled WASM core is
// callable. The browser-side half (worker + Comlink + COOP/COEP) is covered by
// the running app; see README.
describe('WASM core smoke test', () => {
  it('instantiates and round-trips calls across the JS↔WASM boundary', async () => {
    // Resolve from the project root; under the jsdom test environment
    // `import.meta.url` is not a file: URL, so we cannot derive it from there.
    const wasmPath = resolve(process.cwd(), 'src/wasm/core_wasm_bg.wasm');
    const bytes = await readFile(wasmPath);
    await init({ module_or_path: bytes });

    expect(core_version()).toMatch(/^core-wasm v\d+\.\d+\.\d+$/);
    expect(add(19, 23)).toBe(42);
  });
});
