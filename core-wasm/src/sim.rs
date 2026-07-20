//! Simulation core — the Rust port of `simulateCancer.m` / `simulate.ts`.
//!
//! Plain Rust (no wasm-bindgen) so it can be unit-tested natively; `lib.rs`
//! wraps it for the browser. All three models (A, B, C) are implemented,
//! including the sequential M-cell movement pass and the full-height-column
//! born-type tie-break.

use crate::grid::seed_colony;
use crate::neighbors::{compute_column_counts, compute_live_counts, index};
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
    // Column E/M planes for the born-type tie-break (Models B/C only).
    e_flat: Vec<u16>,
    m_flat: Vec<u16>,
    box_scratch: Vec<u16>,
    col_e: Vec<u16>,
    col_m: Vec<u16>,
    nb_cells: Vec<u32>,
    m_percents: Vec<f64>,
    ratio: f64,
    current_step: usize,
}

impl Simulation {
    pub fn new(cfg: SimConfig) -> Self {
        let n = cfg.dish_size * cfg.dish_size * cfg.dish_height;
        let wh = cfg.dish_size * cfg.dish_size;
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
            e_flat: vec![0u16; wh],
            m_flat: vec![0u16; wh],
            box_scratch: vec![0u16; wh],
            col_e: vec![0u16; wh],
            col_m: vec![0u16; wh],
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
        if self.cfg.model != Model::A {
            compute_column_counts(
                &self.cur,
                w,
                h,
                d,
                &mut self.e_flat,
                &mut self.m_flat,
                &mut self.box_scratch,
                &mut self.col_e,
                &mut self.col_m,
            );
        }
        let order = self.rng.permutation(w * h);

        match self.cfg.model {
            Model::A => self.step_model_a(&order),
            Model::B => self.step_model_b(&order),
            Model::C => self.step_model_c(&order),
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

    /// Model B: E survives → M / else dies; empty → born (type by column tie-break);
    /// M → moves to an empty neighbor, or converts to E when trapped.
    fn step_model_b(&mut self, order: &[u32]) {
        let (w, h, d) = (self.cfg.dish_size, self.cfg.dish_size, self.cfg.dish_height);
        let r = self.cfg.rules;
        for &col in order {
            let col = col as usize;
            let x = col % w;
            let y = col / w;
            let plane = x + y * w;
            let born_e = self.col_e[plane] > self.col_m[plane];
            for z in 0..d {
                let idx = index(x, y, z, w, h);
                let ln = i64::from(self.l[idx]);
                match self.cur[idx] {
                    0 => {
                        let born = ln >= i64::from(r.birth_min) && ln <= i64::from(r.birth_max);
                        if born {
                            self.next[idx] = if born_e { 2 } else { 1 };
                        }
                    }
                    2 => {
                        let s = ln - 1;
                        let survives =
                            s >= i64::from(r.survival_min) && s <= i64::from(r.survival_max);
                        self.next[idx] = if survives { 1 } else { 0 };
                    }
                    _ => {
                        move_or_convert_m(
                            &self.cur,
                            &mut self.next,
                            w,
                            h,
                            d,
                            x,
                            y,
                            z,
                            &mut self.rng,
                        );
                    }
                }
            }
        }
    }

    /// Model C (paper rules): under-populated E → M (i); over-crowded M → E (ii);
    /// empty in birth range → born (iii); otherwise M moves (iv) or, if trapped,
    /// converts to E (v).
    fn step_model_c(&mut self, order: &[u32]) {
        let (w, h, d) = (self.cfg.dish_size, self.cfg.dish_size, self.cfg.dish_height);
        let r = self.cfg.rules;
        for &col in order {
            let col = col as usize;
            let x = col % w;
            let y = col / w;
            let plane = x + y * w;
            let born_e = self.col_e[plane] > self.col_m[plane];
            for z in 0..d {
                let idx = index(x, y, z, w, h);
                let ln = i64::from(self.l[idx]);
                match self.cur[idx] {
                    0 => {
                        let born = ln >= i64::from(r.birth_min) && ln <= i64::from(r.birth_max);
                        if born {
                            self.next[idx] = if born_e { 2 } else { 1 }; // rule iii
                        }
                    }
                    2 => {
                        if ln - 1 < i64::from(r.survival_min) {
                            self.next[idx] = 1; // rule i
                        }
                    }
                    _ => {
                        if ln - 1 > i64::from(r.survival_max) {
                            self.next[idx] = 2; // rule ii
                        } else {
                            move_or_convert_m(
                                &self.cur,
                                &mut self.next,
                                w,
                                h,
                                d,
                                x,
                                y,
                                z,
                                &mut self.rng,
                            ); // rules iv / v
                        }
                    }
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

/// Move the M cell at `(x,y,z)` into a random empty Moore neighbor, or convert
/// it to E when none is available. A position is available iff it is empty in
/// **both** the previous grid (`cur`) and the in-progress `next` buffer — this
/// is the sequential collision-avoidance from `listAvailableNeighborPositions.m`.
///
/// Faithful details preserved for RNG lockstep with the oracle: candidates are
/// gathered in x→y→z order, `rp` is drawn on **every** entry to this branch
/// (even when trapped), and the target index is `round(rp*(count-1))`.
#[allow(clippy::too_many_arguments)]
fn move_or_convert_m(
    cur: &[u8],
    next: &mut [u8],
    w: usize,
    h: usize,
    d: usize,
    x: usize,
    y: usize,
    z: usize,
    rng: &mut Pcg32,
) {
    let mut available = [0usize; 27];
    let mut count = 0usize;
    for xi in x.saturating_sub(1)..=(x + 1).min(w - 1) {
        for yi in y.saturating_sub(1)..=(y + 1).min(h - 1) {
            for zi in z.saturating_sub(1)..=(z + 1).min(d - 1) {
                let idx = index(xi, yi, zi, w, h);
                if cur[idx] == 0 && next[idx] == 0 {
                    available[count] = idx;
                    count += 1;
                }
            }
        }
    }

    let rp = rng.next_f64();
    let self_idx = index(x, y, z, w, h);
    if count != 0 {
        let pick = (rp * (count as f64 - 1.0)).round() as usize;
        next[available[pick]] = 1;
        next[self_idx] = 0;
    } else {
        next[self_idx] = 2;
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

    fn bc_config(model: Model, seed: u64) -> SimConfig {
        let (rules, height) = match model {
            Model::C => (
                Rules {
                    survival_min: 4,
                    survival_max: 8,
                    birth_min: 2,
                    birth_max: 7,
                },
                2,
            ),
            _ => (
                Rules {
                    survival_min: 2,
                    survival_max: 3,
                    birth_min: 3,
                    birth_max: 3,
                },
                4,
            ),
        };
        SimConfig {
            model,
            rules,
            dish_size: 24,
            dish_height: height,
            initial_cells: 150.0,
            steps: 5,
            mean: 1.0,
            p_mesen: 40.0,
            seed,
        }
    }

    #[test]
    fn models_b_and_c_run_deterministically() {
        for model in [Model::B, Model::C] {
            let mut a = Simulation::new(bc_config(model, 777));
            let mut b = Simulation::new(bc_config(model, 777));
            a.run();
            b.run();
            assert_eq!(a.grid(), b.grid());
            assert_eq!(a.nb_cells(), b.nb_cells());
            assert_eq!(a.m_percents(), b.m_percents());
            assert_eq!(a.current_step(), 5);
        }
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
