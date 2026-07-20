//! Simulation core — the Rust port of `simulateCancer.m` / `simulate.ts`.
//!
//! Plain Rust (no wasm-bindgen) so it can be unit-tested natively; `lib.rs`
//! wraps it for the browser. For M2 only Model A is wired up; Models B and C
//! (movement, conversions, column tie-break) arrive in M3.

use crate::grid::seed_colony;
use crate::neighbors::{compute_live_counts, index};
use crate::rng::Pcg32;

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Model {
    A,
    B,
    C,
}

#[derive(Clone, Copy)]
pub struct Rules {
    pub survival_min: u32,
    pub survival_max: u32,
    pub birth_min: u32,
    pub birth_max: u32,
}

pub struct SimConfig {
    pub model: Model,
    pub rules: Rules,
    pub dish_size: usize,
    pub dish_height: usize,
    pub initial_cells: f64,
    pub steps: usize,
    pub mean: f64,
    pub p_mesen: f64,
    pub seed: u64,
}

pub struct Simulation {
    cfg: SimConfig,
    rng: Pcg32,
    cur: Vec<u8>,
    next: Vec<u8>,
    row_x: Vec<u16>,
    col_y: Vec<u16>,
    l: Vec<u16>,
    nb_cells: Vec<u32>,
    m_percents: Vec<f64>,
    ratio: f64,
    current_step: usize,
}

impl Simulation {
    pub fn new(cfg: SimConfig) -> Self {
        let n = cfg.dish_size * cfg.dish_size * cfg.dish_height;
        let mut rng = Pcg32::with_seed(cfg.seed);
        let mut cur = vec![0u8; n];

        // Model A is epithelial-only: force pMesen to 0 (simulateCancer.m line 36).
        let p_mesen = if cfg.model == Model::A {
            0.0
        } else {
            cfg.p_mesen
        };
        seed_colony(
            &mut cur,
            cfg.dish_size,
            cfg.dish_size,
            cfg.initial_cells,
            cfg.mean,
            p_mesen,
            &mut rng,
        );

        let mut sim = Simulation {
            next: vec![0u8; n],
            row_x: vec![0u16; n],
            col_y: vec![0u16; n],
            l: vec![0u16; n],
            nb_cells: Vec::with_capacity(cfg.steps + 1),
            m_percents: Vec::with_capacity(cfg.steps + 1),
            ratio: 0.0,
            current_step: 0,
            cur,
            rng,
            cfg,
        };
        sim.record();
        sim.ratio = sim.nb_cells[0] as f64 / sim.cfg.initial_cells;
        sim
    }

    /// Count `(total_live, m_count)` over the current grid.
    fn count(&self) -> (u32, u32) {
        let mut m = 0u32;
        let mut e = 0u32;
        for &v in &self.cur {
            match v {
                1 => m += 1,
                2 => e += 1,
                _ => {}
            }
        }
        (m + e, m)
    }

    /// Append the current step's population and M-fraction to the series.
    fn record(&mut self) {
        let (total, m) = self.count();
        self.nb_cells.push(total);
        self.m_percents.push(if total != 0 {
            f64::from(m) / f64::from(total)
        } else {
            0.0
        });
    }

    pub fn step(&mut self) {
        if self.current_step >= self.cfg.steps {
            return;
        }
        let (w, h, d) = (self.cfg.dish_size, self.cfg.dish_size, self.cfg.dish_height);

        self.next.copy_from_slice(&self.cur);
        compute_live_counts(
            &self.cur,
            w,
            h,
            d,
            &mut self.row_x,
            &mut self.col_y,
            &mut self.l,
        );
        let order = self.rng.permutation(w * h);

        match self.cfg.model {
            Model::A => self.step_model_a(&order),
            Model::B | Model::C => unimplemented!("Models B and C arrive in M3"),
        }

        std::mem::swap(&mut self.cur, &mut self.next);
        self.current_step += 1;
        self.record();
    }

    fn step_model_a(&mut self, order: &[u32]) {
        let (w, h, d) = (self.cfg.dish_size, self.cfg.dish_size, self.cfg.dish_height);
        let r = self.cfg.rules;
        for &col in order {
            let col = col as usize;
            let x = col % w;
            let y = col / w;
            for z in 0..d {
                let idx = index(x, y, z, w, h);
                let ln = i64::from(self.l[idx]); // inclusive live count
                match self.cur[idx] {
                    0 => {
                        let born = ln >= i64::from(r.birth_min) && ln <= i64::from(r.birth_max);
                        self.next[idx] = if born { 2 } else { 0 };
                    }
                    2 => {
                        let s = ln - 1; // exclude self
                        let survives =
                            s >= i64::from(r.survival_min) && s <= i64::from(r.survival_max);
                        self.next[idx] = if survives { 2 } else { 0 };
                    }
                    _ => {}
                }
            }
        }
    }

    pub fn run(&mut self) {
        while self.current_step < self.cfg.steps {
            self.step();
        }
    }

    pub fn grid(&self) -> &[u8] {
        &self.cur
    }
    pub fn nb_cells(&self) -> &[u32] {
        &self.nb_cells
    }
    pub fn m_percents(&self) -> &[f64] {
        &self.m_percents
    }
    pub fn ratio(&self) -> f64 {
        self.ratio
    }
    pub fn current_step(&self) -> usize {
        self.current_step
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn conway(seed: u64) -> SimConfig {
        SimConfig {
            model: Model::A,
            rules: Rules {
                survival_min: 2,
                survival_max: 3,
                birth_min: 3,
                birth_max: 3,
            },
            dish_size: 24,
            dish_height: 4,
            initial_cells: 120.0,
            steps: 6,
            mean: 1.0,
            p_mesen: 0.0,
            seed,
        }
    }

    #[test]
    fn deterministic_for_a_given_seed() {
        let mut a = Simulation::new(conway(12345));
        let mut b = Simulation::new(conway(12345));
        a.run();
        b.run();
        assert_eq!(a.grid(), b.grid());
        assert_eq!(a.nb_cells(), b.nb_cells());
        assert_eq!(a.m_percents(), b.m_percents());
    }

    #[test]
    fn model_a_never_produces_m_cells() {
        let mut sim = Simulation::new(conway(777));
        sim.run();
        assert!(sim.grid().iter().all(|&v| v != 1));
        assert!(sim.m_percents().iter().all(|&p| p == 0.0));
    }

    #[test]
    fn series_length_and_ratio() {
        let sim = Simulation::new(conway(42));
        assert_eq!(sim.nb_cells().len(), 1); // only step 0 recorded before run
        assert_eq!(sim.ratio(), sim.nb_cells()[0] as f64 / 120.0);
        let mut sim = Simulation::new(conway(42));
        sim.run();
        assert_eq!(sim.nb_cells().len(), 7);
        assert_eq!(sim.m_percents().len(), 7);
    }
}
