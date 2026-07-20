import type { Remote } from 'comlink';
import { create } from 'zustand';
import type { Model } from '../core-ts/types.ts';
import { applyModelDefaults, defaultConfig, type RunConfig, resolveRun } from '../schema/config.ts';
import { createSimWorker } from '../worker/client.ts';
import type { RunDims, SimWorkerApi } from '../worker/sim.worker.ts';

export type RunStatus = 'idle' | 'running' | 'paused' | 'done';

// The worker proxy and the run-loop token live outside React state.
let proxy: Remote<SimWorkerApi> | null = null;
let runToken = 0;

async function getProxy(): Promise<Remote<SimWorkerApi>> {
  if (!proxy) {
    const { proxy: p } = createSimWorker();
    await p.ready();
    proxy = p;
    void p.isCrossOriginIsolated().then((coi) => useSimStore.setState({ coi }));
  }
  return proxy;
}

interface SimState {
  config: RunConfig;
  status: RunStatus;
  dims: RunDims | null;
  /** Grid snapshot per step (index = step); enables the scrubber. */
  frames: Uint8Array[];
  nbCells: number[];
  mPercents: number[];
  ratio: number;
  currentStep: number;
  viewStep: number;
  /** When true, the viewed step follows the latest computed step. */
  following: boolean;
  stepsPerSec: number;
  coi: boolean;
  error: string | null;
  /** The config the worker was last initialised for (null ⇒ needs (re)init). */
  initedFor: RunConfig | null;

  setConfig: (patch: Partial<RunConfig>) => void;
  setModel: (model: Model) => void;
  setViewStep: (step: number) => void;
  run: () => Promise<void>;
  pause: () => void;
  stepOnce: () => Promise<void>;
  reset: () => Promise<void>;
}

/** Append one frame to the series and advance the (optionally following) view. */
function appendFrame(
  state: SimState,
  f: { step: number; nbCells: number; mPercent: number; done: boolean; grid: Uint8Array },
  status: RunStatus,
  stepsPerSec: number,
): Partial<SimState> {
  const frames = state.frames.slice();
  frames[f.step] = f.grid;
  return {
    frames,
    nbCells: [...state.nbCells, f.nbCells],
    mPercents: [...state.mPercents, f.mPercent],
    currentStep: f.step,
    viewStep: state.following ? f.step : state.viewStep,
    status: f.done ? 'done' : status,
    stepsPerSec,
  };
}

export const useSimStore = create<SimState>((set, get) => ({
  config: defaultConfig(),
  status: 'idle',
  dims: null,
  frames: [],
  nbCells: [],
  mPercents: [],
  ratio: Number.NaN,
  currentStep: 0,
  viewStep: 0,
  following: true,
  stepsPerSec: 0,
  coi: false,
  error: null,
  initedFor: null,

  setConfig: (patch) => {
    runToken++; // cancel any in-flight run
    set((s) => ({ config: { ...s.config, ...patch }, status: 'idle', initedFor: null }));
  },

  setModel: (model) => {
    runToken++;
    set((s) => ({ config: applyModelDefaults(s.config, model), status: 'idle', initedFor: null }));
  },

  setViewStep: (step) => {
    const { currentStep } = get();
    const clamped = Math.max(0, Math.min(step, currentStep));
    set({ viewStep: clamped, following: clamped >= currentStep });
  },

  reset: async () => {
    runToken++;
    set({ status: 'idle', error: null, stepsPerSec: 0 });
    try {
      const p = await getProxy();
      const config = get().config;
      const res = await p.init(resolveRun(config));
      set({
        dims: { width: res.width, height: res.height, depth: res.depth, steps: res.steps },
        frames: [res.frame.grid],
        nbCells: [res.frame.nbCells],
        mPercents: [res.frame.mPercent],
        ratio: res.ratio,
        currentStep: 0,
        viewStep: 0,
        following: true,
        status: res.frame.done ? 'done' : 'idle',
        initedFor: config,
      });
    } catch (e) {
      set({ error: String(e), status: 'idle' });
    }
  },

  run: async () => {
    if (get().initedFor !== get().config || !get().dims) await get().reset();
    if (get().status === 'done' || get().error) return;

    const token = ++runToken;
    set({ status: 'running', following: true });
    const p = await getProxy();

    const t0 = performance.now();
    const step0 = get().currentStep;
    try {
      while (get().status === 'running' && token === runToken) {
        const { currentStep, dims } = get();
        if (!dims || currentStep >= dims.steps) {
          set({ status: 'done' });
          break;
        }
        const f = await p.step();
        if (token !== runToken) break; // superseded (reset / config change)
        const sps = (f.step - step0) / ((performance.now() - t0) / 1000 || 1);
        set((s) => appendFrame(s, f, 'running', sps));
        // Yield to the event loop so the dish + charts paint and Pause is
        // responsive. A macrotask (not rAF) keeps running even when the tab is
        // backgrounded, where rAF is throttled to a near halt.
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
    if (get().initedFor !== get().config || !get().dims) await get().reset();
    const { currentStep, dims } = get();
    if (!dims || currentStep >= dims.steps) {
      set({ status: 'done' });
      return;
    }
    const token = ++runToken;
    try {
      const p = await getProxy();
      const f = await p.step();
      if (token !== runToken) return;
      set((s) => appendFrame(s, f, 'paused', 0));
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));

/** Growth rate = last population / min population over the run (0 if empty). */
export function selectGrowthRate(state: SimState): number {
  if (state.nbCells.length === 0) return 0;
  const min = Math.min(...state.nbCells);
  if (min === 0) return Number.POSITIVE_INFINITY;
  return state.nbCells[state.nbCells.length - 1] / min;
}
