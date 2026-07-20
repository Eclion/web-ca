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
    </div>
  );
}
