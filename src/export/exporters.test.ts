import { describe, expect, it } from 'vitest';
import { defaultConfig, parseConfig } from '../schema/config.ts';
import type { CompletedSim, ConditionStat } from '../store/simStore.ts';
import { configToJson, resultsToJson, seriesToCsv } from './exporters.ts';

const sims: CompletedSim[] = [
  {
    index: 0,
    condition: { treatment: 'WT', mPercent: 2 },
    repeatIndex: 0,
    nbCells: [100, 120],
    mPercents: [0, 0.5],
    ratio: 1.0,
    growthRate: 1.2,
  },
  {
    index: 1,
    condition: { treatment: 'TRAIL', mPercent: 10 },
    repeatIndex: 0,
    nbCells: [50, 40],
    mPercents: [0.1, 0.2],
    ratio: 0.5,
    growthRate: 0.8,
  },
];

describe('seriesToCsv', () => {
  it('emits a header and one row per (sim, step)', () => {
    const csv = seriesToCsv(sims);
    const lines = csv.trim().split('\n');
    expect(lines[0]).toBe('treatment,mesenchymal_pct,repeat,step,nb_cells,m_fraction');
    expect(lines).toHaveLength(1 + 4); // header + 2 sims × 2 steps
    expect(lines[1]).toBe('WT,2,0,0,100,0');
    expect(lines[2]).toBe('WT,2,0,1,120,0.5');
    expect(lines[3]).toBe('TRAIL,10,0,0,50,0.1');
  });
});

describe('resultsToJson', () => {
  it('captures config, conditions, and per-sim series', () => {
    const stats: ConditionStat[] = [
      { condition: { treatment: 'WT', mPercent: 2 }, runs: 1, meanRatio: 1, meanGrowth: 1.2 },
    ];
    const parsed = JSON.parse(resultsToJson(defaultConfig(), sims, stats));
    expect(parsed.config.model).toBe('A');
    expect(parsed.conditions[0].treatment).toBe('WT');
    expect(parsed.simulations).toHaveLength(2);
    expect(parsed.simulations[0].nbCells).toEqual([100, 120]);
  });
});

describe('configToJson + parseConfig roundtrip', () => {
  it('re-imports an exported config', () => {
    const cfg = { ...defaultConfig(), model: 'C' as const, seed: 99 };
    const result = parseConfig(configToJson(cfg));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.config).toEqual(cfg);
  });

  it('rejects invalid config JSON with a message', () => {
    const bad = parseConfig(JSON.stringify({ ...defaultConfig(), treatments: [] }));
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toMatch(/treatments/);
  });

  it('rejects malformed JSON', () => {
    const bad = parseConfig('{not json');
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toBe('Not valid JSON');
  });
});
