/// <reference lib="webworker" />
import * as Comlink from 'comlink';
import type { ResolvedRun } from '../schema/config.ts';
import init, { Simulation } from '../wasm/core_wasm.js';

export interface RunDims {
  width: number;
  height: number;
  depth: number;
  steps: number;
}

/** One step's outputs. `grid` is a fresh copy transferred to the main thread. */
export interface StepFrame {
  step: number;
  nbCells: number;
  mPercent: number;
  done: boolean;
  grid: Uint8Array;
}

export interface SeriesData {
  nbCells: number[];
  mPercents: number[];
  ratio: number;
}

/**
 * Simulation worker API. The heavy compute runs here (off the main thread); the
 * main thread drives the loop by awaiting `step()` and renders the returned
 * frames. See PRD §5.6 / §6.
 */
export interface SimWorkerApi {
  ready(): Promise<void>;
  init(run: ResolvedRun): RunDims & { ratio: number; frame: StepFrame };
  step(): StepFrame;
  series(): SeriesData;
  isCrossOriginIsolated(): boolean;
}

let initialised = false;
let sim: Simulation | null = null;
let run: ResolvedRun | null = null;

function frame(step: number, done: boolean): StepFrame {
  if (!sim) throw new Error('Simulation not initialised');
  const nb = sim.nb_cells();
  const mp = sim.m_percents();
  const grid = sim.grid();
  return {
    step,
    nbCells: nb[nb.length - 1],
    mPercent: mp[mp.length - 1],
    done,
    grid,
  };
}

const api: SimWorkerApi = {
  async ready() {
    if (initialised) return;
    await init();
    initialised = true;
  },

  init(nextRun) {
    sim?.free();
    run = nextRun;
    sim = new Simulation(
      nextRun.model,
      nextRun.survivalMin,
      nextRun.survivalMax,
      nextRun.birthMin,
      nextRun.birthMax,
      nextRun.dishSize,
      nextRun.dishHeight,
      nextRun.initialCells,
      nextRun.steps,
      nextRun.mean,
      nextRun.pMesen,
      nextRun.seed,
    );
    const f = frame(0, nextRun.steps === 0);
    const dims: RunDims = {
      width: nextRun.dishSize,
      height: nextRun.dishSize,
      depth: nextRun.dishHeight,
      steps: nextRun.steps,
    };
    return Comlink.transfer({ ...dims, ratio: sim.ratio, frame: f }, [f.grid.buffer]);
  },

  step() {
    if (!sim || !run) throw new Error('Simulation not initialised');
    if (sim.currentStep >= run.steps) {
      const f = frame(sim.currentStep, true);
      return Comlink.transfer(f, [f.grid.buffer]);
    }
    sim.step();
    const f = frame(sim.currentStep, sim.currentStep >= run.steps);
    return Comlink.transfer(f, [f.grid.buffer]);
  },

  series() {
    if (!sim) throw new Error('Simulation not initialised');
    return {
      nbCells: Array.from(sim.nb_cells()),
      mPercents: Array.from(sim.m_percents()),
      ratio: sim.ratio,
    };
  },

  isCrossOriginIsolated() {
    return globalThis.crossOriginIsolated === true;
  },
};

Comlink.expose(api);
