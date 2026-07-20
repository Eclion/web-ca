# Changelog

All notable changes to this project are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/); milestones
refer to `Cancer-AutoMata-SPA-PRD.md` §11.

## [Unreleased]

### M7 — Export & polish

- **Export** (`src/export/exporters.ts`): dish **PNG** (native resolution, per
  step), series **CSV** (long format), results **JSON** (config + per-condition
  + per-sim series), and **config JSON**. Download buttons live in the dish
  scrubber (PNG) and the Results panel (CSV/JSON).
- **Config import/export (Zod)**: export the current config; import a config
  file validated against `RunConfigSchema` (`parseConfig`), with a readable
  error on invalid input. Buttons in the Parameters panel.
- **Render-regression test** (`src/test/render-regression.test.ts`): a
  deterministic dish snapshot — a fixed run's final grid is projected to RGBA
  and its pixel signature (E/M/empty counts + FNV hash) is snapshotted, catching
  projection/engine render changes without browser-screenshot flakiness.
- **Docs**: expanded README (usage, export/import, testing, deployment,
  architecture) and [ADR 0001](./docs/adr/0001-rng-parity-and-faithful-quirks.md)
  documenting the RNG-parity scope and preserved MATLAB quirks.
- **Static deploy**: `dist/` is backend-free and works without special headers
  (the grid is transferred via `postMessage`, not `SharedArrayBuffer`); a sample
  `public/_headers` enables cross-origin isolation where the host supports it.

### M6 — Bounded active region + SIMD

- **Bounded active region (PRD §5.3):** the core now tracks the colony's tight
  bounding box (+1-cell margin) and runs the convolution, column counts, fate
  kernel, and population count only inside it — instead of scanning the whole
  dish every step. Added `_region` variants of the convolutions
  (`compute_live_counts_region` / `compute_column_counts_region`) that restrict
  the output rectangle; each is bit-identical to the full computation inside it
  (Rust test) . Model A skips the whole-dish permutation entirely (order-
  independent, draws no RNG); Models B/C keep the exact permutation for movement
  RNG parity and skip out-of-region no-op cells. **Differential tests remain
  byte-identical for all three models**, including new larger-dish cases.
- **SIMD build (PRD §5.6):** `core-wasm/.cargo/config.toml` enables
  `target-feature=+simd128` for the wasm target (host `cargo test`/`clippy`
  unaffected); differential tests confirm results are unchanged.
- **Capability detection:** the worker reports SIMD / threads / cross-origin
  isolation; the top bar shows `SIMD · COI: yes`. (Multi-threading itself is
  deferred — the movement pass is inherently sequential; detection is in place.)
- **Benchmark mode (PRD §10):** a top-bar Benchmark button runs a fixed timed
  simulation and reports steps/s and Mcell-updates/s (≈405 steps/s, 65 Mcell/s
  for the default 200² run).

### M5 — Batch + treatments

- Runs are now batches: `RunConfig` gains `treatments[]`,
  `mesenchymalPercentages[]`, and `repeats`. `buildJobs` expands them into one
  simulation per (M% × treatment × repeat) in the source order, using each
  treatment's default M% when the list is empty and a distinct deterministic
  seed (`baseSeed + index`) per sim.
- The store runs the job queue sequentially, streaming the current sim per step
  (dish + scrubber stay live) while accumulating completed series; batch
  pause/resume and per-condition aggregation (mean pS / growth over repeats).
- Charts overlay one line per simulation, coloured by treatment (WT blue /
  TRAIL red / TR+BIM green); the results table aggregates per condition. The top
  bar shows `Sim x / N`, completed count, and throughput.
- Verified in-browser: a 3-treatment batch produces three overlaid curves whose
  survival ratios track the treatment means (1.003 / 0.593 / 0.049), and
  `repeats = 2` yields n = 2 per condition with averaged outputs.
- Fixed an overlay-chart bug where a sim hand-off could freeze a series' colour
  (uPlot's series set is fixed at creation): the plot now rebuilds on colour
  signature, and a `currentLive` flag prevents the transient duplicate.

### M4 — Render & UI

- The engine now reaches the screen: replaced the M0 smoke page with the real
  single-run application.
- **Worker**: rewrote `sim.worker.ts` to drive the WASM `Simulation` — `init`
  seeds and returns step 0 + dims + ratio; `step` advances and returns a frame
  with the grid as a transferable; `series` returns the full curves.
- **Config** (`schema/config.ts`): Zod `RunConfig` with validation, model
  defaults on switch, treatment-mean resolution, and a large-dish warning.
- **State** (`store/simStore.ts`): Zustand store + run-loop controller
  (run/pause/step/reset), per-step frame history for the scrubber, throughput,
  and a growth-rate selector. The loop yields via a macrotask so it keeps
  running when the tab is backgrounded (rAF throttles there).
- **Render** (`render/project.ts`): faithful top-down 3D→2D projection (topmost
  occupied layer wins, per `cellsToRGB`); `DishCanvas` blits it with
  nearest-neighbor scaling under pan/zoom.
- **UI**: three-pane layout — parameters panel (model/treatment/rules/dish/sim
  with model defaults), dish viewport with a step scrubber + legend, uPlot
  population & M% charts, results table (ratio, growth rate), and a top bar with
  run controls, progress, throughput, and the cross-origin-isolation indicator.
- Verified in-browser: Model A renders all-green (E-only), Model B renders
  red-dominated with E→M conversion, charts stream, the scrubber replays any
  captured step, and COI is active. Added schema + projection unit tests.

### M3 — WASM core, Models B & C

- Added the full-height **column E/M planes** to `neighbors.rs`
  (`compute_column_counts`): flatten E/M occupancy across z, then a 2-D
  separable 3×3 clamped box (PRD §5.2) — used for the born-cell type tie-break.
  Unit-tested against a brute-force column count.
- Implemented the **Model B and Model C** fate kernels in `sim.rs`, including
  the sequential **M-cell movement pass** (`move_or_convert_m`): candidates
  gathered in x→y→z order, occupancy read from the in-progress `next` buffer for
  collision avoidance, `rp` drawn on every entry to the movement branch (even
  when trapped), and target chosen by `round(rp*(count-1))`. Birth no longer
  clobbers cells an earlier move wrote into.
- **Differential tests green for all three models (PRD §9):** WASM and the TS
  oracle are byte-identical at every step (grids + nbCells/mPercents/ratio) for
  A, B, and C across dish sizes, seeds, and M% values (2/10/95).
- Added Rust B/C determinism tests; `cargo fmt`/`clippy` clean.

### M2 — WASM core, Model A

- Implemented the Rust/WASM compute core for Model A (`core-wasm/src/`):
  - `rng.rs` — `Pcg32` ported to native `u64`/`u32` wrapping arithmetic;
    validated against the canonical reference vector and, via new debug exports
    (`pcg32_sequence` / `pcg32_default_sequence` / `pcg32_permutation`), proven
    byte-identical to the TS oracle's PRNG.
  - `grid.rs` — colony seeding with the same f64 expressions and RNG-draw
    discipline as `seedColony`.
  - `neighbors.rs` — separable 3-pass box convolution (PRD §5.2) with per-axis
    border clamping; equals a brute-force 3×3×3 count exactly. Buffers are
    preallocated and reused each step.
  - `sim.rs` — double-buffered `Simulation` with the Model A fate kernel,
    population/M%/ratio series, step/run driving.
  - `lib.rs` — `wasm-bindgen` `Simulation` class (plus the retained M0 smoke
    exports).
- **Differential test green (PRD §9):** WASM and the TS oracle produce
  byte-identical grids at every step and identical `nbCells`/`mPercents`/`ratio`
  for Model A across multiple dish sizes, seeds, and a degenerate empty dish.
- 8 native Rust unit tests (RNG, convolution-vs-brute-force, sim determinism)
  and 8 new Vitest cases (RNG parity + differential runs). `cargo fmt`/`clippy`
  clean.

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
