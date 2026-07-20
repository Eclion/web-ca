import { index } from './grid.ts';
import { EPITHELIAL, type Grid, MESENCHYMAL } from './types.ts';

/**
 * Per-z-layer neighbor counts over the clamped 3×3 in-plane Moore window at
 * `(x, y)` — a literal port of `calculateNeighbors.m`.
 *
 * `e[z]` / `m[z]` are the counts of epithelial (2) / mesenchymal (1) cells in
 * the window at layer `z`. Borders are **clamped**, never wrapped. Both arrays
 * have length `grid.depth`.
 *
 * Note the counts are **inclusive of the cell itself**: the window spans
 * `x-1..x+1`, so `(x, y, z)` is part of its own count. The fate rules subtract 1
 * where the source does (`sum(...) - 1`).
 */
export function calculateNeighbors(grid: Grid, x: number, y: number): { e: number[]; m: number[] } {
  const { width, height, depth, data } = grid;
  const x0 = Math.max(0, x - 1);
  const x1 = Math.min(width - 1, x + 1);
  const y0 = Math.max(0, y - 1);
  const y1 = Math.min(height - 1, y + 1);

  const e = new Array<number>(depth).fill(0);
  const m = new Array<number>(depth).fill(0);

  for (let z = 0; z < depth; z++) {
    let ec = 0;
    let mc = 0;
    for (let xi = x0; xi <= x1; xi++) {
      for (let yi = y0; yi <= y1; yi++) {
        const v = data[index(grid, xi, yi, z)];
        if (v === EPITHELIAL) ec++;
        else if (v === MESENCHYMAL) mc++;
      }
    }
    e[z] = ec;
    m[z] = mc;
  }
  return { e, m };
}

/** The clamped local depth window `[z-1, z+1]` used by `sum(nNeighbors(dz))`. */
export function localZRange(z: number, depth: number): [number, number] {
  return [Math.max(0, z - 1), Math.min(depth - 1, z + 1)];
}

/** Sum of `arr[zLo..zHi]` inclusive. */
export function sumRange(arr: number[], zLo: number, zHi: number): number {
  let s = 0;
  for (let z = zLo; z <= zHi; z++) s += arr[z];
  return s;
}

/** Sum of every element (the "full-height column" total). */
export function sumAll(arr: number[]): number {
  let s = 0;
  for (const v of arr) s += v;
  return s;
}
