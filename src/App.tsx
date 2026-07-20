import { useEffect, useState } from 'react';
import { createSimWorker } from './worker/client.ts';

type SmokeState =
  | { status: 'booting' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      version: string;
      sum: number;
      crossOriginIsolated: boolean;
    };

/**
 * M0 smoke-test surface. Boots the worker, initialises WASM, calls the trivial
 * exports, and renders the results — proving the whole pipeline works end to
 * end (Vite + Worker + Comlink + WASM + COOP/COEP). Replaced by the real UI
 * from M4 onward.
 */
export function App() {
  const [state, setState] = useState<SmokeState>({ status: 'booting' });

  useEffect(() => {
    const { proxy, worker } = createSimWorker();
    let cancelled = false;

    (async () => {
      try {
        await proxy.ready();
        const [version, sum, crossOriginIsolated] = await Promise.all([
          proxy.version(),
          proxy.add(19, 23),
          proxy.isCrossOriginIsolated(),
        ]);
        if (!cancelled) {
          setState({ status: 'ready', version, sum, crossOriginIsolated });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ status: 'error', message: String(err) });
        }
      }
    })();

    return () => {
      cancelled = true;
      worker.terminate();
    };
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', lineHeight: 1.5 }}>
      <h1>Cancer AutoMata</h1>
      <p>Milestone M0 — pipeline smoke test.</p>

      {state.status === 'booting' && <p data-testid="status">Booting worker + WASM…</p>}

      {state.status === 'error' && (
        <p data-testid="status" style={{ color: 'crimson' }}>
          Pipeline error: {state.message}
        </p>
      )}

      {state.status === 'ready' && (
        <dl data-testid="smoke-results">
          <dt>WASM core</dt>
          <dd data-testid="wasm-version">{state.version}</dd>
          <dt>add(19, 23) via WASM</dt>
          <dd data-testid="wasm-sum">{state.sum}</dd>
          <dt>Cross-origin isolated (SharedArrayBuffer available)</dt>
          <dd data-testid="coi">{state.crossOriginIsolated ? 'yes' : 'no'}</dd>
        </dl>
      )}
    </main>
  );
}
