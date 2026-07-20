import { describe, expect, it } from 'vitest';
import { Pcg32 } from './rng.ts';

describe('Pcg32', () => {
  it('matches the canonical PCG32 reference vector (seed 42, stream 54)', () => {
    // Golden values from M.E. O'Neill's pcg32 demo (pcg32_srandom_r(&rng, 42, 54)).
    // These pin the exact algorithm the Rust core must reproduce bit-for-bit.
    const rng = new Pcg32(42, 54);
    const expected = [0xa15c02b7, 0x7b47f409, 0xba1d3330, 0x83d2f293, 0xbfa4784b, 0xcbed606e];
    const got = expected.map(() => rng.nextU32());
    expect(got).toEqual(expected);
  });

  it('is deterministic for a given seed and stream', () => {
    const a = new Pcg32(12345);
    const b = new Pcg32(12345);
    const seqA = Array.from({ length: 32 }, () => a.nextU32());
    const seqB = Array.from({ length: 32 }, () => b.nextU32());
    expect(seqA).toEqual(seqB);
  });

  it('produces different streams for different seeds', () => {
    const a = new Pcg32(1);
    const b = new Pcg32(2);
    expect(a.nextU32()).not.toBe(b.nextU32());
  });

  it('nextFloat is in [0, 1)', () => {
    const rng = new Pcg32(7);
    for (let i = 0; i < 10000; i++) {
      const f = rng.nextFloat();
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
    }
  });

  it('nextBounded stays in range and is unbiased enough', () => {
    const rng = new Pcg32(99);
    const bound = 7;
    const buckets = new Array<number>(bound).fill(0);
    const n = 70000;
    for (let i = 0; i < n; i++) {
      const v = rng.nextBounded(bound);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(bound);
      buckets[v]++;
    }
    // Each bucket should be near n/bound = 10000; allow generous slack.
    for (const c of buckets) expect(Math.abs(c - n / bound)).toBeLessThan(600);
  });

  it('nextBounded(<=1) returns 0 without consuming bias', () => {
    const rng = new Pcg32(3);
    expect(rng.nextBounded(1)).toBe(0);
    expect(rng.nextBounded(0)).toBe(0);
  });

  it('permutation is a valid, deterministic permutation of [0, n)', () => {
    const a = new Pcg32(2024);
    const b = new Pcg32(2024);
    const permA = Array.from(a.permutation(50));
    const permB = Array.from(b.permutation(50));
    expect(permA).toEqual(permB);
    expect([...permA].sort((p, q) => p - q)).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });
});
