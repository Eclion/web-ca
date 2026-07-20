# Cancer AutoMata — SPA

A browser single-page-app reimplementation of the [Eclion/Cancer-AutoMata](https://github.com/Eclion/Cancer-AutoMata)
MATLAB cellular automaton: cancer-cell proliferation under TRAIL stimulation
(Models A/B/C; treatments WT / TRAIL / TR+BIM).

The compute core is **Rust → WebAssembly** running in a **Web Worker**; the UI is
**React 19 + TypeScript** built with **Vite 8**. See
[`Cancer-AutoMata-SPA-PRD.md`](./Cancer-AutoMata-SPA-PRD.md) for the full spec.

> **Status:** Milestone **M6** complete — interactive **batches** with an
> optimized core: a bounded active region skips empty dish space (byte-identical
> to the reference), a SIMD wasm build, capability detection, and a Benchmark
> button. Pick a model, treatments, M% values and repeats, Run, and watch the 2D
> dish plus overlaid per-treatment curves. Export/polish is M7. See the
> [CHANGELOG](./CHANGELOG.md) and PRD §11 for the plan.

## Prerequisites

- **Node ≥ 22** and npm.
- **Rust ≥ 1.77** with the wasm target and **wasm-pack** (the WASM core is built
  from source):
  ```sh
  curl https://sh.rustup.rs -sSf | sh
  rustup target add wasm32-unknown-unknown
  cargo install wasm-pack        # pinned to 0.15.x — see below
  ```
  `wasm-pack` must be on your `PATH`; the npm scripts invoke it.

## Setup

```sh
npm install
```

## Common tasks

| Command | What it does |
|---------|--------------|
| `npm run dev` | Build the WASM core, then start the Vite dev server (with COOP/COEP headers). |
| `npm run build` | Build the WASM core, type-check, and produce a production bundle in `dist/`. |
| `npm run preview` | Serve the production build locally (also with COOP/COEP headers). |
| `npm test` | Build the WASM core, then run the Vitest suite. |
| `npm run wasm` | (Re)build only the Rust → WASM package into `src/wasm/`. |
| `npm run lint` | Biome lint + format check. |
| `npm run format` | Biome auto-format. |

`dev`, `build`, and `test` each rebuild the WASM package first (via `pre*`
scripts), so a clean checkout needs no manual `npm run wasm`.

## Verifying M0 (smoke test)

`npm run dev` (or `preview`) and open the app. It boots a Web Worker, initialises
the WASM module over Comlink, and renders:

- the WASM core version (`core-wasm v0.1.0`),
- `add(19, 23) = 42` computed in Rust/WASM,
- **Cross-origin isolated: yes** — confirming the COOP/COEP headers enabled
  `SharedArrayBuffer`.

If all three appear, the Vite + Worker + Comlink + WASM + cross-origin-isolation
pipeline is working. `npm test` covers the WASM-core half headlessly.

## Layout

```
core-wasm/        Rust crate → WebAssembly compute core (wasm-bindgen)
src/
  wasm/           Generated wasm-pack output (git-ignored; rebuilt on demand)
  worker/         sim.worker.ts (Comlink API) + client.ts (main-thread wrapper)
  test/           Vitest setup + WASM-core smoke test
  App.tsx         M0 smoke-test UI
  main.tsx        React entry
vite.config.ts    Vite + Vitest config, COOP/COEP headers, worker/wasm wiring
```

## Notes on tooling versions

The stack targets the versions in the PRD/CLAUDE.md (Vite 8.1.x, React 19.2.x,
wasm-bindgen 0.2.126, wasm-pack 0.15.x). `wasm-bindgen`'s crate and CLI versions
**must match exactly** or the build fails cryptically; `wasm-pack` handles the CLI
side automatically. Vitest is pinned to **4.x** because it is the first line that
peer-supports Vite 8 (Rolldown) — using 3.x pulls a second, conflicting Vite.
