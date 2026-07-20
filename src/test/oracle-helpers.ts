import { undergoFate } from '../core-ts/fate.ts';
import { cloneGrid, index, makeGrid } from '../core-ts/grid.ts';
import type { Pcg32 } from '../core-ts/rng.ts';
import type { CellState, Grid, Model, Rules } from '../core-ts/types.ts';

/** Build a grid and place the given `[x, y, z, value]` cells. */
export function gridWith(
  width: number,
  height: number,
  depth: number,
  cells: Array<[number, number, number, CellState]>,
): Grid {
  const grid = makeGrid(width, height, depth);
  for (const [x, y, z, v] of cells) grid.data[index(grid, x, y, z)] = v;
  return grid;
}

export function getCell(grid: Grid, x: number, y: number, z: number): number {
  return grid.data[index(grid, x, y, z)];
}

/** Sorted list of occupied `[x, y, z, value]` cells — order-independent compare. */
export function liveCells(grid: Grid): Array<[number, number, number, number]> {
  const out: Array<[number, number, number, number]> = [];
  for (let z = 0; z < grid.depth; z++) {
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const v = getCell(grid, x, y, z);
        if (v !== 0) out.push([x, y, z, v]);
      }
    }
  }
  return out;
}

/**
 * Apply one full synchronous step by visiting every cell in row-major order
 * (x → y → z). For movement-free scenarios this is order-independent; for
 * movement tests the scenarios are constructed so at most one M cell moves, so
 * the fixed order is still deterministic.
 */
export function stepAll(model: Model, cur: Grid, rules: Rules, rng: Pcg32): Grid {
  const next = cloneGrid(cur);
  for (let z = 0; z < cur.depth; z++) {
    for (let y = 0; y < cur.height; y++) {
      for (let x = 0; x < cur.width; x++) {
        undergoFate(model, cur, next, x, y, z, rules, rng);
      }
    }
  }
  return next;
}

export const CONWAY: Rules = { survivalMin: 2, survivalMax: 3, birthMin: 3, birthMax: 3 };
export const MODEL_C_RULES: Rules = { survivalMin: 4, survivalMax: 8, birthMin: 2, birthMax: 7 };
