import type { Remote } from 'comlink';
import { create } from 'zustand';
import type { Model, Treatment } from '../core-ts/types.ts';
import {
  applyModelDefaults,
  buildJobs,
  type Condition,
  conditionKey,
  defaultConfig,
  type RunConfig,
  type SimJob,
} from '../schema/config.ts';
import type { Capabilities } from '../worker/capabilities.ts';
import { createSimWorker } from '../worker/client.ts';
import type { BenchmarkResult, RunDims, SimWorkerApi, StepFrame } from '../worker/sim.worker.ts';

export type RunStatus = 'idle' | 'running' | 'paused' | 'done';

/** A finished simulation's series + aggregate outputs. */
export interface CompletedSim {
  index: number;
  condition: Condition;
  repeatIndex: number;
  nbCells: number[];
  mPercents: number[];
  ratio: number;
  growthRate: number;
}

let proxy: Remote<SimWorkerApi> | null = null;
let runToken = 0;

async function getProxy(): Promise<Remote<SimWorkerApi>> {
  if (!proxy) {
    const { proxy: p } = createSimWorker();
    await p.ready();
    proxy = p;
    void p
      .capabilities()
      .then((caps) => useSimStore.setState({ capabilities: caps, coi: caps.crossOriginIsolated }));
  }
  return proxy;
}

/**
 * A fresh random seed for a run. The seed is not user-configurable in the app —
 * each reset/new run reseeds so runs vary — it exists only so the compute core
 * is deterministic for tests. Kept below 2^31 so `seed + jobIndex` stays a valid
 * u32 across a batch.
 */
function randomSeed(): number {
  return Math.floor(Math.random() * 0x8000_0000);
}

/** Growth rate = last population / min population (∞ if min is 0, 0 if empty). */
export function growthRate(nb: number[]): number {
  if (nb.length === 0) return 0;
  const min = Math.min(...nb);
  if (min === 0) return Number.POSITIVE_INFINITY;
  return nb[nb.length - 1] / min;
}

interface SimState {
  config: RunConfig;
  status: RunStatus;

  // Batch queue.
  jobs: SimJob[];
  jobIndex: number;
  totalSims: number;
  completed: CompletedSim[];
  initedFor: RunConfig | null;

  // Current (in-flight) simulation.
  dims: RunDims | null;
  currentCondition: Condition | null;
  /** True while the current sim is active (not yet pushed to `completed`). */
  currentLive: boolean;
  frames: Uint8Array[]; // current sim's grid per step (for the scrubber)
  curNbCells: number[];
  curMPercents: number[];
  curRatio: number;
  currentStep: number;
  viewStep: number;
  following: boolean;

  stepsPerSec: number;
  coi: boolean;
  capabilities: Capabilities | null;
  benchResult: BenchmarkResult | null;
  benchRunning: boolean;
  error: string | null;

  setConfig: (patch: Partial<RunConfig>) => void;
  setModel: (model: Model) => void;
  setTreatments: (treatments: Treatment[]) => void;
  loadConfig: (config: RunConfig) => void;
  setViewStep: (step: number) => void;
  run: () => Promise<void>;
  pause: () => void;
  stepOnce: () => Promise<void>;
  reset: () => Promise<void>;
  benchmark: () => Promise<void>;
}

export const useSimStore = create<SimState>((set, get) => {
  /** Load job `index` into the worker and reset the current-sim view. */
  const initJob = async (p: Remote<SimWorkerApi>, index: number): Promise<void> => {
    const job = get().jobs[index];
    const res = await p.init(job.run);
    set({
      jobIndex: index,
      currentCondition: job.condition,
      currentLive: true,
      dims: { width: res.width, height: res.height, depth: res.depth, steps: res.steps },
      frames: [res.frame.grid],
      curNbCells: [res.frame.nbCells],
      curMPercents: [res.frame.mPercent],
      curRatio: res.ratio,
      currentStep: 0,
      viewStep: 0,
      following: true,
    });
  };

  /** Push the finished current sim onto `completed`. */
  const finalizeCurrent = (): void => {
    const s = get();
    if (!s.currentCondition) return;
    const job = s.jobs[s.jobIndex];
    set({
      currentLive: false,
      completed: [
        ...s.completed,
        {
          index: job.index,
          condition: s.currentCondition,
          repeatIndex: job.repeatIndex,
          nbCells: s.curNbCells,
          mPercents: s.curMPercents,
          ratio: s.curRatio,
          growthRate: growthRate(s.curNbCells),
        },
      ],
    });
  };

  const appendFrame = (f: StepFrame, sps: number): void => {
    set((s) => {
      const frames = s.frames.slice();
      frames[f.step] = f.grid;
      return {
        frames,
        curNbCells: [...s.curNbCells, f.nbCells],
        curMPercents: [...s.curMPercents, f.mPercent],
        currentStep: f.step,
        viewStep: s.following ? f.step : s.viewStep,
        stepsPerSec: sps,
      };
    });
  };

  /** (Re)build the batch queue and seed the first simulation. */
  const startBatch = async (): Promise<void> => {
    runToken++;
    // Every reset / new run draws a fresh seed, so runs are not reproducible
    // from the UI (that's intentional — the seed is a test-only knob).
    const config = { ...get().config, seed: randomSeed() };
    const jobs = buildJobs(config);
    set({
      config,
      jobs,
      jobIndex: 0,
      totalSims: jobs.length,
      completed: [],
      status: 'idle',
      error: null,
      stepsPerSec: 0,
      initedFor: config,
    });
    try {
      const p = await getProxy();
      await initJob(p, 0);
    } catch (e) {
      set({ error: String(e), status: 'idle' });
    }
  };

  const invalidate = (patch: Partial<SimState>) => {
    runToken++;
    set({ ...patch, status: 'idle', initedFor: null });
  };

  return {
    config: defaultConfig(),
    status: 'idle',
    jobs: [],
    jobIndex: 0,
    totalSims: 0,
    completed: [],
    initedFor: null,
    dims: null,
    currentCondition: null,
    currentLive: false,
    frames: [],
    curNbCells: [],
    curMPercents: [],
    curRatio: Number.NaN,
    currentStep: 0,
    viewStep: 0,
    following: true,
    stepsPerSec: 0,
    coi: false,
    capabilities: null,
    benchResult: null,
    benchRunning: false,
    error: null,

    setConfig: (patch) => invalidate({ config: { ...get().config, ...patch } }),
    setModel: (model) => invalidate({ config: applyModelDefaults(get().config, model) }),
    setTreatments: (treatments) =>
      invalidate({
        config: {
          ...get().config,
          treatments: treatments.length ? treatments : get().config.treatments,
        },
      }),

    loadConfig: (config) => invalidate({ config }),

    setViewStep: (step) => {
      const { currentStep } = get();
      const clamped = Math.max(0, Math.min(step, currentStep));
      set({ viewStep: clamped, following: clamped >= currentStep });
    },

    reset: startBatch,

    run: async () => {
      if (get().initedFor !== get().config || get().jobs.length === 0) await startBatch();
      if (get().status === 'done' || get().error) return;

      const token = ++runToken;
      set({ status: 'running', following: true });
      const p = await getProxy();
      const t0 = performance.now();
      let stepped = 0;

      try {
        while (get().status === 'running' && token === runToken) {
          const s = get();
          if (!s.dims) break;
          if (s.currentStep >= s.dims.steps) {
            finalizeCurrent();
            if (s.jobIndex + 1 >= s.jobs.length) {
              set({ status: 'done' });
              break;
            }
            await initJob(p, s.jobIndex + 1);
            continue;
          }
          const f = await p.step();
          if (token !== runToken) break;
          stepped++;
          appendFrame(f, stepped / ((performance.now() - t0) / 1000 || 1));
          // Macrotask yield: paints the dish/charts and stays alive when the
          // tab is backgrounded (rAF is throttled there).
          await new Promise((r) => setTimeout(r, 0));
        }
      } catch (e) {
        set({ error: String(e), status: 'paused' });
      }
    },

    pause: () => {
      runToken++;
      if (get().status === 'running') set({ status: 'paused' });
    },

    stepOnce: async () => {
      if (get().status === 'running') return;
      if (get().initedFor !== get().config || get().jobs.length === 0) await startBatch();
      const s = get();
      if (!s.dims) return;
      const token = ++runToken;
      try {
        const p = await getProxy();
        if (s.currentStep >= s.dims.steps) {
          finalizeCurrent();
          if (s.jobIndex + 1 >= s.jobs.length) {
            set({ status: 'done' });
            return;
          }
          await initJob(p, s.jobIndex + 1);
          set({ status: 'paused' });
          return;
        }
        const f = await p.step();
        if (token !== runToken) return;
        appendFrame(f, 0);
        set({ status: 'paused' });
      } catch (e) {
        set({ error: String(e) });
      }
    },

    benchmark: async () => {
      if (get().benchRunning || get().status === 'running') return;
      runToken++; // stop any in-flight run; the bench uses a throwaway sim
      set({ benchRunning: true, status: 'idle', error: null });
      try {
        const p = await getProxy();
        const jobs = buildJobs(get().config);
        const result = await p.benchmark(jobs[0].run);
        set({ benchResult: result });
      } catch (e) {
        set({ error: String(e) });
      } finally {
        set({ benchRunning: false, initedFor: null });
      }
    },
  };
});

/** Aggregate stats per condition (mean over repeats), in first-seen order. */
export interface ConditionStat {
  condition: Condition;
  runs: number;
  meanRatio: number;
  meanGrowth: number;
}

/**
 * Aggregate finished sims per condition. Takes the raw `completed` array (not
 * the store state) so callers can memoize it — returning a fresh array straight
 * from a zustand selector would trip its snapshot-caching guard.
 */
export function conditionStats(completed: CompletedSim[]): ConditionStat[] {
  const order: string[] = [];
  const groups = new Map<string, CompletedSim[]>();
  for (const sim of completed) {
    const key = conditionKey(sim.condition);
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)?.push(sim);
  }
  return order.map((key) => {
    const sims = groups.get(key) as CompletedSim[];
    const mean = (f: (s: CompletedSim) => number) =>
      sims.reduce((a, s) => a + f(s), 0) / sims.length;
    return {
      condition: sims[0].condition,
      runs: sims.length,
      meanRatio: mean((s) => s.ratio),
      meanGrowth: mean((s) => (Number.isFinite(s.growthRate) ? s.growthRate : 0)),
    };
  });
}
