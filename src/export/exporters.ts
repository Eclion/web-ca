import { projectToRGBA } from '../render/project.ts';
import { type RunConfig, TREATMENT_LABELS } from '../schema/config.ts';
import type { CompletedSim, ConditionStat } from '../store/simStore.ts';
import type { RunDims } from '../worker/sim.worker.ts';

/** Escape a CSV field only when it contains a comma, quote, or newline. */
function csvField(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Long-format series CSV: one row per (simulation, step). */
export function seriesToCsv(completed: CompletedSim[]): string {
  const lines = ['treatment,mesenchymal_pct,repeat,step,nb_cells,m_fraction'];
  for (const sim of completed) {
    for (let step = 0; step < sim.nbCells.length; step++) {
      lines.push(
        [
          csvField(TREATMENT_LABELS[sim.condition.treatment]),
          sim.condition.mPercent,
          sim.repeatIndex,
          step,
          sim.nbCells[step],
          sim.mPercents[step],
        ].join(','),
      );
    }
  }
  return `${lines.join('\n')}\n`;
}

/** Full run results as structured JSON (config + per-condition + per-sim series). */
export function resultsToJson(
  config: RunConfig,
  completed: CompletedSim[],
  stats: ConditionStat[],
): string {
  return `${JSON.stringify(
    {
      config,
      conditions: stats.map((s) => ({
        treatment: s.condition.treatment,
        mesenchymalPercentage: s.condition.mPercent,
        runs: s.runs,
        meanRatio: s.meanRatio,
        meanGrowthRate: s.meanGrowth,
      })),
      simulations: completed.map((sim) => ({
        treatment: sim.condition.treatment,
        mesenchymalPercentage: sim.condition.mPercent,
        repeatIndex: sim.repeatIndex,
        ratio: sim.ratio,
        growthRate: sim.growthRate,
        nbCells: sim.nbCells,
        mPercents: sim.mPercents,
      })),
    },
    null,
    2,
  )}\n`;
}

export function configToJson(config: RunConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

/** Trigger a browser download of `data` as `filename`. */
export function download(filename: string, data: string | Blob, mime = 'application/octet-stream') {
  const blob = typeof data === 'string' ? new Blob([data], { type: mime }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Render a grid frame to a native-resolution canvas (1 cell = 1 pixel). */
export function dishToCanvas(grid: Uint8Array, dims: RunDims): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  const rgba = projectToRGBA(grid, dims.width, dims.height, dims.depth);
  const img = ctx.createImageData(dims.width, dims.height);
  img.data.set(rgba);
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Export the given grid frame as a crisp, native-resolution PNG. */
export function downloadDishPng(grid: Uint8Array, dims: RunDims, filename: string) {
  dishToCanvas(grid, dims).toBlob((blob) => {
    if (blob) download(filename, blob, 'image/png');
  }, 'image/png');
}
