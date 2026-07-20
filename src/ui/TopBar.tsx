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
  const stepsPerSec = useSimStore((s) => s.stepsPerSec);
  const coi = useSimStore((s) => s.coi);
  const error = useSimStore((s) => s.error);
  const run = useSimStore((s) => s.run);
  const pause = useSimStore((s) => s.pause);
  const stepOnce = useSimStore((s) => s.stepOnce);
  const reset = useSimStore((s) => s.reset);
  const configSteps = useSimStore((s) => s.config.steps);

  const steps = dims?.steps ?? configSteps;
  const running = status === 'running';

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
      </div>

      <div className="status">
        <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>
        <span>
          Step {currentStep} / {steps}
        </span>
        <span>{stepsPerSec > 0 ? `${stepsPerSec.toFixed(1)} steps/s` : '—'}</span>
        <span title="Cross-origin isolated (SharedArrayBuffer available)">
          COI: {coi ? 'yes' : 'no'}
        </span>
      </div>

      {error && <div className="error">{error}</div>}
    </header>
  );
}
