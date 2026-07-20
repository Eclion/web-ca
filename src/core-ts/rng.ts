/**
 * PCG32 — a small, fast, seedable PRNG (PCG-XSH-RR, 64-bit state / 32-bit output).
 *
 * This is the **shared reproducibility contract** for the whole project: the
 * WASM compute core (from M2) reimplements this exact algorithm so that, given
 * the same seed, the Rust core and this TS oracle produce byte-identical runs
 * (see PRD §9.2). MATLAB parity is only *statistical*, so we deliberately do NOT
 * reproduce MATLAB's Mersenne Twister — we define our own stream here and mirror
 * it in Rust.
 *
 * Reference: M.E. O'Neill, "PCG: A Family of Simple Fast Space-Efficient
 * Statistically Good Algorithms for Random Number Generation" (2014).
 *
 * TS uses BigInt for the 64-bit state (the oracle is not perf-critical). The
 * Rust port uses `u64`/`u32` wrapping arithmetic; every operation below maps
 * 1:1 onto wrapping ops, and the constants are identical.
 */

const MASK64 = (1n << 64n) - 1n;
const MASK32 = 0xffff_ffffn;
const MULTIPLIER = 6364136223846793005n;
const TWO_POW_32 = 1n << 32n;

/** Default stream selector (the canonical PCG default increment's `initseq`). */
const DEFAULT_STREAM = 0xda3e39cb94b95bdbn;

export class Pcg32 {
  private state = 0n;
  private readonly inc: bigint;

  /**
   * @param seed   initial state (`initstate`); any non-negative integer.
   * @param stream stream selector (`initseq`); different streams are distinct,
   *               non-overlapping sequences for the same seed.
   */
  constructor(seed: number | bigint, stream: number | bigint = DEFAULT_STREAM) {
    // pcg32_srandom_r: inc = (initseq << 1) | 1; state = 0; step; state += seed; step.
    this.inc = (((BigInt(stream) & MASK64) << 1n) | 1n) & MASK64;
    this.stepAndOutput();
    this.state = (this.state + (BigInt(seed) & MASK64)) & MASK64;
    this.stepAndOutput();
  }

  /** Advance the LCG state and emit one 32-bit output (PCG-XSH-RR). */
  private stepAndOutput(): number {
    const old = this.state;
    this.state = (old * MULTIPLIER + this.inc) & MASK64;
    const xorshifted = (((old >> 18n) ^ old) >> 27n) & MASK32;
    const rot = old >> 59n; // 0..31
    const result = ((xorshifted >> rot) | (xorshifted << (-rot & 31n))) & MASK32;
    return Number(result);
  }

  /** Next uniformly-distributed 32-bit unsigned integer, in `[0, 2^32)`. */
  nextU32(): number {
    return this.stepAndOutput();
  }

  /** Next float in `[0, 1)` with 32 bits of resolution. */
  nextFloat(): number {
    return this.nextU32() / 2 ** 32;
  }

  /**
   * Uniform integer in `[0, bound)`, unbiased via rejection (arc4random_uniform
   * style: reject the low `2^32 mod bound` outputs). Rust port computes the same
   * threshold with `(0u32.wrapping_sub(bound)) % bound`.
   */
  nextBounded(bound: number): number {
    if (bound <= 1) return 0;
    const b = BigInt(bound);
    const threshold = TWO_POW_32 % b;
    while (true) {
      const r = BigInt(this.nextU32());
      if (r >= threshold) return Number(r % b);
    }
  }

  /**
   * A random permutation of `[0, n)` via descending Fisher–Yates. This is our
   * deterministic replacement for MATLAB's `randperm`; the ordering differs from
   * MATLAB (statistical parity only) but is identical between TS and Rust.
   */
  permutation(n: number): Uint32Array {
    const out = new Uint32Array(n);
    for (let i = 0; i < n; i++) out[i] = i;
    for (let i = n - 1; i > 0; i--) {
      const j = this.nextBounded(i + 1);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }
}
