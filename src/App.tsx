import { useEffect } from 'react';
import './app.css';
import { useSimStore } from './store/simStore.ts';
import { ChartsPanel } from './ui/ChartsPanel.tsx';
import { DishViewport } from './ui/DishViewport.tsx';
import { ParametersPanel } from './ui/ParametersPanel.tsx';
import { TopBar } from './ui/TopBar.tsx';

export function App() {
  const reset = useSimStore((s) => s.reset);

  // Seed an initial dish on load so the viewport isn't blank.
  useEffect(() => {
    void reset();
  }, [reset]);

  return (
    <div className="app">
      <TopBar />
      <div className="body">
        <ParametersPanel />
        <DishViewport />
        <ChartsPanel />
      </div>
      <footer className="footer">
        <a
          href="https://www.nature.com/articles/s41540-019-0084-5"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source paper
        </a>
        <span>Vibe coded with Claude</span>
      </footer>
    </div>
  );
}
