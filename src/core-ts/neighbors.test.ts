import { describe, expect, it } from 'vitest';
import { gridWith } from '../test/oracle-helpers.ts';
import { index, makeGrid } from './grid.ts';
import { calculateNeighbors, localZRange, sumAll, sumRange } from './neighbors.ts';
import { Pcg32 } from './rng.ts';
import { EPITHELIAL, type Grid, MESENCHYMAL } from './types.ts';

/** Brute-force count of `value` in the clamped 3×3 in-plane window at layer z. */
function brutePlane(grid: Grid, x: number, y: number, z: number, value: number): number {
  let n = 0;
  for (let xi = Math.max(0, x - 1); xi <= Math.min(grid.width - 1, x + 1); xi++) {
    for (let yi = Math.max(0, y - 1); yi <= Math.min(grid.height - 1, y + 1); yi++) {
      if (grid.data[index(grid, xi, yi, z)] === value) n++;
    }
  }
  return n;
}

describe('calculateNeighbors', () => {
  it('counts E and M per layer over the clamped 3×3 window (self-inclusive)', () => {
    // depth 2. Layer 0: E at (2,2) and its neighbor (1,2); M at (3,2).
    // Layer 1: E at (2,2).
    const grid = gridWith(5, 5, 2, [
      [2, 2, 0, EPITHELIAL],
      [1, 2, 0, EPITHELIAL],
      [3, 2, 0, MESENCHYMAL],
      [2, 2, 1, EPITHELIAL],
    ]);
    const { e, m } = calculateNeighbors(grid, 2, 2);
    expect(e).toEqual([2, 1]); // layer0: (2,2),(1,2); layer1: (2,2)
    expect(m).toEqual([1, 0]); // layer0: (3,2)
  });

  it('clamps at borders (no wraparound)', () => {
    const grid = gridWith(4, 4, 1, [
      [0, 0, 0, EPITHELIAL],
      [1, 0, 0, EPITHELIAL],
      [0, 1, 0, MESENCHYMAL],
    ]);
    const { e, m } = calculateNeighbors(grid, 0, 0); // corner: window x0..1,y0..1
    expect(e[0]).toBe(2);
    expect(m[0]).toBe(1);
  });

  it('local dz sum excludes far layers; sumAll spans the full column', () => {
    // E present on layers 0 and 3 only; query at z=0, depth 4.
    const grid = gridWith(3, 3, 4, [
      [1, 1, 0, EPITHELIAL],
      [1, 1, 3, EPITHELIAL],
    ]);
    const { e } = calculateNeighbors(grid, 1, 1);
    const [lo, hi] = localZRange(0, 4); // [0,1]
    expect(sumRange(e, lo, hi)).toBe(1); // only layer 0 within dz
    expect(sumAll(e)).toBe(2); // both layers across the whole column
  });

  it('matches a brute-force Moore count on random grids (property test)', () => {
    const rng = new Pcg32(20260720);
    const [w, h, d] = [8, 7, 3];
    const grid = makeGrid(w, h, d);
    for (let i = 0; i < grid.data.length; i++) grid.data[i] = rng.nextBounded(3) as 0 | 1 | 2;

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const { e, m } = calculateNeighbors(grid, x, y);
        for (let z = 0; z < d; z++) {
          expect(e[z]).toBe(brutePlane(grid, x, y, z, EPITHELIAL));
          expect(m[z]).toBe(brutePlane(grid, x, y, z, MESENCHYMAL));
        }
      }
    }
  });
});
