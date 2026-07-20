import { describe, expect, it } from 'vitest';
import { applyModelDefaults, defaultConfig, RunConfigSchema, resolveRun } from './config.ts';

describe('RunConfigSchema', () => {
  it('accepts the default config', () => {
    expect(RunConfigSchema.safeParse(defaultConfig()).success).toBe(true);
  });

  it('rejects inverted rule ranges', () => {
    const bad = {
      ...defaultConfig(),
      rules: { survivalMin: 5, survivalMax: 2, birthMin: 3, birthMax: 3 },
    };
    expect(RunConfigSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an out-of-range dish size', () => {
    expect(RunConfigSchema.safeParse({ ...defaultConfig(), dishSize: 1000 }).success).toBe(false);
  });
});

describe('applyModelDefaults', () => {
  it('sets Model C rule/height defaults on switch', () => {
    const c = applyModelDefaults(defaultConfig(), 'C');
    expect(c.model).toBe('C');
    expect(c.rules).toEqual({ survivalMin: 4, survivalMax: 8, birthMin: 2, birthMax: 7 });
    expect(c.dishHeight).toBe(2);
  });

  it('sets Model A/B defaults (Conway, height 4)', () => {
    const b = applyModelDefaults(defaultConfig(), 'B');
    expect(b.rules).toEqual({ survivalMin: 2, survivalMax: 3, birthMin: 3, birthMax: 3 });
    expect(b.dishHeight).toBe(4);
  });
});

describe('resolveRun', () => {
  it('derives the treatment mean and forces pMesen 0 for Model A', () => {
    const a = resolveRun({ ...defaultConfig(), model: 'A', treatment: 'TRAIL', pMesen: 50 });
    expect(a.mean).toBe(0.59);
    expect(a.pMesen).toBe(0);
  });

  it('uses Model C means and keeps pMesen for B/C', () => {
    const c = resolveRun(
      applyModelDefaults({ ...defaultConfig(), treatment: 'TR_BIM', pMesen: 95 }, 'C'),
    );
    expect(c.mean).toBe(0.0125);
    expect(c.pMesen).toBe(95);
  });
});
