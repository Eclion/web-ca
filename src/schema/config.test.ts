import { describe, expect, it } from 'vitest';
import {
  applyModelDefaults,
  buildJobs,
  conditionKey,
  defaultConfig,
  RunConfigSchema,
  resolveSim,
} from './config.ts';

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

  it('requires at least one treatment', () => {
    expect(RunConfigSchema.safeParse({ ...defaultConfig(), treatments: [] }).success).toBe(false);
  });

  it('rejects an out-of-range dish size', () => {
    expect(RunConfigSchema.safeParse({ ...defaultConfig(), dishSize: 1000 }).success).toBe(false);
  });
});

describe('applyModelDefaults', () => {
  it('sets Model C rule/height defaults on switch', () => {
    const c = applyModelDefaults(defaultConfig(), 'C');
    expect(c.rules).toEqual({ survivalMin: 4, survivalMax: 8, birthMin: 2, birthMax: 7 });
    expect(c.dishHeight).toBe(2);
  });
});

describe('buildJobs', () => {
  it('expands M% × treatment × repeats in the source order', () => {
    const jobs = buildJobs({
      ...defaultConfig(),
      model: 'B',
      treatments: ['WT', 'TRAIL'],
      mesenchymalPercentages: [5, 50],
      repeats: 2,
    });
    // 2 M% × 2 treatments × 2 repeats = 8; M% outer, treatment mid, repeat inner.
    expect(jobs).toHaveLength(8);
    expect(
      jobs
        .slice(0, 4)
        .map((j) => `${j.condition.mPercent}/${j.condition.treatment}/${j.repeatIndex}`),
    ).toEqual(['5/WT/0', '5/WT/1', '5/TRAIL/0', '5/TRAIL/1']);
    // Distinct, sequential seeds.
    expect(jobs.map((j) => j.run.seed)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('uses per-treatment default M% when the list is empty', () => {
    const jobs = buildJobs({
      ...defaultConfig(),
      model: 'B',
      treatments: ['WT', 'TRAIL', 'TR_BIM'],
      mesenchymalPercentages: [],
      repeats: 1,
    });
    expect(jobs.map((j) => j.condition.mPercent)).toEqual([2, 10, 95]);
  });

  it('resolves treatment means and forces pMesen 0 for Model A', () => {
    const jobs = buildJobs({
      ...defaultConfig(),
      model: 'A',
      treatments: ['TRAIL'],
      mesenchymalPercentages: [40],
      repeats: 1,
    });
    expect(jobs[0].run.mean).toBe(0.59);
    expect(jobs[0].run.pMesen).toBe(0);
  });
});

describe('resolveSim + conditionKey', () => {
  it('keeps pMesen for B/C and picks Model C means', () => {
    const run = resolveSim(applyModelDefaults(defaultConfig(), 'C'), 'TR_BIM', 95, 7);
    expect(run.mean).toBe(0.0125);
    expect(run.pMesen).toBe(95);
    expect(run.seed).toBe(7);
  });

  it('groups repeats of a condition under one key', () => {
    expect(conditionKey({ treatment: 'WT', mPercent: 2 })).toBe('WT@2');
  });
});
