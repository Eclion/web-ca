import { useRef, useState } from 'react';
import type { Model, Treatment } from '../core-ts/types.ts';
import { configToJson, download } from '../export/exporters.ts';
import { LARGE_DISH_WARNING, parseConfig, TREATMENT_LABELS } from '../schema/config.ts';
import { useSimStore } from '../store/simStore.ts';

const MODELS: Model[] = ['A', 'B', 'C'];
const TREATMENTS: Treatment[] = ['WT', 'TRAIL', 'TR_BIM'];

function NumberField(props: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <label className="field">
      <span>{props.label}</span>
      <input
        type="number"
        value={props.value}
        min={props.min}
        max={props.max}
        disabled={props.disabled}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!Number.isNaN(v)) props.onChange(v);
        }}
      />
    </label>
  );
}

/** Parse a comma/space separated list of percentages (0..100), ignoring junk. */
function parsePercentList(raw: string): number[] {
  return raw
    .split(/[\s,]+/)
    .map((t) => Number(t))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 100);
}

/** Left panel — mirrors the MATLAB parameter UI (PRD §4.1). */
export function ParametersPanel() {
  const config = useSimStore((s) => s.config);
  const setConfig = useSimStore((s) => s.setConfig);
  const setModel = useSimStore((s) => s.setModel);
  const setTreatments = useSimStore((s) => s.setTreatments);
  const loadConfig = useSimStore((s) => s.loadConfig);
  const [mPercentText, setMPercentText] = useState(config.mesenchymalPercentages.join(', '));
  const [importError, setImportError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setRule = (k: keyof typeof config.rules, v: number) =>
    setConfig({ rules: { ...config.rules, [k]: v } });

  const toggleTreatment = (t: Treatment) => {
    const has = config.treatments.includes(t);
    setTreatments(has ? config.treatments.filter((x) => x !== t) : [...config.treatments, t]);
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-importing the same file
    if (!file) return;
    file.text().then((text) => {
      const result = parseConfig(text);
      if (result.ok) {
        loadConfig(result.config);
        setMPercentText(result.config.mesenchymalPercentages.join(', '));
        setImportError(null);
      } else {
        setImportError(result.error);
      }
    });
  };

  return (
    <div className="panel params">
      <div className="panel-head">
        <button
          type="button"
          className="params-collapse-btn"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((c) => !c)}
        >
          <span className="chevron">{collapsed ? '▸' : '▾'}</span> Parameters
        </button>
        <h2>Parameters</h2>
        <div className="config-io">
          <button
            type="button"
            onClick={() =>
              download('cancer-automata-config.json', configToJson(config), 'application/json')
            }
          >
            ⬇ Config
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}>
            ⬆ Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={onImportFile}
          />
        </div>
      </div>
      {importError && <p className="warn">Import failed: {importError}</p>}

      <div className={collapsed ? 'params-body collapsed' : 'params-body'}>
        <label className="field">
          <span>Model</span>
          <select value={config.model} onChange={(e) => setModel(e.target.value as Model)}>
            {MODELS.map((m) => (
              <option key={m} value={m}>
                Model {m}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend>Treatments</legend>
          <div className="checks">
            {TREATMENTS.map((t) => (
              <label key={t} className="check">
                <input
                  type="checkbox"
                  checked={config.treatments.includes(t)}
                  onChange={() => toggleTreatment(t)}
                />
                {TREATMENT_LABELS[t]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Rules</legend>
          <div className="grid2">
            <NumberField
              label="Survival min"
              value={config.rules.survivalMin}
              min={0}
              max={27}
              onChange={(v) => setRule('survivalMin', v)}
            />
            <NumberField
              label="Survival max"
              value={config.rules.survivalMax}
              min={0}
              max={27}
              onChange={(v) => setRule('survivalMax', v)}
            />
            <NumberField
              label="Birth min"
              value={config.rules.birthMin}
              min={0}
              max={27}
              onChange={(v) => setRule('birthMin', v)}
            />
            <NumberField
              label="Birth max"
              value={config.rules.birthMax}
              min={0}
              max={27}
              onChange={(v) => setRule('birthMax', v)}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>Dish</legend>
          <div className="grid2">
            <NumberField
              label="Size"
              value={config.dishSize}
              min={4}
              max={550}
              onChange={(v) => setConfig({ dishSize: v })}
            />
            <NumberField
              label="Height"
              value={config.dishHeight}
              min={1}
              max={8}
              onChange={(v) => setConfig({ dishHeight: v })}
            />
          </div>
          {config.dishSize > LARGE_DISH_WARNING && (
            <p className="warn">Large dish ({config.dishSize}²) — runs and memory grow quickly.</p>
          )}
        </fieldset>

        <fieldset>
          <legend>Simulation</legend>
          <div className="grid2">
            <NumberField
              label="Initial cells"
              value={config.initialCells}
              min={1}
              onChange={(v) => setConfig({ initialCells: v })}
            />
            <NumberField
              label="Steps"
              value={config.steps}
              min={1}
              max={2000}
              onChange={(v) => setConfig({ steps: v })}
            />
            <NumberField
              label="Repeats"
              value={config.repeats}
              min={1}
              max={100}
              onChange={(v) => setConfig({ repeats: v })}
            />
            <NumberField
              label="Seed"
              value={config.seed}
              min={0}
              onChange={(v) => setConfig({ seed: v })}
            />
          </div>
          <label className="field">
            <span>Mesenchymal % (comma-separated)</span>
            <input
              type="text"
              value={mPercentText}
              placeholder="empty → defaults 2 / 10 / 95"
              disabled={config.model === 'A'}
              onChange={(e) => {
                setMPercentText(e.target.value);
                setConfig({ mesenchymalPercentages: parsePercentList(e.target.value) });
              }}
            />
          </label>
          {config.model === 'A' ? (
            <p className="hint">Model A is epithelial-only (M % ignored).</p>
          ) : (
            <p className="hint">Empty list uses each treatment's default M% (2 / 10 / 95).</p>
          )}
        </fieldset>
      </div>
    </div>
  );
}
