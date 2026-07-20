import { z } from 'zod';
import { type Model, modelDefaults, type Treatment, treatmentMean } from '../core-ts/types.ts';

// Note: we import only the pure type/constant helpers from the oracle's
// `types.ts` (enums + the treatment-mean / model-default tables). None of the
// oracle *engine* (simulate/fate/neighbors) is referenced, so nothing heavy is
// pulled into the shipped bundle.

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

/** Single-run configuration (the M4 UI drives one run; batch is M5). */
export const RunConfigSchema = z.object({
  model: z.enum(['A', 'B', 'C']),
  rules: RulesSchema,
  dishSize: z.number().int().min(4).max(550),
  dishHeight: z.number().int().min(1).max(8),
  initialCells: z.number().int().min(1),
  steps: z.number().int().min(1).max(2000),
  treatment: z.enum(['WT', 'TRAIL', 'TR_BIM']),
  pMesen: z.number().min(0).max(100),
  seed: z.number().int().min(0),
});

export type RunConfig = z.infer<typeof RunConfigSchema>;

/** Dish sizes above this are allowed but flagged as heavy in the UI. */
export const LARGE_DISH_WARNING = 400;

/** The default configuration the app opens with (Model A defaults). */
export function defaultConfig(): RunConfig {
  const { rules, dishHeight } = modelDefaults('A');
  return {
    model: 'A',
    rules,
    dishSize: 200,
    dishHeight,
    initialCells: 8000,
    steps: 20,
    treatment: 'WT',
    pMesen: 2,
    seed: 1,
  };
}

/**
 * Apply a model's rule + dish-height defaults (mirrors the MATLAB callbacks),
 * as done when the user switches models in the panel.
 */
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

/** Resolve a validated config into worker/WASM scalar params (adds the mean). */
export function resolveRun(config: RunConfig): ResolvedRun {
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
    mean: treatmentMean(config.model, config.treatment),
    pMesen: config.model === 'A' ? 0 : config.pMesen,
    seed: config.seed,
  };
}

export const TREATMENT_LABELS: Record<Treatment, string> = {
  WT: 'WT',
  TRAIL: 'TRAIL',
  TR_BIM: 'TR+BIM',
};
