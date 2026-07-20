import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { projectToRGBA } from '../render/project.ts';
import init, { Simulation } from '../wasm/core_wasm.js';

beforeAll(async () => {
  const bytes = await readFile(resolve(process.cwd(), 'src/wasm/core_wasm_bg.wasm'));
  await init({ module_or_path: bytes });
});

/**
 * Deterministic "visual regression" of the 2D dish: a fixed seed + config runs
 * the real core, the final grid is projected to RGBA, and we snapshot a stable
 * signature (E/M/empty pixel counts + an FNV-1a hash of the pixels). This
 * catches any change in the projection or the engine's rendered output without
 * browser-screenshot flakiness (replaces the Playwright approach in PRD §9.6).
 */
function signature(rgba: Uint8ClampedArray) {
  let green = 0;
  let red = 0;
  let black = 0;
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    if (g === 255) green++;
    else if (r === 255) red++;
    else black++;
    hash = (Math.imul(hash ^ r, 16777619) >>> 0) ^ g;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return { green, red, black, hash };
}

function renderFinal(
  model: string,
  size: number,
  height: number,
  pMesen: number,
  seed: number,
): ReturnType<typeof signature> {
  const survival = model === 'C' ? [4, 8] : [2, 3];
  const birth = model === 'C' ? [2, 7] : [3, 3];
  const sim = new Simulation(
    model,
    survival[0],
    survival[1],
    birth[0],
    birth[1],
    size,
    height,
    300,
    12,
    1,
    pMesen,
    seed,
  );
  try {
    sim.run();
    return signature(projectToRGBA(sim.grid(), size, size, height));
  } finally {
    sim.free();
  }
}

describe('dish render regression', () => {
  it('Model A final frame', () => {
    expect(renderFinal('A', 32, 4, 0, 7)).toMatchSnapshot();
  });

  it('Model B final frame (with M cells)', () => {
    expect(renderFinal('B', 32, 4, 40, 7)).toMatchSnapshot();
  });

  it('Model C final frame (with M cells)', () => {
    expect(renderFinal('C', 32, 2, 40, 7)).toMatchSnapshot();
  });
});
