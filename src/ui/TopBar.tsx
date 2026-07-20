import { useSimStore } from '../store/simStore.ts';

const STATUS_LABEL: Record<string, string> = {
  idle: 'Idle',
  running: 'Running',
  paused: 'Paused',
  done: 'Done',
};

/** Top bar — run controls, progress, and throughput (PRD §4.1). */
export function TopBar() {
  const status = useSimStore((s) => s.status);
  const currentStep = useSimStore((s) => s.currentStep);
  const dims = useSimStore((s) => s.dims);
  const jobIndex = useSimStore((s) => s.jobIndex);
  const totalSims = useSimStore((s) => s.totalSims);
  const completedCount = useSimStore((s) => s.completed.length);
  const stepsPerSec = useSimStore((s) => s.stepsPerSec);
  const coi = useSimStore((s) => s.coi);
  const capabilities = useSimStore((s) => s.capabilities);
  const benchResult = useSimStore((s) => s.benchResult);
  const benchRunning = useSimStore((s) => s.benchRunning);
  const error = useSimStore((s) => s.error);
  const run = useSimStore((s) => s.run);
  const pause = useSimStore((s) => s.pause);
  const stepOnce = useSimStore((s) => s.stepOnce);
  const reset = useSimStore((s) => s.reset);
  const benchmark = useSimStore((s) => s.benchmark);
  const configSteps = useSimStore((s) => s.config.steps);

  const steps = dims?.steps ?? configSteps;
  const running = status === 'running';
  const simNo = status === 'done' ? totalSims : Math.min(jobIndex + 1, Math.max(totalSims, 1));

  return (
    <header className="topbar">
      <div className="brand">Cancer AutoMata</div>

      <div className="controls">
        {running ? (
          <button type="button" onClick={pause}>
            ⏸ Pause
          </button>
        ) : (
          <button type="button" onClick={run} disabled={status === 'done'}>
            ▶ Run
          </button>
        )}
        <button type="button" onClick={stepOnce} disabled={running || status === 'done'}>
          ⏭ Step
        </button>
        <button type="button" onClick={reset}>
          ↻ Reset
        </button>
        <button
          type="button"
          onClick={benchmark}
          disabled={running || benchRunning}
          title="Run a fixed timed simulation"
        >
          {benchRunning ? '⏱ …' : '⏱ Benchmark'}
        </button>
      </div>

      <div className="status">
        <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>
        <span>
          Sim {simNo} / {totalSims || 1}
        </span>
        <span>
          Step {currentStep} / {steps}
        </span>
        <span>{completedCount} done</span>
        <span>{stepsPerSec > 0 ? `${stepsPerSec.toFixed(0)} steps/s` : '—'}</span>
        {benchResult && (
          <span title="Benchmark: steps/s and cell-updates/s for a fixed run">
            ⏱ {benchResult.stepsPerSec.toFixed(0)} st/s ·{' '}
            {(benchResult.cellUpdatesPerSec / 1e6).toFixed(1)} Mcell/s
          </span>
        )}
        <span title="Compute-core capabilities">
          {capabilities?.simd ? 'SIMD' : 'no-SIMD'} · COI: {coi ? 'yes' : 'no'}
        </span>
      </div>

      {error && <div className="error">{error}</div>}
    </header>
  );
}
