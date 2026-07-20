import { describe, expect, it } from 'vitest';
import {
  CONWAY,
  getCell,
  gridWith,
  liveCells,
  MODEL_C_RULES,
  stepAll,
} from '../test/oracle-helpers.ts';
import { Pcg32 } from './rng.ts';
import { EPITHELIAL, MESENCHYMAL } from './types.ts';

const rng = () => new Pcg32(1);

describe('Model A (Conway-like, E only)', () => {
  it('oscillates a blinker: horizontal → vertical → horizontal', () => {
    // 5×5×1, three E in a row along x at y=2.
    const start = gridWith(5, 5, 1, [
      [1, 2, 0, EPITHELIAL],
      [2, 2, 0, EPITHELIAL],
      [3, 2, 0, EPITHELIAL],
    ]);
    const afterOne = stepAll('A', start, CONWAY, rng());
    expect(liveCells(afterOne)).toEqual([
      [2, 1, 0, EPITHELIAL],
      [2, 2, 0, EPITHELIAL],
      [2, 3, 0, EPITHELIAL],
    ]);
    const afterTwo = stepAll('A', afterOne, CONWAY, rng());
    expect(liveCells(afterTwo)).toEqual([
      [1, 2, 0, EPITHELIAL],
      [2, 2, 0, EPITHELIAL],
      [3, 2, 0, EPITHELIAL],
    ]);
  });

  it('kills a lone E cell (underpopulation)', () => {
    const start = gridWith(3, 3, 1, [[1, 1, 0, EPITHELIAL]]);
    expect(liveCells(stepAll('A', start, CONWAY, rng()))).toEqual([]);
  });
});

describe('Model B (E + M, conversion + movement)', () => {
  it('surviving E converts to M; non-survivors die; births are E', () => {
    // Blinker under Model B: center E survives → M; the two ends die; the two
    // empty cells with 3 E neighbors are born, and (column-E > column-M) → E.
    const start = gridWith(5, 5, 1, [
      [1, 2, 0, EPITHELIAL],
      [2, 2, 0, EPITHELIAL],
      [3, 2, 0, EPITHELIAL],
    ]);
    const after = stepAll('B', start, CONWAY, rng());
    expect(liveCells(after)).toEqual([
      [2, 1, 0, EPITHELIAL], // born
      [2, 2, 0, MESENCHYMAL], // surviving E → M
      [2, 3, 0, EPITHELIAL], // born
    ]);
  });

  it('moves a lone M cell into an adjacent empty neighbor', () => {
    const start = gridWith(5, 5, 1, [[2, 2, 0, MESENCHYMAL]]);
    const after = stepAll('B', start, CONWAY, rng());
    const live = liveCells(after);
    expect(live).toHaveLength(1);
    const [x, y, z, v] = live[0];
    expect(v).toBe(MESENCHYMAL);
    expect([x, y, z]).not.toEqual([2, 2, 0]); // it moved
    expect(Math.abs(x - 2)).toBeLessThanOrEqual(1);
    expect(Math.abs(y - 2)).toBeLessThanOrEqual(1);
    expect(z).toBe(0);
  });

  it('converts a trapped M cell (no empty neighbor) to E', () => {
    // Fill all 8 Moore neighbors of (2,2) with E so no empty target exists.
    const start = gridWith(5, 5, 1, [
      [2, 2, 0, MESENCHYMAL],
      [1, 1, 0, EPITHELIAL],
      [2, 1, 0, EPITHELIAL],
      [3, 1, 0, EPITHELIAL],
      [1, 2, 0, EPITHELIAL],
      [3, 2, 0, EPITHELIAL],
      [1, 3, 0, EPITHELIAL],
      [2, 3, 0, EPITHELIAL],
      [3, 3, 0, EPITHELIAL],
    ]);
    const after = stepAll('B', start, CONWAY, rng());
    expect(getCell(after, 2, 2, 0)).toBe(EPITHELIAL);
  });
});

describe('Model C (paper rule-set)', () => {
  it('rule i: an underpopulated E becomes M', () => {
    const start = gridWith(3, 3, 1, [[1, 1, 0, EPITHELIAL]]); // L-1 = 0 < survivalMin(4)
    expect(getCell(stepAll('C', start, MODEL_C_RULES, rng()), 1, 1, 0)).toBe(MESENCHYMAL);
  });

  it('rule ii: an overcrowded M becomes E', () => {
    // 3×3×2 fully packed (18 cells): center M sees L-1 = 17 > survivalMax(8).
    const cells: Array<[number, number, number, typeof MESENCHYMAL | typeof EPITHELIAL]> = [];
    for (let z = 0; z < 2; z++) {
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const isCenter = x === 1 && y === 1 && z === 0;
          cells.push([x, y, z, isCenter ? MESENCHYMAL : EPITHELIAL]);
        }
      }
    }
    const start = gridWith(3, 3, 2, cells);
    expect(getCell(stepAll('C', start, MODEL_C_RULES, rng()), 1, 1, 0)).toBe(EPITHELIAL);
  });

  it('rule iii: an empty cell in the birth range is born, E when column-E > column-M', () => {
    const start = gridWith(5, 5, 1, [
      [1, 2, 0, EPITHELIAL],
      [3, 2, 0, EPITHELIAL],
      [2, 1, 0, EPITHELIAL], // (2,2) sees 3 E → L=3 ∈ [2,7], E>M → born E
    ]);
    expect(getCell(stepAll('C', start, MODEL_C_RULES, rng()), 2, 2, 0)).toBe(EPITHELIAL);
  });

  it('rule iii: born cell is M when column-M is not exceeded by column-E (tie → M)', () => {
    const start = gridWith(5, 5, 1, [
      [1, 2, 0, EPITHELIAL],
      [3, 2, 0, MESENCHYMAL], // (2,2) sees 1 E + 1 M → L=2 ∈ [2,7], not E>M → born M
    ]);
    expect(getCell(stepAll('C', start, MODEL_C_RULES, rng()), 2, 2, 0)).toBe(MESENCHYMAL);
  });

  it('rule iv: an M cell moves to an empty neighbor', () => {
    const start = gridWith(5, 5, 1, [[2, 2, 0, MESENCHYMAL]]);
    const live = liveCells(stepAll('C', start, MODEL_C_RULES, rng()));
    expect(live).toHaveLength(1);
    expect(live[0][3]).toBe(MESENCHYMAL);
    expect([live[0][0], live[0][1], live[0][2]]).not.toEqual([2, 2, 0]);
  });

  it('rule v: an M cell unable to move becomes E', () => {
    const start = gridWith(5, 5, 1, [
      [2, 2, 0, MESENCHYMAL],
      [1, 1, 0, EPITHELIAL],
      [2, 1, 0, EPITHELIAL],
      [3, 1, 0, EPITHELIAL],
      [1, 2, 0, EPITHELIAL],
      [3, 2, 0, EPITHELIAL],
      [1, 3, 0, EPITHELIAL],
      [2, 3, 0, EPITHELIAL],
      [3, 3, 0, EPITHELIAL],
    ]);
    expect(getCell(stepAll('C', start, MODEL_C_RULES, rng()), 2, 2, 0)).toBe(EPITHELIAL);
  });
});

describe('birth/survival use local dz sum but born-type uses full column (faithful quirk)', () => {
  it('born type is decided by whole-column E/M totals, not the local window', () => {
    // depth 4. Around empty (1,1,z=0): local dz = layers 0..1. Put 3 E on layer 0
    // (so the birth threshold L=3 is met locally), and stack 5 M high up on
    // layers 2–3 (outside dz) so the full column has M(5) > E(3): born should be M.
    const start = gridWith(3, 3, 4, [
      [0, 1, 0, EPITHELIAL],
      [2, 1, 0, EPITHELIAL],
      [1, 0, 0, EPITHELIAL],
      [0, 0, 2, MESENCHYMAL],
      [1, 0, 2, MESENCHYMAL],
      [2, 0, 2, MESENCHYMAL],
      [0, 1, 3, MESENCHYMAL],
      [2, 1, 3, MESENCHYMAL],
    ]);
    // Local dz sum for (1,1,0) = 3 E (layers 0..1) → in Conway birth {3}.
    // Full column: E=3, M=5 → not E>M → born M.
    const after = stepAll('B', start, CONWAY, rng());
    expect(getCell(after, 1, 1, 0)).toBe(MESENCHYMAL);
  });
});
