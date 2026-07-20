# ADR 0001 — RNG parity scope and preserved MATLAB quirks

**Status:** Accepted · **Date:** 2026-07-20 · Milestones M1–M6

## Context

The SPA reimplements a MATLAB/Octave cellular automaton (Models A/B/C). Two
questions shape correctness: how faithfully must randomness match the original,
and which of the original's idiosyncrasies do we preserve versus "fix"?

## Decisions

### 1. RNG parity is *statistical* vs MATLAB, but *bit-exact* between our two engines

We do **not** reproduce MATLAB's Mersenne Twister stream. Instead both of our
implementations — the TypeScript reference oracle (`src/core-ts`) and the
Rust/WASM core (`core-wasm`) — share one PRNG: **PCG32 (PCG-XSH-RR, 64/32)**,
validated against the canonical reference vector (seed 42, stream 54).

- Against MATLAB: parity is statistical (distributions of ratio / population /
  M% over many seeds), never bitwise.
- Between our engines: **byte-identical** given the same seed. This is enforced
  by the differential tests (`src/test/wasm-oracle-diff.test.ts`), which compare
  grids at every step across all three models. This is what lets the optimized
  WASM core be trusted against the literal oracle.

Per-simulation seeds in a batch are `baseSeed + jobIndex`, so repeats are
independent yet fully reproducible.

### 2. Faithful quirks are preserved, not corrected

- **Born-cell type tie-break** (Models B/C) uses the **full-height column** E vs
  M totals, while the birth/survival *thresholds* use the **local** 3×3×3 sum.
  These are two different neighborhoods; we compute both separately and keep the
  behavior (PRD §3.2).
- **Model A counts only epithelial neighbors** (`nNeighbors = eNeighbors`).
  Harmless (Model A has no M cells) but preserved verbatim.
- **Movement** is sequential and collision-avoiding, reads the in-progress
  `next` buffer, gathers candidates in x→y→z order, draws `rp` on every entry to
  the branch (even when trapped), and selects `round(rp*(count-1))`.
- Border neighborhoods **clamp, never wrap**.

If any of these is ever deemed a bug, it must change behind a config flag with a
follow-up ADR — never silently.

### 3. Optimizations must not change observable output

The separable convolution, the bounded active region (PRD §5.3), and the SIMD
build are all gated by the differential tests remaining byte-identical.

Two optimizations interact with the RNG and deserve note:

- **Model A skips the whole-dish permutation.** Model A is order-independent and
  draws no RNG after seeding, so its rendered grid is identical whether or not
  the permutation is generated. We skip it — a pure win.
- **Models B/C keep the exact whole-dish permutation** (movement RNG lockstep)
  but skip out-of-region cells, which are empty no-ops that draw no `rp`.

## Consequences

- New engine work is validated by re-running the differential suite; a mismatch
  is a hard failure.
- We accept we cannot reproduce a specific historical MATLAB run bit-for-bit;
  we reproduce its statistics and our own reproducible seed.
