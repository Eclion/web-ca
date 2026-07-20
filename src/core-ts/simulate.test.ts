import { describe, expect, it } from 'vitest';
import { simulate } from './simulate.ts';
import type { Rules, SimParams } from './types.ts';

const CONWAY: Rules = { survivalMin: 2, survivalMax: 3, birthMin: 3, birthMax: 3 };

function baseParams(overrides: Partial<SimParams> = {}): SimParams {
  return {
    model: 'A',
    rules: CONWAY,
    dishSize: 24,
    dishHeight: 4,
    initialCells: 120,
    steps: 4,
    mean: 1,
    pMesen: 0,
    seed: 12345,
    ...overrides,
  };
}

describe('simulate', () => {
  it('is deterministic for a given seed', () => {
    const a = simulate(baseParams());
    const b = simulate(baseParams());
    expect(a.nbCells).toEqual(b.nbCells);
    expect(a.mPercents).toEqual(b.mPercents);
    expect(a.ratio).toBe(b.ratio);
  });

  it('produces different runs for different seeds', () => {
    const a = simulate(baseParams({ seed: 1 }));
    const b = simulate(baseParams({ seed: 2 }));
    expect(a.nbCells).not.toEqual(b.nbCells);
  });

  it('reports series of length steps+1 and a consistent ratio/M% range', () => {
    const r = simulate(baseParams({ steps: 6 }));
    expect(r.nbCells).toHaveLength(7);
    expect(r.mPercents).toHaveLength(7);
    expect(r.ratio).toBeCloseTo(r.nbCells[0] / 120, 12);
    for (const p of r.mPercents) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });

  it('seeds no cells when the treatment mean is 0', () => {
    const r = simulate(baseParams({ mean: 0 }));
    expect(r.nbCells.every((n) => n === 0)).toBe(true);
    expect(r.mPercents.every((p) => p === 0)).toBe(true);
    expect(r.ratio).toBe(0);
  });

  it('Model A never produces M cells (pMesen forced to 0)', () => {
    // Even with a high pMesen input, Model A must remain all-epithelial.
    const r = simulate(baseParams({ model: 'A', pMesen: 95, steps: 3 }));
    expect(r.mPercents.every((p) => p === 0)).toBe(true);
  });

  it('captures full-grid snapshots at the requested steps', () => {
    const r = simulate(baseParams({ steps: 5, snapshotSteps: [0, 3] }));
    expect([...r.snapshots.keys()].sort((p, q) => p - q)).toEqual([0, 3]);
    const expectedSize = 24 * 24 * 4;
    for (const snap of r.snapshots.values()) expect(snap).toHaveLength(expectedSize);
  });

  it('runs Models B and C deterministically with mesenchymal cells present', () => {
    for (const model of ['B', 'C'] as const) {
      const params = baseParams({
        model,
        dishHeight: model === 'C' ? 2 : 4,
        pMesen: 40,
        mean: 1,
        seed: 777,
        steps: 3,
      });
      const a = simulate(params);
      const b = simulate(params);
      expect(a.nbCells).toEqual(b.nbCells);
      expect(a.mPercents).toEqual(b.mPercents);
    }
  });
});
