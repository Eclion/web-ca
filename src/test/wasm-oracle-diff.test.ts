import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { Pcg32 } from '../core-ts/rng.ts';
import { simulate } from '../core-ts/simulate.ts';
import type { SimParams } from '../core-ts/types.ts';
import init, {
  pcg32_default_sequence,
  pcg32_permutation,
  pcg32_sequence,
  Simulation,
} from '../wasm/core_wasm.js';

beforeAll(async () => {
  const bytes = await readFile(resolve(process.cwd(), 'src/wasm/core_wasm_bg.wasm'));
  await init({ module_or_path: bytes });
});

describe('PCG32 cross-language parity (WASM ↔ TS oracle)', () => {
  it('matches the canonical reference vector (seed 42, stream 54)', () => {
    expect(Array.from(pcg32_sequence(42, 54, 6))).toEqual([
      0xa15c02b7, 0x7b47f409, 0xba1d3330, 0x83d2f293, 0xbfa4784b, 0xcbed606e,
    ]);
  });

  it('matches the TS oracle stream for the default stream', () => {
    const ts = new Pcg32(12345);
    const tsSeq = Array.from({ length: 64 }, () => ts.nextU32());
    expect(Array.from(pcg32_default_sequence(12345, 64))).toEqual(tsSeq);
  });

  it('matches the TS oracle permutation', () => {
    const ts = new Pcg32(2024);
    expect(Array.from(pcg32_permutation(2024, 50))).toEqual(Array.from(ts.permutation(50)));
  });
});

// Cases chosen to actually grow/oscillate a colony (mean 1 seeds a disk), plus
// a degenerate empty case (mean 0 seeds nothing).
const CASES: Array<Partial<SimParams> & { dishSize: number; steps: number }> = [
  { dishSize: 16, initialCells: 60, steps: 6, mean: 1, seed: 1 },
  { dishSize: 24, initialCells: 120, steps: 8, mean: 1, seed: 42 },
  { dishSize: 24, initialCells: 200, steps: 10, mean: 1, seed: 12345 },
  { dishSize: 20, initialCells: 100, steps: 5, mean: 1, seed: 7 },
  { dishSize: 18, initialCells: 80, steps: 4, mean: 0, seed: 3 }, // empty dish
];

describe('WASM core vs TS oracle — Model A differential test', () => {
  for (const c of CASES) {
    const params: SimParams = {
      model: 'A',
      rules: { survivalMin: 2, survivalMax: 3, birthMin: 3, birthMax: 3 },
      dishSize: c.dishSize,
      dishHeight: 4,
      initialCells: c.initialCells ?? 100,
      steps: c.steps,
      mean: c.mean ?? 1,
      pMesen: 0,
      seed: c.seed ?? 0,
    };

    it(`is byte-identical: dish ${c.dishSize}, ${c.steps} steps, mean ${c.mean}, seed ${c.seed}`, () => {
      const allSteps = Array.from({ length: params.steps + 1 }, (_, i) => i);
      const oracle = simulate({ ...params, snapshotSteps: allSteps });

      const sim = new Simulation(
        'A',
        params.rules.survivalMin,
        params.rules.survivalMax,
        params.rules.birthMin,
        params.rules.birthMax,
        params.dishSize,
        params.dishHeight,
        params.initialCells,
        params.steps,
        params.mean,
        params.pMesen,
        params.seed,
      );

      try {
        for (let s = 0; s <= params.steps; s++) {
          const oracleGrid = oracle.snapshots.get(s);
          expect(oracleGrid).toBeDefined();
          expect(Array.from(sim.grid())).toEqual(Array.from(oracleGrid as Uint8Array));
          if (s < params.steps) sim.step();
        }
        expect(Array.from(sim.nb_cells())).toEqual(oracle.nbCells);
        expect(Array.from(sim.m_percents())).toEqual(oracle.mPercents);
        expect(sim.ratio).toEqual(oracle.ratio);
      } finally {
        sim.free();
      }
    });
  }
});
