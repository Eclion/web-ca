import { index } from './grid.ts';
import { calculateNeighbors, localZRange, sumAll, sumRange } from './neighbors.ts';
import type { Pcg32 } from './rng.ts';
import { EMPTY, EPITHELIAL, type Grid, MESENCHYMAL, type Model, type Rules } from './types.ts';

const inBirth = (l: number, r: Rules): boolean => l >= r.birthMin && l <= r.birthMax;
const inSurvival = (l: number, r: Rules): boolean => l >= r.survivalMin && l <= r.survivalMax;

/**
 * Empty positions in the clamped 3×3×3 Moore neighborhood of `(x, y, z)` that
 * are free in **both** the previous grid and the next buffer — a literal port
 * of `listAvailableNeighborPositions.m`.
 *
 * Iteration order is x (outer) → y → z (inner), matching the source, because
 * the movement rule selects a target by index into this list.
 */
function listAvailableNeighborPositions(
  cur: Grid,
  next: Grid,
  x: number,
  y: number,
  z: number,
): number[] {
  const positions: number[] = []; // packed flat indices
  const x0 = Math.max(0, x - 1);
  const x1 = Math.min(cur.width - 1, x + 1);
  const y0 = Math.max(0, y - 1);
  const y1 = Math.min(cur.height - 1, y + 1);
  const z0 = Math.max(0, z - 1);
  const z1 = Math.min(cur.depth - 1, z + 1);

  for (let xi = x0; xi <= x1; xi++) {
    for (let yi = y0; yi <= y1; yi++) {
      for (let zi = z0; zi <= z1; zi++) {
        const idx = index(cur, xi, yi, zi);
        if (cur.data[idx] === EMPTY && next.data[idx] === EMPTY) positions.push(idx);
      }
    }
  }
  return positions;
}

/**
 * Move an M cell to a random available empty neighbor, or convert it to E if it
 * cannot move. Shared by Models B and C (undergoFateModelB.m lines 25–37,
 * undergoFateModelC.m lines 37–48).
 *
 * The target is picked as `round(rp*(count-1))` with `rp` a single uniform draw
 * — reproduced verbatim (not a bounded-int draw) to preserve the RNG stream.
 * `Math.round` rounds half toward +∞; for the non-negative argument here that
 * equals Rust's `f64::round`, so the WASM port matches.
 */
function moveOrConvertM(cur: Grid, next: Grid, x: number, y: number, z: number, rng: Pcg32): void {
  const available = listAvailableNeighborPositions(cur, next, x, y, z);
  const rp = rng.nextFloat();
  const self = index(cur, x, y, z);
  if (available.length !== 0) {
    const pick = Math.round(rp * (available.length - 1));
    next.data[available[pick]] = MESENCHYMAL;
    next.data[self] = EMPTY;
  } else {
    next.data[self] = EPITHELIAL;
  }
}

/**
 * Model A (undergoFateModelA.m): epithelial-only Conway-like CA. Neighbor count
 * uses **E cells only** (`nNeighbors = eNeighbors`), faithful to the source —
 * harmless since Model A never has M cells (pMesen forced to 0).
 */
export function undergoFateModelA(
  cur: Grid,
  next: Grid,
  x: number,
  y: number,
  z: number,
  rules: Rules,
): void {
  const { e } = calculateNeighbors(cur, x, y);
  const [zLo, zHi] = localZRange(z, cur.depth);
  const localSum = sumRange(e, zLo, zHi); // E-only, inclusive of self
  const self = index(cur, x, y, z);
  const state = cur.data[self];

  if (state === EMPTY) {
    if (inBirth(localSum, rules)) next.data[self] = EPITHELIAL;
  } else if (state === EPITHELIAL && !inSurvival(localSum - 1, rules)) {
    next.data[self] = EMPTY;
  }
}

/**
 * Model B (undergoFateModelB.m): E + M with movement. Surviving E cells convert
 * to M; non-surviving E cells die; M cells move (or convert to E if trapped).
 * Born-cell type uses the **full-height column** E vs M totals (`sumAll`), while
 * the birth/survival thresholds use the **local** dz sum — the faithful quirk
 * from PRD §3.2.
 */
export function undergoFateModelB(
  cur: Grid,
  next: Grid,
  x: number,
  y: number,
  z: number,
  rules: Rules,
  rng: Pcg32,
): void {
  const { e, m } = calculateNeighbors(cur, x, y);
  const [zLo, zHi] = localZRange(z, cur.depth);
  const localSum = sumRange(e, zLo, zHi) + sumRange(m, zLo, zHi); // inclusive of self
  const self = index(cur, x, y, z);
  const state = cur.data[self];

  if (state === EMPTY) {
    if (inBirth(localSum, rules)) {
      next.data[self] = sumAll(e) > sumAll(m) ? EPITHELIAL : MESENCHYMAL;
    }
  } else if (state === EPITHELIAL) {
    next.data[self] = inSurvival(localSum - 1, rules) ? MESENCHYMAL : EMPTY;
  } else {
    // state === MESENCHYMAL
    moveOrConvertM(cur, next, x, y, z, rng);
  }
}

/**
 * Model C (undergoFateModelC.m): the paper rule-set.
 *   i.   E with (L-1) < survivalMin  → M
 *   ii.  M with (L-1) > survivalMax  → E
 *   iii. empty with L ∈ [birthMin, birthMax] → born (E if column-E > column-M else M)
 *   iv.  otherwise an M cell moves to a random empty neighbor
 *   v.   an M cell that cannot move → E
 */
export function undergoFateModelC(
  cur: Grid,
  next: Grid,
  x: number,
  y: number,
  z: number,
  rules: Rules,
  rng: Pcg32,
): void {
  const { e, m } = calculateNeighbors(cur, x, y);
  const [zLo, zHi] = localZRange(z, cur.depth);
  const localSum = sumRange(e, zLo, zHi) + sumRange(m, zLo, zHi); // inclusive of self
  const self = index(cur, x, y, z);
  const state = cur.data[self];

  if (state === EMPTY) {
    if (inBirth(localSum, rules)) {
      next.data[self] = sumAll(e) > sumAll(m) ? EPITHELIAL : MESENCHYMAL; // rule iii
    }
  } else if (state === EPITHELIAL) {
    if (localSum - 1 < rules.survivalMin) next.data[self] = MESENCHYMAL; // rule i
    // else: unchanged (next already holds the copied-over E)
  } else {
    // state === MESENCHYMAL
    if (localSum - 1 > rules.survivalMax) {
      next.data[self] = EPITHELIAL; // rule ii
    } else {
      moveOrConvertM(cur, next, x, y, z, rng); // rules iv / v
    }
  }
}

/** Apply the fate rule for `model` at `(x, y, z)`, mutating `next`. */
export function undergoFate(
  model: Model,
  cur: Grid,
  next: Grid,
  x: number,
  y: number,
  z: number,
  rules: Rules,
  rng: Pcg32,
): void {
  switch (model) {
    case 'A':
      undergoFateModelA(cur, next, x, y, z, rules);
      return;
    case 'B':
      undergoFateModelB(cur, next, x, y, z, rules, rng);
      return;
    case 'C':
      undergoFateModelC(cur, next, x, y, z, rules, rng);
      return;
  }
}
