import { useMemo } from 'react';
import { download, resultsToJson, seriesToCsv } from '../export/exporters.ts';
import { TREATMENT_COLORS, TREATMENT_LABELS } from '../schema/config.ts';
import { conditionStats, useSimStore } from '../store/simStore.ts';
import { OverlayChart, type OverlaySeries } from './OverlayChart.tsx';

/** Pad a series to `len` with nulls (uPlot renders those as gaps); scale values. */
function padTo(arr: number[], len: number, scale = 1): (number | null)[] {
  const out: (number | null)[] = new Array(len).fill(null);
  for (let i = 0; i < arr.length && i < len; i++) out[i] = arr[i] * scale;
  return out;
}

/** Right panel — overlaid per-treatment curves + the per-condition table. */
export function ChartsPanel() {
  const completed = useSimStore((s) => s.completed);
  const curNbCells = useSimStore((s) => s.curNbCells);
  const curMPercents = useSimStore((s) => s.curMPercents);
  const currentCondition = useSimStore((s) => s.currentCondition);
  const currentLive = useSimStore((s) => s.currentLive);
  const dims = useSimStore((s) => s.dims);
  const configSteps = useSimStore((s) => s.config.steps);
  const treatments = useSimStore((s) => s.config.treatments);
  const config = useSimStore((s) => s.config);
  const stats = useMemo(() => conditionStats(completed), [completed]);
  const hasResults = completed.length > 0;

  const steps = dims?.steps ?? configSteps;

  const { xs, pop, mPct } = useMemo(() => {
    const xVals = Array.from({ length: steps + 1 }, (_, i) => i);
    const popSeries: OverlaySeries[] = [];
    const mSeries: OverlaySeries[] = [];
    for (const sim of completed) {
      const color = TREATMENT_COLORS[sim.condition.treatment];
      popSeries.push({ data: padTo(sim.nbCells, steps + 1), color });
      mSeries.push({ data: padTo(sim.mPercents, steps + 1, 100), color });
    }
    // The current, not-yet-finalized sim draws live (never duplicating a
    // completed one, thanks to the `currentLive` flag).
    if (currentLive && currentCondition && curNbCells.length > 0) {
      const color = TREATMENT_COLORS[currentCondition.treatment];
      popSeries.push({ data: padTo(curNbCells, steps + 1), color });
      mSeries.push({ data: padTo(curMPercents, steps + 1, 100), color });
    }
    return { xs: xVals, pop: popSeries, mPct: mSeries };
  }, [completed, curNbCells, curMPercents, currentCondition, currentLive, steps]);

  return (
    <div className="panel charts-panel">
      <div className="panel-head">
        <h2>Results</h2>
        <div className="config-io">
          <button
            type="button"
            disabled={!hasResults}
            onClick={() =>
              download('cancer-automata-series.csv', seriesToCsv(completed), 'text/csv')
            }
          >
            ⬇ CSV
          </button>
          <button
            type="button"
            disabled={!hasResults}
            onClick={() =>
              download(
                'cancer-automata-results.json',
                resultsToJson(config, completed, stats),
                'application/json',
              )
            }
          >
            ⬇ JSON
          </button>
        </div>
      </div>

      <div className="chart-legend">
        {treatments.map((t) => (
          <span key={t}>
            <i className="swatch" style={{ background: TREATMENT_COLORS[t] }} />{' '}
            {TREATMENT_LABELS[t]}
          </span>
        ))}
      </div>

      <OverlayChart title="Population" xs={xs} series={pop} />
      <OverlayChart title="Mesenchymal %" xs={xs} series={mPct} />

      <table className="results">
        <thead>
          <tr>
            <th>Condition</th>
            <th>n</th>
            <th>pS</th>
            <th>Growth</th>
          </tr>
        </thead>
        <tbody>
          {stats.length === 0 ? (
            <tr>
              <td colSpan={4} className="empty">
                Run a batch to populate results.
              </td>
            </tr>
          ) : (
            stats.map((s) => (
              <tr key={`${s.condition.treatment}@${s.condition.mPercent}`}>
                <th>
                  <i
                    className="swatch"
                    style={{ background: TREATMENT_COLORS[s.condition.treatment] }}
                  />{' '}
                  {TREATMENT_LABELS[s.condition.treatment]} · {s.condition.mPercent}% M
                </th>
                <td>{s.runs}</td>
                <td>{s.meanRatio.toFixed(3)}</td>
                <td>{s.meanGrowth.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
