# Changelog

All notable changes to this project are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/); milestones
refer to `Cancer-AutoMata-SPA-PRD.md` §11.

## [Unreleased]

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
