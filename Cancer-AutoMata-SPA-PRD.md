# PRD — Cancer AutoMata (Single-Page Web Application)

**Author:** Claude (Opus 4.8)
**Status:** Draft v1
**Date:** 2026-07-20
**Audience:** Implementing engineer (you)
**Source project:** [Eclion/Cancer-AutoMata](https://github.com/Eclion/Cancer-AutoMata) — MATLAB/Octave cellular automaton

---

## 1. Context

The original project is a MATLAB/Octave desktop app that simulates cancer-cell proliferation under TRAIL stimulation using a 3D Game-of-Life-style cellular automaton (CA). It is based on rule-sets defined in *"Defining rules for cancer cell proliferation in TRAIL stimulation"* and the stochastic TRAIL model of Piras, Hayashi, Tomita & Selvarajoo (2012).

**What the original does, mechanically:**

- Seeds a circular colony of cells in a 3D dish grid (`dishSize × dishSize × dishHeight`).
- Each cell is one of three states: **empty (0)**, **mesenchymal / M (1, red)**, **epithelial / E (2, green)**.
- Steps the grid forward with birth/survival rules (3D Moore neighborhood), for three rule variants: **Model A**, **Model B**, **Model C**.
- Runs each parameter set across three treatment conditions — **WT**, **TRAIL**, **TR+BIM** — each with a different mean surviving fraction (gamma-distribution mean from the stochastic model).
- Outputs: population-vs-step curves, a survival ratio (`pS`), M-cell percentage over time, and optional 2D/3D dish snapshots as PNGs.

**Pain points the SPA fixes:**

- Requires a MATLAB/Octave install; not shareable.
- "10–20 min per 20-step run on MATLAB, ≥2 h on Octave" — the reference implementation is O(cells × neighborhood) per step with heavy redundant recomputation.
- No interactivity: you tweak `config.ini`, run, wait, inspect PNGs.

**This PRD** specifies a browser-based SPA that is (a) install-free, (b) **numerically faithful** to the original models, and (c) **orders of magnitude faster** via a WASM compute core + an algorithmically better neighbor-count, so that runs are interactive rather than batch.

---

## 2. Goals / Non-goals

### Goals

- Faithful reimplementation of Models A/B/C, the three treatments, and the seeding logic.
- Interactive parameter editing → run → live 2D dish + live population/ratio curves.
- **Optimized** engine: Rust→WebAssembly hot loop, separable neighbor convolution, bounded active region, zero-copy render. Target: a default-parameter run completes in **seconds**, not minutes.
- Reproducible runs (seeded PRNG) and exportable results (PNG dish, CSV/JSON series).
- Static-hostable SPA (no backend).

### Non-goals (v1)

- **3D WebGL dish view** — dropped for v1 per scope decision (2D + curves only). Keep the data model 3D-native so a 3D view can be added later without rework.
- User accounts, server-side persistence, multi-user.
- Exact bit-for-bit RNG parity with MATLAB's Mersenne Twister (we match *statistical* behavior and our own reproducible seed; see §9).
- Mobile-first layout (desktop-first; responsive is a bonus).

---

## 3. Faithful model reference (extracted from source)

This section is the spec of record for the engine. It is derived directly from `simulateCancer.m`, `calculateNeighbors.m`, `undergoFateModel{A,B,C}.m`, `listAvailableNeighborPositions.m`, `sumCells.m`, and `runSimulationBatch.m`.

### 3.1 Grid & cell states

| Value | Meaning | Render color |
|------:|---------|--------------|
| 0 | empty / dead | black (transparent) |
| 1 | Mesenchymal (M) | red |
| 2 | Epithelial (E) | green |

Grid dimensions: `dishSize × dishSize × dishHeight`. Defaults observed: `dishSize` 300–550, `dishHeight` 2 (Model C) or 4 (Models A/B).

### 3.2 Neighborhood semantics (critical — get this exactly right)

`calculateNeighbors(x,y,grid)` returns, **for every z-layer**, the count of E and of M cells inside the 3×3 `(x,y)` window at that layer (Moore window in-plane, clamped at borders — no wraparound).

The fate functions then use `sum(nNeighbors(dz))` where `dz = z-1 : z+1` (clamped). So the effective neighbor count for a cell at `(x,y,z)` is the **3D Moore neighborhood (3×3×3)** live-cell count, **including the cell itself**, and the rules subtract 1 for the cell's own occupancy (`sum(...) - 1`). Border cells have truncated (smaller) neighborhoods — clamp, do **not** wrap.

> ⚠️ **Faithful quirk to preserve:** for born-cell *type* (E vs M) in Models B/C, the code compares `sum(eNeighbors) > sum(mNeighbors)` where these are summed over **all z-layers of the column**, not just the local `dz`. Birth/survival *thresholds* use the local 3×3×3 sum, but the E/M tie-break uses the **full-height column** E vs M totals. Replicate both neighborhoods separately (§5.2). If a future ADR decides this is a bug, change it behind a config flag — do not silently "fix" it.

### 3.3 Update ordering (parallelization constraint)

- Birth & survival transitions read the **previous** grid state (synchronous CA update) and write into a `next` buffer.
- **M-cell movement (Models B, C)** is **asynchronous/sequential**: a moving M cell reads the `next` buffer to find an empty target (`cells==0 && nextStepCells==0`) so cells don't collide within the same step. Cells are processed in a **random permutation order** each step (`randperm(dishSize^2)`).
- Implication: birth/survival is embarrassingly parallel; **movement is not** (it mutates shared occupancy as it goes). See §5.4 for how we keep determinism while still vectorizing the parallel part.

### 3.4 Rule sets

Let `L` = local 3×3×3 live-neighbor count (self excluded). Survival range `[minS, maxS]`, birth range `[minB, maxB]`.

**Model A** (E cells only; `pMesen` forced to 0, `dishHeight` 4):

- Empty cell → born **E** if `L ∈ [minB, maxB]`.
- E cell → dies if `L ∉ [minS, maxS]`.
- Default rules: survival 2–3, birth 3 (classic Conway-like).

**Model B** (E + M, with movement; `dishHeight` 4):

- Empty → born; type = E if column-E > column-M else M, when `L ∈ [minB, maxB]`.
- E cell with `L ∉ [minS, maxS]` → dies (→ 0).
- E cell with `L ∈ [minS, maxS]` → becomes **M** (converted).
- M cell → moves to a random available empty Moore neighbor (3D); if none available → becomes **E**.
- Default rules: survival 2–3, birth 3.

**Model C** (paper rule-set; `dishHeight` 2; default survival 4–8, birth 2–7):

- i. E cell with `L < minS` → becomes **M** (under-population).
- ii. M cell with `L > maxS` → becomes **E** (overcrowding).
- iii. Empty cell with `L ∈ [minB, maxB]` → born; type = E if column-E > column-M else M.
- iv. M cell → moves randomly to an empty Moore neighbor.
- v. M cell unable to move → becomes **E**.

### 3.5 Seeding (initial colony)

From `simulateCancer.m`:

```
spacingOffset = 0.6
radius = sqrt(initialNumberOfCells / (spacingOffset * pi))
for each (i,j) in dishSize×dishSize:
  if rand() < spacingOffset * mean            // 'mean' = treatment survival mean
     AND (i - dishSize/2)^2 + (j - dishSize/2)^2 < radius^2:   // inside disk
        if rand() < pMesen/100: cell(i,j,1) = 1 (M)
        else:                   cell(i,j,1) = 2 (E)
```

Seeding is only in layer `z=1`. `mean` is the treatment's post-TRAIL surviving fraction (§3.6). `pMesen` is the M-cell percentage input (0 for Model A).

### 3.6 Treatments & outputs

Three named conditions with per-model gamma means:

| Condition | Model A/B mean | Model C mean | Default M% |
|-----------|---------------:|-------------:|-----------:|
| WT | 1.00 | 0.92 | 2 |
| TRAIL | 0.59 | 0.29 | 10 |
| TR+BIM | 0.05 | 0.0125 | 95 |

Per-simulation outputs to reproduce:

- `nbCells[step]` — total live cells per step (population curve).
- `Mpercents[step]` — M fraction of live cells per step.
- `ratio = nbCells[0] / initialNumberOfCells` — survival ratio (pS).
- Growth rate `nbCells[end] / min(nbCells)`.
- Optional 2D dish snapshot at configured `snapshotSteps`.

Batch structure: for each M% value → for each treatment (WT/TRAIL/TR+BIM) → `nbSimulations` repeats. Curves are overlaid per treatment (colors blue/red/green in the original).

---

## 4. Product scope & UX

### 4.1 Layout (single page)

- **Left panel — Parameters** (mirrors the MATLAB UI): model selector (A/B/C), rules (survival min/max, birth min/max, auto-set to model defaults but overridable), simulation params (nb simulations, nb steps, initial cell count, M% array), dish params (size, height), snapshot steps, RNG seed.
- **Center — 2D dish viewport:** Canvas, E=green / M=red on black, pan + zoom (nearest-neighbor, no smoothing), a **step scrubber** to replay any captured step, play/pause/step controls, live update while running.
- **Right — Charts:** population-vs-step (overlaid per treatment/sim), M%-vs-step, and a results table (ratio, growth rate) per condition.
- **Top bar:** Run / Pause / Reset, progress (`current sim x / N`), throughput (steps/s, cells/s), export menu.

### 4.2 Key interactions

- Selecting a model auto-populates the rule defaults and dish height exactly as the MATLAB callbacks do (A/B: height 4, survival 2–3, birth 3; C: height 2, survival 4–8, birth 2–7).
- Run streams updates: dish repaints and charts append per step without blocking the UI.
- Reproducibility: a visible **seed** field; same seed + same params ⇒ identical run.
- Export: dish PNG (per step), series as CSV + JSON, full run config as JSON.

---

## 5. Data model & optimization (the core of this PRD)

### 5.1 In-memory representation

- **Grid buffer:** a single flat `Uint8Array` of length `W*H*D` (`W=H=dishSize`, `D=dishHeight`), values `{0,1,2}`. One byte per cell is the sweet spot: trivially indexable, cache-friendly, directly mappable to canvas pixels, and cheap to transfer/share. (2-bit packing would quadruple density but destroys random-access speed for the neighbor kernels — not worth it at these sizes; 550²×4 ≈ 1.21 MB.)
- **Indexing:** `idx = x + y*W + z*W*H` (layer-major: each z-layer is contiguous). This makes in-plane 3×3 window reads and the per-layer horizontal/vertical convolution passes sequential in memory.
- **Double buffering:** two grid buffers (`cur`, `next`), swapped each step — never reallocate inside the loop.
- **Auxiliary count planes** (reused, never reallocated): `liveCount`, `eColumn`, `mColumn` (see §5.2).
- **PRNG:** a fast seeded generator (`xoshiro256**` or `pcg32`) carried in the WASM core so runs are deterministic and worker/main agree.

**TypeScript view of the model:**

```ts
type CellState = 0 | 1 | 2;            // empty | M | E
type Model = 'A' | 'B' | 'C';
type Treatment = 'WT' | 'TRAIL' | 'TR_BIM';

interface Grid {
  width: number;   // dishSize
  height: number;  // dishSize
  depth: number;   // dishHeight
  data: Uint8Array; // length = width*height*depth, layer-major
}
```

### 5.2 Neighbor counting — the algorithmic win

The original recomputes a full 3×3 sum **per cell, per z-layer, every step** — roughly O(cells × 27) with massive overlap. We replace it with **separable summed convolution**, computed once per step over the whole grid:

- **Local 3D Moore live-count `L(x,y,z)`** via three 1-D box passes of width 3:
  1. horizontal pass over x → partial row sums,
  2. vertical pass over y → in-plane 3×3 sums per layer,
  3. depth pass over z (`z-1..z+1`) → full 3×3×3 sum.
  Cost drops from ~27 reads/cell to ~9 (3 passes × 3). Combined with reuse buffers, this is the dominant speedup and it composes with WASM/SIMD.
- **Column E/M totals** (`eColumn`, `mColumn`) for the born-type tie-break: collapse E and M occupancy across z into two 2-D planes, then a **2-D separable 3×3 box** over each. Computed once per step, O(cells).
- Store `L`, `eColumn`, `mColumn` in preallocated typed arrays; the fate kernel then reads them in O(1) per cell.

> Correctness note: because the original excludes self via `sum(...) - 1` and the born-type tie-break uses full-column sums, keep `L` inclusive-of-self and subtract 1 in the survival/conversion tests, and keep the column planes separate. Encode this in unit tests against the TS oracle (§9).

### 5.3 Bounded active region (sparsity)

The colony is a disk that grows slowly; most of a 550² grid is empty for many steps. Track a **dirty bounding box** (min/max x,y that are non-empty, plus a 1-cell margin) and run all passes only within it, expanding as the colony spreads. This avoids scanning millions of guaranteed-empty cells early in a run. (Optional later: tile/chunk the grid and skip all-empty tiles — deferred unless profiling demands it.)

### 5.4 Update ordering under optimization

- **Birth / survival / conversion**: pure function of `cur` + count planes → write `next`. Fully vectorizable; SIMD-friendly; parallelizable by row/tile if we enable threads.
- **M-cell movement**: must stay **sequential and deterministic**. Process moving M cells in a seeded permutation order, reading/writing `next` occupancy as we go (exactly the original's collision-avoidance). This part is serial by nature; keep it in one pass after the parallel part. Because it's a small fraction of cells (only M cells that need to move), it isn't the bottleneck.

### 5.5 Rendering path (zero-copy)

- The WASM linear memory holding the grid buffer is exposed to JS as a `Uint8Array` view — **no copy** per frame.
- A small mapping kernel writes an `ImageData` (RGBA) straight from the grid layer(s): `1→(255,0,0)`, `2→(0,255,0)`, `0→transparent/black`. Use `OffscreenCanvas` in the worker where available; blit with `putImageData`, scale with `imageSmoothingEnabled=false` for crisp cells.
- For "flatten 3D → 2D" (the original `cellsToRGB` sums layers), replicate its top-down projection: a cell shows if any layer at `(x,y)` is occupied, M taking precedence per the original's channel logic.

### 5.6 Threading & delivery

- Entire simulation runs in a **Web Worker** so the main thread only renders and handles input. Use **Comlink** for ergonomic RPC.
- Grid buffer shared via `SharedArrayBuffer` (needs COOP/COEP headers) for zero-copy read on the main thread; fall back to `postMessage` transfer if cross-origin isolation is unavailable.
- Optional **wasm threads + SIMD** (`wasm32` with `+simd128`, `+atomics`) behind capability detection; single-threaded SIMD build as the default, multi-thread as progressive enhancement.

---

## 6. Architecture

```
┌───────────────────────────── Main thread (UI) ─────────────────────────────┐
│  React 19 + TypeScript                                                      │
│  ├─ Parameters panel (controlled form, Zod-validated)                       │
│  ├─ Dish viewport  ── reads shared grid buffer ─► Canvas/OffscreenCanvas    │
│  ├─ Charts (uPlot): population, M%, results table                           │
│  └─ Store (Zustand): config, run status, series                            │
│                    │ Comlink RPC (start/pause/step/seed/config)             │
└────────────────────┼───────────────────────────────────────────────────────┘
                     ▼
┌──────────────────── Web Worker (simulation host) ───────────────────────────┐
│  TS glue ─► WASM core (Rust, wasm-bindgen)                                   │
│  ├─ Grid (cur/next Uint8), count planes, seeded PRNG                         │
│  ├─ step(): convolution → fate kernel (A/B/C) → movement pass               │
│  ├─ batch runner: M% × treatment × repeats                                  │
│  └─ emits per-step: {nbCells, mPercent} + optional snapshot signal          │
└─────────────────────────────────────────────────────────────────────────────┘

  Reference oracle (dev/test only): pure-TS port of the same kernels, used for
  differential testing against the WASM core. Not shipped in the app bundle.
```

**Module boundaries**

- `@core-wasm` (Rust crate): grid, PRNG, convolution, fate kernels, batch loop. No DOM, no rendering. Compiled with `wasm-pack`.
- `@core-ts` (dev): line-by-line TS port of the kernels = correctness oracle.
- `worker/`: Comlink-exposed API around the WASM core.
- `render/`: grid→ImageData mapping, OffscreenCanvas management, pan/zoom.
- `ui/`: React components, forms, charts, state.
- `schema/`: Zod schemas + TS types for config, run, series, export.

---

## 7. Technology stack (latest stable, verified 2026-07-20)

| Layer | Choice | Version | Why |
|-------|--------|---------|-----|
| Build/dev | **Vite** (Rolldown-based) | 8.1.x | Fast Rust-bundler builds; first-class WASM + Web Worker + `SharedArrayBuffer` header config. |
| UI framework | **React** + TypeScript | 19.2.x | Familiar, strong ecosystem; the heavy work is off-thread so framework overhead is irrelevant. |
| Compute core | **Rust → WASM** via `wasm-pack` / `wasm-bindgen` | wasm-pack 0.15.0, wasm-bindgen 0.2.126 (Rust ≥ 1.77) | Native-speed hot loop; SIMD (`simd128`) and optional threads/atomics; zero-copy memory to JS. |
| Worker RPC | **Comlink** | latest | Ergonomic main↔worker calls, Transferables/SAB. |
| Charts | **uPlot** | 1.6.x | ~50 KB, Canvas-2D, 60 fps streaming of large series — matches "fast + light" goal. |
| State | **Zustand** | latest | Minimal, no boilerplate. |
| Validation | **Zod** | latest | Runtime-validate config + import/export; single source of TS types. |
| Tests | **Vitest** + Playwright | latest | Unit/differential tests (Vitest) + E2E/visual (Playwright). |
| Lint/format | **Biome** | latest | One fast tool for lint + format. |

> Pin exact patch versions at scaffold time (`npm create vite@latest`); the table records what was current on 2026-07-20. Note `wasm-bindgen` crate and CLI versions must match exactly or the build errors cryptically.

**Why WASM over pure TS here:** the workload is a tight integer kernel over ~10⁶ cells × tens of steps × multiple sims — exactly where JS JIT variance and GC hurt and where Rust/WASM + SIMD give predictable multi-× speedups with zero-copy buffers. The pure-TS kernel still exists, but as the **test oracle**, not the runtime.

---

## 8. Configuration schema (replaces `config.ini`)

```ts
import { z } from 'zod';

export const RunConfig = z.object({
  model: z.enum(['A', 'B', 'C']),
  rules: z.object({
    survivalMin: z.number().int().min(0),
    survivalMax: z.number().int().min(0),
    birthMin: z.number().int().min(0),
    birthMax: z.number().int().min(0),
  }).refine(r => r.survivalMin <= r.survivalMax && r.birthMin <= r.birthMax,
            'min must be ≤ max'),
  dish: z.object({
    size: z.number().int().positive(),      // dishSize
    height: z.number().int().positive(),    // dishHeight
  }),
  simulation: z.object({
    initialCells: z.number().int().positive(),  // INIT_NB_CELLS
    steps: z.number().int().positive(),          // NB_STEPS
    repeats: z.number().int().positive(),        // NB_SIMULATIONS
    mesenchymalPercentages: z.array(z.number().min(0).max(100)), // [] ⇒ per-treatment defaults 2/10/95
  }),
  treatments: z.array(z.enum(['WT', 'TRAIL', 'TR_BIM'])).default(['WT','TRAIL','TR_BIM']),
  snapshots: z.object({
    enabled2D: z.boolean(),
    steps: z.array(z.number().int().min(0)),     // SNAPSHOT_STEPS
  }),
  seed: z.number().int().nonnegative(),          // reproducibility
});
export type RunConfig = z.infer<typeof RunConfig>;

export const StepSample = z.object({
  step: z.number().int(),
  nbCells: z.number().int(),
  mPercent: z.number(),          // 0..1
});

export const SimulationResult = z.object({
  treatment: z.enum(['WT', 'TRAIL', 'TR_BIM']),
  mesenchymalPercentage: z.number(),
  repeatIndex: z.number().int(),
  series: z.array(StepSample),
  ratio: z.number(),             // pS = nbCells[0] / initialCells
  growthRate: z.number(),        // nbCells[end] / min(nbCells)
});
```

Model defaults applied on model switch (mirroring the MATLAB callbacks):

| Model | survival | birth | dishHeight |
|-------|----------|-------|-----------:|
| A | 2–3 | 3–3 | 4 |
| B | 2–3 | 3–3 | 4 |
| C | 4–8 | 2–7 | 2 |

---

## 9. Correctness & validation strategy

1. **TS reference oracle** (`@core-ts`): a literal port of `undergoFateModel{A,B,C}` + neighbor logic, un-optimized, easy to read against the `.m` files.
2. **Differential testing** (Vitest): run WASM core and TS oracle on the same seed/config for small grids across all three models; assert byte-identical grids after N steps and identical `nbCells`/`Mpercents` series. This is what makes the optimized convolution safe.
3. **Optimization equivalence**: assert the separable-convolution neighbor counts equal a brute-force 3×3×3 reference on randomized grids (property test), including border-clamping and the self-exclusion `-1`.
4. **Statistical parity vs MATLAB**: since RNG streams differ, compare *distributions* — mean/CI of `ratio`, final population, and M% over many seeds against a captured MATLAB baseline for default params. Document tolerances in an ADR.
5. **Determinism**: same seed + config ⇒ identical output (unit test).
6. **Visual regression** (Playwright): snapshot the 2D dish at configured steps for a fixed seed.

---

## 10. Performance targets

| Metric | Target |
|--------|--------|
| Default-params single run (Model C, dish 300, 20 steps) | < 3 s end-to-end (goal), interactive progress |
| UI responsiveness during run | main thread never blocked > 16 ms (all compute in worker) |
| Dish repaint | ≥ 30 fps at dish 550 via zero-copy ImageData |
| Memory | ≤ ~2 grid buffers + count planes (≈ a few MB at 550²×4) |
| Chart streaming | 60 fps append (uPlot) |

Instrument steps/s and cells/s in the top bar; expose a "benchmark" dev mode that runs a fixed seed and reports timings for regression tracking.

---

## 11. Milestones

1. **M0 — Scaffold & headers.** Vite + React + TS + Biome + Vitest; worker plumbing (Comlink); COOP/COEP for `SharedArrayBuffer`; WASM build pipeline (`wasm-pack`) wired into Vite.
2. **M1 — TS reference oracle.** Port Models A/B/C, seeding, neighbor logic verbatim; validate against hand-computed small cases. (This is your correctness ground truth.)
3. **M2 — WASM core, Model A.** Grid, PRNG, separable convolution, fate kernel A; differential test vs oracle green.
4. **M3 — Models B & C.** Column E/M planes, M-cell movement pass, conversions; differential tests green for all three.
5. **M4 — Render & UI.** 2D dish (pan/zoom/scrubber), parameter panel with model defaults, run/pause/step, uPlot curves + results table.
6. **M5 — Batch + treatments.** M% × treatment × repeats loop, overlaid curves, ratio/growth outputs, progress + throughput.
7. **M6 — Bounded active region + SIMD.** Dirty bbox; SIMD build; optional threads behind detection; benchmark mode.
8. **M7 — Export & polish.** PNG/CSV/JSON export, config import/export (Zod), visual-regression tests, docs, static deploy.

---

## 12. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| The E/M column-sum tie-break quirk gets "accidentally fixed" | Encode it in the oracle + differential tests; gate any change behind a config flag + ADR. |
| `SharedArrayBuffer` unavailable (no cross-origin isolation) | Feature-detect; fall back to transferable `postMessage`; single-thread build default. |
| RNG divergence from MATLAB confuses "faithfulness" | Explicitly scope parity as *statistical*, not bitwise; document baselines and tolerances. |
| Movement pass serialization limits threading | It's a minority of cells; keep it serial, parallelize only birth/survival; profile before optimizing further. |
| WASM toolchain friction (bindgen crate/CLI mismatch) | Pin exact matching versions; CI check; document in README. |
| Large dish (550²×4) memory/paint cost | Uint8 buffers + bounded region + nearest-neighbor blit; cap dish size in UI with a warning. |

---

## Appendix A — Source-file → responsibility map

| Original `.m` | SPA home |
|---------------|----------|
| `simulateCancer.m` | `@core-wasm` step loop + seeding; `render/` for snapshot mapping |
| `undergoFateModelA/B/C.m` | fate kernels in `@core-wasm` (+ `@core-ts` oracle) |
| `calculateNeighbors.m` | separable convolution in `@core-wasm` (§5.2) |
| `listAvailableNeighborPositions.m` | movement pass (empty-neighbor search) |
| `sumCells.m` | count reductions (fused into convolution) |
| `runSimulationBatch.m` | worker batch runner (M% × treatment × repeats) |
| `UI.m` | React parameters panel + run controls |
| `config.ini` | `RunConfig` Zod schema + import/export |
