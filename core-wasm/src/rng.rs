//! PCG32 (PCG-XSH-RR, 64-bit state / 32-bit output).
//!
//! This is the Rust half of the shared reproducibility contract defined in
//! `src/core-ts/rng.ts`. Every operation mirrors the TS oracle exactly (the TS
//! side uses BigInt; here we use native `u64`/`u32` wrapping arithmetic), so a
//! given seed produces byte-identical runs across both. Validated against the
//! canonical PCG32 reference vector (seed 42, stream 54) in the unit tests.

const MULTIPLIER: u64 = 6364136223846793005;

/// Default stream selector — must equal `DEFAULT_STREAM` in `rng.ts`.
pub const DEFAULT_STREAM: u64 = 0xda3e39cb94b95bdb;

pub struct Pcg32 {
    state: u64,
    inc: u64,
}

impl Pcg32 {
    /// Seed with an explicit stream (`initstate` + `initseq`).
    pub fn new(seed: u64, stream: u64) -> Self {
        let mut rng = Pcg32 {
            state: 0,
            inc: (stream << 1) | 1,
        };
        rng.next_u32();
        rng.state = rng.state.wrapping_add(seed);
        rng.next_u32();
        rng
    }

    /// Seed using the default stream (matches `new Pcg32(seed)` in TS).
    pub fn with_seed(seed: u64) -> Self {
        Self::new(seed, DEFAULT_STREAM)
    }

    /// Next uniformly-distributed 32-bit unsigned integer.
    pub fn next_u32(&mut self) -> u32 {
        let old = self.state;
        self.state = old.wrapping_mul(MULTIPLIER).wrapping_add(self.inc);
        let xorshifted = (((old >> 18) ^ old) >> 27) as u32;
        let rot = (old >> 59) as u32;
        xorshifted.rotate_right(rot)
    }

    /// Next float in `[0, 1)` with 32 bits of resolution.
    pub fn next_f64(&mut self) -> f64 {
        f64::from(self.next_u32()) / 4294967296.0
    }

    /// Uniform integer in `[0, bound)`, unbiased via rejection.
    pub fn next_bounded(&mut self, bound: u32) -> u32 {
        if bound <= 1 {
            return 0;
        }
        let threshold = bound.wrapping_neg() % bound; // == 2^32 mod bound
        loop {
            let r = self.next_u32();
            if r >= threshold {
                return r % bound;
            }
        }
    }

    /// A random permutation of `[0, n)` via descending Fisher–Yates.
    pub fn permutation(&mut self, n: usize) -> Vec<u32> {
        let mut out: Vec<u32> = (0..n as u32).collect();
        for i in (1..n).rev() {
            let j = self.next_bounded(i as u32 + 1) as usize;
            out.swap(i, j);
        }
        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn matches_canonical_reference_vector() {
        // pcg32_srandom_r(&rng, 42, 54) — the published PCG32 demo output.
        let mut rng = Pcg32::new(42, 54);
        let expected: [u32; 6] = [
            0xa15c02b7, 0x7b47f409, 0xba1d3330, 0x83d2f293, 0xbfa4784b, 0xcbed606e,
        ];
        let got: Vec<u32> = (0..6).map(|_| rng.next_u32()).collect();
        assert_eq!(got, expected);
    }

    #[test]
    fn next_f64_in_unit_interval() {
        let mut rng = Pcg32::with_seed(7);
        for _ in 0..10_000 {
            let f = rng.next_f64();
            assert!((0.0..1.0).contains(&f));
        }
    }

    #[test]
    fn next_bounded_in_range_and_edge_cases() {
        let mut rng = Pcg32::with_seed(99);
        for _ in 0..10_000 {
            assert!(rng.next_bounded(7) < 7);
        }
        assert_eq!(rng.next_bounded(1), 0);
        assert_eq!(rng.next_bounded(0), 0);
    }

    #[test]
    fn permutation_is_valid() {
        let mut rng = Pcg32::with_seed(2024);
        let mut perm = rng.permutation(50);
        assert_eq!(perm.len(), 50);
        perm.sort_unstable();
        let expected: Vec<u32> = (0..50).collect();
        assert_eq!(perm, expected);
    }
}
