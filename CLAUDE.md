# Cancer AutoMata — SPA implementation

## What this is
A browser SPA reimplementation of the MATLAB cellular-automaton at
https://github.com/Eclion/Cancer-AutoMata — cancer-cell proliferation under
TRAIL stimulation (Models A/B/C, treatments WT/TRAIL/TR+BIM).

**The spec of record is `Cancer-AutoMata-SPA-PRD.md` in this folder. Read it first.**
Follow it section by section; do not re-derive scope.

## Confirmed scope
- Compute core: **Rust → WASM** (`wasm-pack`, `wasm-bindgen`), run in a Web Worker.
- Visualization: **2D dish + population/M% curves**. No 3D view in v1 (keep model 3D-native).
- A small **pure-TS reference oracle** exists for differential testing only — not shipped.

## Stack (pin latest stable at scaffold time; versions current 2026-07-20)
- Vite 8.1.x (Rolldown) · React 19.2.x · TypeScript
- wasm-pack 0.15 / wasm-bindgen 0.2.126 (Rust ≥ 1.77)
- Comlink (worker RPC) · uPlot (charts) · Zustand (state) · Zod (schema/validation)
- Vitest + Playwright (tests) · Biome (lint/format)

## Non-negotiable correctness details (see PRD §3, §5)
- 3×3×3 Moore neighborhood, **self-inclusive**, rules use `sum(...) - 1`.
- Birth/survival thresholds use the **local** 3×3×3 sum; E-vs-M born-type tie-break
  uses **full-height column** E/M totals (faithful quirk — preserve, don't "fix").
- Birth/survival = synchronous from previous grid; **M-cell movement = sequential/
  async** (reads the `next` buffer for occupancy), processed in seeded-random order.
- Optimization: separable box convolution for neighbor counts + bounded active region
  + Uint8 double-buffered grid + zero-copy grid→ImageData render.
- RNG parity with MATLAB is **statistical, not bitwise** (seeded PRNG in the core).

## Workflow expectations
- Dedicated git branch per change; small, scoped commits; keep a CHANGELOG.
- Differential tests (WASM vs TS oracle, identical seed) must pass before a model is "done".
- Milestones M0–M7 are defined in PRD §11. Start at M0.

## Prereqs to install locally
- Rust toolchain: `curl https://sh.rustup.rs -sSf | sh` then `rustup target add wasm32-unknown-unknown`
- `cargo install wasm-pack`
- Node ≥ 22, npm.
