import { z } from 'zod';
import {
  defaultMesenchymalPercentage,
  type Model,
  modelDefaults,
  type Treatment,
  treatmentMean,
} from '../core-ts/types.ts';

// Only the pure type/constant helpers from the oracle's `types.ts` are imported
// (enums + treatment-mean / model-default / default-M% tables). None of the
// oracle engine is referenced, so nothing heavy reaches the shipped bundle.

/** Birth/survival rules as inclusive ranges. Max 27 = full 3×3×3 neighborhood. */
export const RulesSchema = z
  .object({
    survivalMin: z.number().int().min(0).max(27),
    survivalMax: z.number().int().min(0).max(27),
    birthMin: z.number().int().min(0).max(27),
    birthMax: z.number().int().min(0).max(27),
  })
  .refine((r) => r.survivalMin <= r.survivalMax, {
    message: 'survivalMin must be ≤ survivalMax',
    path: ['survivalMax'],
  })
  .refine((r) => r.birthMin <= r.birthMax, {
    message: 'birthMin must be ≤ birthMax',
    path: ['birthMax'],
  });

/**
 * Batch configuration (PRD §8). A run expands to one simulation per
 * (M% × treatment × repeat); an empty `mesenchymalPercentages` means "use each
 * treatment's default M%" (2 / 10 / 95).
 */
export const RunConfigSchema = z.object({
  model: z.enum(['A', 'B', 'C']),
  rules: RulesSchema,
  dishSize: z.number().int().min(4).max(550),
  dishHeight: z.number().int().min(1).max(8),
  initialCells: z.number().int().min(1),
  steps: z.number().int().min(1).max(2000),
  treatments: z.array(z.enum(['WT', 'TRAIL', 'TR_BIM'])).min(1),
  mesenchymalPercentages: z.array(z.number().min(0).max(100)),
  repeats: z.number().int().min(1).max(100),
  seed: z.number().int().min(0),
});

export type RunConfig = z.infer<typeof RunConfigSchema>;

/** Dish sizes above this are allowed but flagged as heavy in the UI. */
export const LARGE_DISH_WARNING = 400;

export function defaultConfig(): RunConfig {
  const { rules, dishHeight } = modelDefaults('A');
  return {
    model: 'A',
    rules,
    dishSize: 200,
    dishHeight,
    initialCells: 8000,
    steps: 20,
    treatments: ['WT', 'TRAIL', 'TR_BIM'],
    mesenchymalPercentages: [],
    repeats: 1,
    seed: 1,
  };
}

/** Apply a model's rule + dish-height defaults (mirrors the MATLAB callbacks). */
export function applyModelDefaults(config: RunConfig, model: Model): RunConfig {
  const { rules, dishHeight } = modelDefaults(model);
  return { ...config, model, rules, dishHeight };
}

/** Scalar parameters that cross to the worker / WASM `Simulation` constructor. */
export interface ResolvedRun {
  model: Model;
  survivalMin: number;
  survivalMax: number;
  birthMin: number;
  birthMax: number;
  dishSize: number;
  dishHeight: number;
  initialCells: number;
  steps: number;
  mean: number;
  pMesen: number;
  seed: number;
}

/** One (treatment, seeding-M%) pair — a curve's identity, independent of repeat. */
export interface Condition {
  treatment: Treatment;
  mPercent: number;
}

/** A single simulation within a batch. */
export interface SimJob {
  index: number;
  condition: Condition;
  repeatIndex: number;
  run: ResolvedRun;
}

/** Stable key for grouping repeats of the same condition. */
export function conditionKey(c: Condition): string {
  return `${c.treatment}@${c.mPercent}`;
}

/**
 * Expand a config into its ordered list of simulations, matching
 * `runSimulationBatch.m`: M% outer, treatment middle, repeat inner. Each sim
 * gets a distinct deterministic seed (`baseSeed + index`) so repeats are
 * independent yet reproducible.
 */
export function buildJobs(config: RunConfig): SimJob[] {
  const mPercentInputs = config.mesenchymalPercentages.length
    ? config.mesenchymalPercentages
    : [null]; // null ⇒ per-treatment default

  const jobs: SimJob[] = [];
  let index = 0;
  for (const mpInput of mPercentInputs) {
    for (const treatment of config.treatments) {
      const mPercent = mpInput ?? defaultMesenchymalPercentage(treatment);
      for (let repeatIndex = 0; repeatIndex < config.repeats; repeatIndex++) {
        jobs.push({
          index,
          condition: { treatment, mPercent },
          repeatIndex,
          run: resolveSim(config, treatment, mPercent, config.seed + index),
        });
        index++;
      }
    }
  }
  return jobs;
}

/** Resolve one simulation's scalar params (Model A forces pMesen to 0). */
export function resolveSim(
  config: RunConfig,
  treatment: Treatment,
  pMesen: number,
  seed: number,
): ResolvedRun {
  return {
    model: config.model,
    survivalMin: config.rules.survivalMin,
    survivalMax: config.rules.survivalMax,
    birthMin: config.rules.birthMin,
    birthMax: config.rules.birthMax,
    dishSize: config.dishSize,
    dishHeight: config.dishHeight,
    initialCells: config.initialCells,
    steps: config.steps,
    mean: treatmentMean(config.model, treatment),
    pMesen: config.model === 'A' ? 0 : pMesen,
    seed,
  };
}

export const TREATMENT_LABELS: Record<Treatment, string> = {
  WT: 'WT',
  TRAIL: 'TRAIL',
  TR_BIM: 'TR+BIM',
};

/** Overlay colours per treatment (original used blue/red/green = 'brg'). */
export const TREATMENT_COLORS: Record<Treatment, string> = {
  WT: '#4ea1ff',
  TRAIL: '#ff5a5a',
  TR_BIM: '#35c759',
};
