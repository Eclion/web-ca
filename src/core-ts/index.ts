/**
 * `@core-ts` — the pure-TypeScript reference oracle.
 *
 * A literal, un-optimized port of the original MATLAB cellular automaton
 * (Models A/B/C, seeding, neighbor logic). It exists only to be the correctness
 * ground truth for differential testing against the WASM core (PRD §9); it is
 * NOT part of the shipped runtime.
 */

export {
  undergoFate,
  undergoFateModelA,
  undergoFateModelB,
  undergoFateModelC,
} from './fate.ts';
export { cloneGrid, countState, index, makeGrid, seedColony } from './grid.ts';
export { calculateNeighbors, localZRange, sumAll, sumRange } from './neighbors.ts';
export { Pcg32 } from './rng.ts';
export { simulate } from './simulate.ts';
export * from './types.ts';
