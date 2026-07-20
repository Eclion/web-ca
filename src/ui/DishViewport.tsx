import { TREATMENT_LABELS } from '../schema/config.ts';
import { useSimStore } from '../store/simStore.ts';
import { DishCanvas } from './DishCanvas.tsx';

/** Center pane — the dish canvas with a step scrubber and a legend. */
export function DishViewport() {
  const currentStep = useSimStore((s) => s.currentStep);
  const viewStep = useSimStore((s) => s.viewStep);
  const following = useSimStore((s) => s.following);
  const setViewStep = useSimStore((s) => s.setViewStep);
  const condition = useSimStore((s) => s.currentCondition);

  return (
    <div className="panel viewport">
      <div className="dish-wrap">
        {condition && (
          <div className="dish-caption">
            {TREATMENT_LABELS[condition.treatment]} · {condition.mPercent}% M
          </div>
        )}
        <DishCanvas />
        <div className="legend">
          <span>
            <i className="swatch e" /> Epithelial
          </span>
          <span>
            <i className="swatch m" /> Mesenchymal
          </span>
        </div>
      </div>

      <div className="scrubber">
        <input
          type="range"
          min={0}
          max={Math.max(currentStep, 0)}
          value={viewStep}
          onChange={(e) => setViewStep(Number(e.target.value))}
        />
        <span className="scrub-label">
          step {viewStep} / {currentStep}
          {following ? ' (live)' : ''}
        </span>
      </div>
    </div>
  );
}
