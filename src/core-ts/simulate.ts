import { undergoFate } from './fate.ts';
import { cloneGrid, countState, makeGrid, seedColony } from './grid.ts';
import { Pcg32 } from './rng.ts';
import { EPITHELIAL, type Grid, MESENCHYMAL, type SimParams, type SimResult } from './types.ts';

/**
 * Run one full simulation — the reference-oracle port of `simulateCancer.m`.
 *
 * Ordering discipline (PRD §3.3), reproduced exactly:
 *   1. `next` starts as a copy of the current grid (`nextStepCells = cells`).
 *   2. Columns are visited in a seeded random permutation each step; within a
 *      column, layers run `z = 0..depth-1` ascending.
 *   3. Each `undergoFate` call reads neighbor counts from the **previous** grid
 *      but reads/writes occupancy in `next` — so birth/survival are effectively
 *      synchronous while M-cell movement is sequential/collision-avoiding.
 *
 * Deterministic: identical `seed` (+ `stream`) and params ⇒ identical result.
 */
export function simulate(params: SimParams): SimResult {
  const { model, rules, dishSize, dishHeight, steps, initialCells, snapshotSteps } = params;
  const rng =
    params.stream === undefined ? new Pcg32(params.seed) : new Pcg32(params.seed, params.stream);

  // Model A is epithelial-only: simulateCancer.m forces pMesen to 0 (line 36).
  const seedParams = model === 'A' ? { ...params, pMesen: 0 } : params;

  let cur: Grid = makeGrid(dishSize, dishSize, dishHeight);
  seedColony(cur, seedParams, rng);

  const nbCells = new Array<number>(steps + 1);
  const mPercents = new Array<number>(steps + 1);
  const snapshots = new Map<number, Uint8Array>();
  const snapSet = new Set(snapshotSteps ?? []);

  const record = (step: number, grid: Grid): void => {
    const mCount = countState(grid, MESENCHYMAL);
    const total = mCount + countState(grid, EPITHELIAL);
    nbCells[step] = total;
    mPercents[step] = total !== 0 ? mCount / total : 0;
    if (snapSet.has(step)) snapshots.set(step, new Uint8Array(grid.data));
  };

  record(0, cur);
  const ratio = nbCells[0] / initialCells;

  const columns = dishSize * dishSize;
  for (let step = 1; step <= steps; step++) {
    const next = cloneGrid(cur);
    const order = rng.permutation(columns);
    for (let oi = 0; oi < columns; oi++) {
      const col = order[oi];
      const x = col % dishSize;
      const y = Math.floor(col / dishSize);
      for (let z = 0; z < dishHeight; z++) {
        undergoFate(model, cur, next, x, y, z, rules, rng);
      }
    }
    cur = next;
    record(step, cur);
  }

  return { ratio, nbCells, mPercents, snapshots };
}
