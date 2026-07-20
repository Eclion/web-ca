# Kickoff prompt for the Claude Code session

Paste this as your first message to Claude Code (run it from inside this folder):

---

Read `Cancer-AutoMata-SPA-PRD.md` and `CLAUDE.md` in this folder, then implement
**Milestone M0** from PRD §11: scaffold the project.

M0 deliverables:
- Vite 8 + React 19 + TypeScript project, initialized here (repo root = this folder).
- Biome (lint + format) and Vitest configured.
- Web Worker plumbing via Comlink: a `sim.worker.ts` exposing a typed API, called
  from the main thread.
- `vite.config.ts` serving with COOP/COEP response headers so `SharedArrayBuffer`
  is available (cross-origin isolation), for both dev and preview.
- Rust crate `core-wasm/` (wasm-bindgen) with a trivial exported function, built via
  `wasm-pack build --target web`, wired into Vite and loaded inside the worker.
- End-to-end smoke test: the React app boots → starts the worker → worker inits WASM
  → calls the trivial WASM function → result rendered on screen. Prove the whole
  pipeline (Vite + worker + Comlink + WASM + COOP/COEP) works.
- `npm run dev`, `npm run build`, `npm test`, and `wasm-pack build` all succeed.
- `.gitignore`, a short README with setup/run steps, initial CHANGELOG.

Work on a branch `feat/m0-scaffold`, commit in small scoped steps, and stop for
review when the smoke test passes. Do not start M1 yet.

---
