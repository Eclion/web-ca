# Changelog

All notable changes to this project are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/); milestones
refer to `Cancer-AutoMata-SPA-PRD.md` §11.

## [Unreleased]

### M1 — TS reference oracle

- Added `@core-ts` (`src/core-ts/`): a literal, un-optimized TypeScript port of
  the original MATLAB cellular automaton, to serve as the correctness ground
  truth for differential testing against the WASM core (PRD §9). Not shipped in
  the app bundle.
  - `rng.ts` — `Pcg32` (PCG-XSH-RR 64/32), the shared reproducibility contract
    the Rust core will reimplement bit-for-bit. Verified against the canonical
    PCG32 reference vector (seed 42, stream 54).
  - `grid.ts` — flat layer-major grid + faithful colony seeding (one `rand()`
    per cell, a second only for seeded cells; 1-indexed disk test).
  - `neighbors.ts` — per-layer E/M counts over the clamped 3×3 window
    (`calculateNeighbors.m`), plus local-dz and full-column sum helpers.
  - `fate.ts` — literal ports of `undergoFateModel{A,B,C}` and the sequential
    M-cell movement pass; preserves the born-type "full-height column" tie-break
    quirk (PRD §3.2) and Model A's E-only neighbor count.
  - `simulate.ts` — `simulateCancer.m` main loop: seeded random column order,
    threaded `next` buffer, `ratio`/`nbCells`/`Mpercents` series, snapshots.
- 31 Vitest cases: RNG reference vector + determinism, brute-force neighbor
  property test, hand-computed Conway blinker, Model B/C rule-by-rule cases, the
  column tie-break quirk, and full-run determinism.
- Downloaded the original `.m` sources and ported against them directly rather
  than from the PRD summary.

### M0 — Scaffold & headers

- Initialised Vite 8 (Rolldown) + React 19 + TypeScript project at the repo root.
- Configured Biome (lint + format) and Vitest (jsdom environment).
- Added Rust crate `core-wasm/` (wasm-bindgen) with trivial `core_version()` /
  `add()` exports, built via `wasm-pack build --target web` into `src/wasm/`
  (git-ignored, rebuilt by `pre{dev,build,test}` scripts).
- Web Worker plumbing via Comlink: `src/worker/sim.worker.ts` exposes a typed API;
  `src/worker/client.ts` wraps it for the main thread.
- `vite.config.ts` serves COOP/COEP response headers (`Cross-Origin-Opener-Policy:
  same-origin`, `Cross-Origin-Embedder-Policy: require-corp`) in both dev and
  preview, enabling cross-origin isolation / `SharedArrayBuffer`.
- End-to-end smoke test: the React app boots the worker, initialises WASM, calls
  the WASM exports over Comlink, and renders the results plus the
  cross-origin-isolation status. Verified in-browser (`add(19,23)=42`, isolated:
  yes) and headlessly via a Vitest WASM-core test.
- Pinned Vitest to 4.x (first line to peer-support Vite 8 / Rolldown).
- Added `.gitignore`, `README.md`, this changelog.
