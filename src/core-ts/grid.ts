import type { Pcg32 } from './rng.ts';
import { type CellState, EPITHELIAL, type Grid, MESENCHYMAL, type SimParams } from './types.ts';

/** Layer-major flat index: `x + y*width + z*width*height` (PRD §5.1). */
export function index(grid: Grid, x: number, y: number, z: number): number {
  return x + y * grid.width + z * grid.width * grid.height;
}

export function makeGrid(width: number, height: number, depth: number): Grid {
  return { width, height, depth, data: new Uint8Array(width * height * depth) };
}

export function cloneGrid(grid: Grid): Grid {
  return { ...grid, data: new Uint8Array(grid.data) };
}

/** Count of cells equal to `value` across the whole grid (sumCells.m). */
export function countState(grid: Grid, value: CellState): number {
  let n = 0;
  const { data } = grid;
  for (let i = 0; i < data.length; i++) if (data[i] === value) n++;
  return n;
}

/**
 * Seed the initial circular colony into layer z=0, faithfully porting the
 * seeding loop of `simulateCancer.m` (lines 57–75).
 *
 * RNG discipline (must match the source and the future Rust port exactly):
 *   - loop order is `i` (x, outer) then `j` (y, inner), both 1-indexed;
 *   - one `rand()` is drawn for **every** cell (the `spacingOffset*mean` test),
 *     because MATLAB evaluates the left of `&&` first and it always runs;
 *   - a **second** `rand()` is drawn only for cells that pass, to pick M vs E.
 *
 * The disk test uses the 1-indexed coordinates and center `dishSize/2`, so we
 * add 1 to the 0-based loop variables inside the distance check.
 */
export function seedColony(grid: Grid, params: SimParams, rng: Pcg32): void {
  const spacingOffset = 0.6;
  const { dishSize, initialCells, mean, pMesen } = params;
  const radiusSq = initialCells / (spacingOffset * Math.PI); // radius^2
  const center = dishSize / 2;
  const threshold = spacingOffset * mean;

  for (let i = 0; i < dishSize; i++) {
    const dx = i + 1 - center;
    for (let j = 0; j < dishSize; j++) {
      const passes = rng.nextFloat() < threshold;
      const dy = j + 1 - center;
      if (passes && dx * dx + dy * dy < radiusSq) {
        grid.data[index(grid, i, j, 0)] = rng.nextFloat() < pMesen / 100 ? MESENCHYMAL : EPITHELIAL;
      }
    }
  }
}
