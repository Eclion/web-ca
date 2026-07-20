//! Cancer AutoMata compute core.
//!
//! M0 scaffold: this crate currently exports only a trivial function used to
//! prove the Vite → Web Worker → Comlink → WASM pipeline end to end. The real
//! cellular-automaton engine (grid, PRNG, separable convolution, fate kernels)
//! arrives from M2 onward — see `Cancer-AutoMata-SPA-PRD.md` §5 and §11.

use wasm_bindgen::prelude::*;

/// Trivial smoke-test export: returns a version banner the app renders on boot
/// to confirm the WASM module loaded and is callable from the worker.
#[wasm_bindgen]
pub fn core_version() -> String {
    format!("core-wasm v{}", env!("CARGO_PKG_VERSION"))
}

/// Trivial numeric export, used by the end-to-end smoke test to confirm
/// argument passing and return values cross the JS↔WASM boundary correctly.
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
