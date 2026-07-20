//! Grid seeding — the Rust port of `seedColony` in `src/core-ts/grid.ts`.
//!
//! The floating-point expressions and RNG-draw discipline match the TS oracle
//! (and the original `simulateCancer.m`) exactly, so the seeded grid is
//! byte-identical: one `next_f64` is drawn for every cell (the
//! `spacingOffset*mean` test), and a second only for cells that pass.

use crate::rng::Pcg32;

const SPACING_OFFSET: f64 = 0.6;

/// Seed a circular colony into layer z=0 of a `width × height × depth` grid.
///
/// `width == height == dishSize`. `initial_cells` and `p_mesen` are taken as
/// f64 to reproduce the TS arithmetic precisely.
pub fn seed_colony(
    data: &mut [u8],
    width: usize,
    height: usize,
    initial_cells: f64,
    mean: f64,
    p_mesen: f64,
    rng: &mut Pcg32,
) {
    let radius_sq = initial_cells / (SPACING_OFFSET * std::f64::consts::PI);
    let center = width as f64 / 2.0;
    let threshold = SPACING_OFFSET * mean;

    for i in 0..width {
        let dx = (i as f64 + 1.0) - center;
        for j in 0..height {
            let passes = rng.next_f64() < threshold;
            let dy = (j as f64 + 1.0) - center;
            if passes && dx * dx + dy * dy < radius_sq {
                let idx = i + j * width; // layer z = 0
                data[idx] = if rng.next_f64() < p_mesen / 100.0 {
                    1
                } else {
                    2
                };
            }
        }
    }
}
