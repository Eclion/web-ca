/**
 * Core domain types for the reference oracle (and, later, the shared model
 * vocabulary). Kept dependency-free and un-optimized on purpose: this module is
 * the correctness ground truth read side-by-side with the original `.m` files.
 */

/** Cell occupancy. Matches the MATLAB encoding exactly. */
export const EMPTY = 0;
export const MESENCHYMAL = 1; // "M", red
export const EPITHELIAL = 2; // "E", green
export type CellState = typeof EMPTY | typeof MESENCHYMAL | typeof EPITHELIAL;

export type Model = 'A' | 'B' | 'C';
export type Treatment = 'WT' | 'TRAIL' | 'TR_BIM';

/**
 * Birth/survival rules as inclusive ranges. The original stores them as integer
 * arrays and tests `any(v == rules)` / `min(rules)` / `max(rules)`; every rule
 * set in the source is contiguous (Conway 2–3/3, Model C 4–8/2–7), so a range
 * check is an exact equivalent. See PRD §8.
 */
export interface Rules {
  survivalMin: number;
  survivalMax: number;
  birthMin: number;
  birthMax: number;
}

/** Flat, layer-major grid: `idx = x + y*width + z*width*height` (PRD §5.1). */
export interface Grid {
  width: number; // dishSize   (MATLAB dim 1, "x")
  height: number; // dishSize  (MATLAB dim 2, "y")
  depth: number; // dishHeight (MATLAB dim 3, "z")
  data: Uint8Array; // length = width*height*depth
}

/** Parameters for a single `simulateCancer` run (one treatment, one repeat). */
export interface SimParams {
  model: Model;
  rules: Rules;
  dishSize: number;
  dishHeight: number;
  initialCells: number; // initialNumberOfCells
  steps: number; // nbSteps
  /** Treatment surviving-fraction mean used during seeding (PRD §3.6). */
  mean: number;
  /** Percentage of mesenchymal cells at seed time, 0..100 (forced 0 for A). */
  pMesen: number;
  seed: number;
  /** Optional PRNG stream selector; defaults to the RNG's default stream. */
  stream?: number;
  /** Steps at which to capture a full-grid snapshot (0 = initial state). */
  snapshotSteps?: number[];
}

/** Outputs of a single run (mirrors `[ratio, nbCells, Mpercents]`). */
export interface SimResult {
  /** pS = nbCells[0] / initialCells. */
  ratio: number;
  /** Total live cells per step; length = steps + 1. */
  nbCells: number[];
  /** M fraction of live cells per step (0..1); length = steps + 1. */
  mPercents: number[];
  /** step → full grid copy, for captured snapshot steps. */
  snapshots: Map<number, Uint8Array>;
}

/** Per-model treatment means (runSimulationBatch.m). Order: WT, TRAIL, TR+BIM. */
const MEANS_ABC = { WT: 1, TRAIL: 0.59, TR_BIM: 0.05 } as const;
const MEANS_C = { WT: 0.92, TRAIL: 0.29, TR_BIM: 0.0125 } as const;

/** Treatment surviving-fraction mean for a given model + treatment. */
export function treatmentMean(model: Model, treatment: Treatment): number {
  return (model === 'C' ? MEANS_C : MEANS_ABC)[treatment];
}

/** Default M% when no explicit array is supplied (defaultMesenchymalPercentages). */
export function defaultMesenchymalPercentage(treatment: Treatment): number {
  return { WT: 2, TRAIL: 10, TR_BIM: 95 }[treatment];
}

/** Model rule/dish defaults applied on model switch (PRD §8). */
export function modelDefaults(model: Model): { rules: Rules; dishHeight: number } {
  switch (model) {
    case 'A':
    case 'B':
      return { rules: { survivalMin: 2, survivalMax: 3, birthMin: 3, birthMax: 3 }, dishHeight: 4 };
    case 'C':
      return { rules: { survivalMin: 4, survivalMax: 8, birthMin: 2, birthMax: 7 }, dishHeight: 2 };
  }
}
