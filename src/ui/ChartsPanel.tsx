import { useMemo } from 'react';
import { selectGrowthRate, useSimStore } from '../store/simStore.ts';
import { UplotChart } from './UplotChart.tsx';

/** Right panel — population + M% curves and the results table (PRD §4.1). */
export function ChartsPanel() {
  const nbCells = useSimStore((s) => s.nbCells);
  const mPercents = useSimStore((s) => s.mPercents);
  const ratio = useSimStore((s) => s.ratio);
  const viewStep = useSimStore((s) => s.viewStep);
  const growthRate = useSimStore(selectGrowthRate);

  const xs = useMemo(() => Float64Array.from(nbCells, (_, i) => i), [nbCells]);
  const pop = useMemo(() => Float64Array.from(nbCells), [nbCells]);
  const mPct = useMemo(() => Float64Array.from(mPercents, (v) => v * 100), [mPercents]);

  const viewPop = nbCells[viewStep] ?? 0;
  const viewM = (mPercents[viewStep] ?? 0) * 100;

  return (
    <div className="panel charts-panel">
      <h2>Results</h2>
      <UplotChart title="Population" xs={xs} ys={pop} color="#4ea1ff" yLabel="cells" />
      <UplotChart title="Mesenchymal %" xs={xs} ys={mPct} color="#ff5a5a" yLabel="M %" />

      <table className="results">
        <tbody>
          <tr>
            <th>Survival ratio (pS)</th>
            <td>{Number.isFinite(ratio) ? ratio.toFixed(4) : '—'}</td>
          </tr>
          <tr>
            <th>Growth rate</th>
            <td>{Number.isFinite(growthRate) ? growthRate.toFixed(3) : '∞'}</td>
          </tr>
          <tr>
            <th>Population @ step {viewStep}</th>
            <td>{viewPop.toLocaleString()}</td>
          </tr>
          <tr>
            <th>M % @ step {viewStep}</th>
            <td>{viewM.toFixed(1)}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
