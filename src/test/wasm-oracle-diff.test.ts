import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { Pcg32 } from '../core-ts/rng.ts';
import { simulate } from '../core-ts/simulate.ts';
import type { Model, SimParams } from '../core-ts/types.ts';
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

/**
 * Run one WASM simulation mirroring `params` and assert it is byte-identical to
 * the TS oracle: the grid at every step plus the nbCells / mPercents / ratio
 * series. Snapshots at all steps let us catch divergence at the earliest step.
 */
function assertByteIdentical(params: SimParams): void {
  const allSteps = Array.from({ length: params.steps + 1 }, (_, i) => i);
  const oracle = simulate({ ...params, snapshotSteps: allSteps });

  const sim = new Simulation(
    params.model,
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
      expect(oracleGrid, `snapshot for step ${s}`).toBeDefined();
      expect(Array.from(sim.grid()), `grid at step ${s}`).toEqual(
        Array.from(oracleGrid as Uint8Array),
      );
      if (s < params.steps) sim.step();
    }
    expect(Array.from(sim.nb_cells())).toEqual(oracle.nbCells);
    expect(Array.from(sim.m_percents())).toEqual(oracle.mPercents);
    expect(sim.ratio).toEqual(oracle.ratio);
  } finally {
    sim.free();
  }
}

interface CaseSpec {
  dishSize: number;
  initialCells: number;
  steps: number;
  mean: number;
  pMesen: number;
  seed: number;
}

// Model defaults: A/B → survival 2–3, birth 3, height 4; C → 4–8, 2–7, height 2.
function paramsFor(model: Model, c: CaseSpec): SimParams {
  const rules =
    model === 'C'
      ? { survivalMin: 4, survivalMax: 8, birthMin: 2, birthMax: 7 }
      : { survivalMin: 2, survivalMax: 3, birthMin: 3, birthMax: 3 };
  return {
    model,
    rules,
    dishSize: c.dishSize,
    dishHeight: model === 'C' ? 2 : 4,
    initialCells: c.initialCells,
    steps: c.steps,
    mean: c.mean,
    pMesen: c.pMesen,
    seed: c.seed,
  };
}

const A_CASES: CaseSpec[] = [
  { dishSize: 16, initialCells: 60, steps: 6, mean: 1, pMesen: 0, seed: 1 },
  { dishSize: 24, initialCells: 120, steps: 8, mean: 1, pMesen: 0, seed: 42 },
  { dishSize: 24, initialCells: 200, steps: 10, mean: 1, pMesen: 0, seed: 12345 },
  { dishSize: 20, initialCells: 100, steps: 5, mean: 1, pMesen: 0, seed: 7 },
  { dishSize: 18, initialCells: 80, steps: 4, mean: 0, pMesen: 0, seed: 3 }, // empty dish
];

// B/C exercise M cells (pMesen > 0), so movement + conversions are covered.
const BC_CASES: CaseSpec[] = [
  { dishSize: 16, initialCells: 90, steps: 6, mean: 1, pMesen: 10, seed: 1 },
  { dishSize: 24, initialCells: 180, steps: 8, mean: 1, pMesen: 40, seed: 42 },
  { dishSize: 24, initialCells: 240, steps: 10, mean: 1, pMesen: 95, seed: 12345 },
  { dishSize: 20, initialCells: 130, steps: 7, mean: 1, pMesen: 50, seed: 7 },
];

describe('WASM core vs TS oracle — differential test (all models)', () => {
  for (const c of A_CASES) {
    it(`Model A byte-identical: dish ${c.dishSize}, ${c.steps} steps, seed ${c.seed}`, () => {
      assertByteIdentical(paramsFor('A', c));
    });
  }
  for (const model of ['B', 'C'] as const) {
    for (const c of BC_CASES) {
      it(`Model ${model} byte-identical: dish ${c.dishSize}, ${c.steps} steps, M%${c.pMesen}, seed ${c.seed}`, () => {
        assertByteIdentical(paramsFor(model, c));
      });
    }
  }
});
