//! Cancer AutoMata compute core (WASM bindings).
//!
//! Pure-Rust engine lives in the sibling modules; this file is only the
//! `wasm-bindgen` surface. See `Cancer-AutoMata-SPA-PRD.md` §5–§6.

mod grid;
mod neighbors;
mod rng;
mod sim;

use wasm_bindgen::prelude::*;

use rng::Pcg32;
use sim::{Model, Rules, SimConfig, Simulation as CoreSimulation};

/// Version banner, rendered by the app on boot to confirm the module loaded.
#[wasm_bindgen]
pub fn core_version() -> String {
    format!("core-wasm v{}", env!("CARGO_PKG_VERSION"))
}

/// Trivial numeric export retained for the M0 pipeline smoke test.
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

// --- RNG cross-language parity helpers (used by the differential tests) ---

/// First `n` PCG32 outputs for an explicit `(seed, stream)`. Mirrors
/// `new Pcg32(seed, stream)` on the TS side.
#[wasm_bindgen]
pub fn pcg32_sequence(seed: u32, stream: u32, n: usize) -> Vec<u32> {
    let mut rng = Pcg32::new(u64::from(seed), u64::from(stream));
    (0..n).map(|_| rng.next_u32()).collect()
}

/// First `n` PCG32 outputs for the default stream. Mirrors `new Pcg32(seed)`.
#[wasm_bindgen]
pub fn pcg32_default_sequence(seed: u32, n: usize) -> Vec<u32> {
    let mut rng = Pcg32::with_seed(u64::from(seed));
    (0..n).map(|_| rng.next_u32()).collect()
}

/// A default-stream permutation of `[0, n)`. Mirrors `new Pcg32(seed).permutation(n)`.
#[wasm_bindgen]
pub fn pcg32_permutation(seed: u32, n: usize) -> Vec<u32> {
    Pcg32::with_seed(u64::from(seed)).permutation(n)
}

/// A single Cancer-AutoMata run, driven step-by-step or to completion.
#[wasm_bindgen]
pub struct Simulation {
    inner: CoreSimulation,
}

#[wasm_bindgen]
impl Simulation {
    /// Construct and seed the initial colony. `model` is `"A"`, `"B"`, or `"C"`.
    #[wasm_bindgen(constructor)]
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        model: &str,
        survival_min: u32,
        survival_max: u32,
        birth_min: u32,
        birth_max: u32,
        dish_size: u32,
        dish_height: u32,
        initial_cells: f64,
        steps: u32,
        mean: f64,
        p_mesen: f64,
        seed: u32,
    ) -> Result<Simulation, JsError> {
        let model = match model {
            "A" => Model::A,
            "B" => Model::B,
            "C" => Model::C,
            other => return Err(JsError::new(&format!("unknown model: {other}"))),
        };
        let cfg = SimConfig {
            model,
            rules: Rules {
                survival_min,
                survival_max,
                birth_min,
                birth_max,
            },
            dish_size: dish_size as usize,
            dish_height: dish_height as usize,
            initial_cells,
            steps: steps as usize,
            mean,
            p_mesen,
            seed: u64::from(seed),
        };
        Ok(Simulation {
            inner: CoreSimulation::new(cfg),
        })
    }

    /// Advance one step (no-op once all steps are done).
    pub fn step(&mut self) {
        self.inner.step();
    }

    /// Run all remaining steps.
    pub fn run(&mut self) {
        self.inner.run();
    }

    /// A copy of the current grid buffer (layer-major `Uint8Array`).
    pub fn grid(&self) -> Vec<u8> {
        self.inner.grid().to_vec()
    }

    /// Total live cells per recorded step.
    pub fn nb_cells(&self) -> Vec<u32> {
        self.inner.nb_cells().to_vec()
    }

    /// M fraction of live cells per recorded step (0..1).
    pub fn m_percents(&self) -> Vec<f64> {
        self.inner.m_percents().to_vec()
    }

    #[wasm_bindgen(getter)]
    pub fn ratio(&self) -> f64 {
        self.inner.ratio()
    }

    #[wasm_bindgen(getter, js_name = currentStep)]
    pub fn current_step(&self) -> usize {
        self.inner.current_step()
    }
}
