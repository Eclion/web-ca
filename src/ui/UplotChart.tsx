import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { useEffect, useRef } from 'react';

interface Props {
  title: string;
  xs: Float64Array;
  ys: Float64Array;
  color: string;
  yLabel: string;
}

const HEIGHT = 180;

/** Thin uPlot wrapper: creates the plot once, streams data on updates. */
export function UplotChart({ title, xs, ys, color, yLabel }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: recreate only when static opts change.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const opts: uPlot.Options = {
      title,
      width: host.clientWidth || 320,
      height: HEIGHT,
      scales: { x: { time: false } },
      legend: { show: false },
      cursor: { drag: { x: false, y: false } },
      series: [
        { label: 'step' },
        { label: yLabel, stroke: color, width: 2, points: { show: false } },
      ],
      axes: [
        { stroke: '#888', grid: { stroke: '#2a2a2a' } },
        { stroke: '#888', grid: { stroke: '#2a2a2a' } },
      ],
    };
    const plot = new uPlot(opts, [xs, ys], host);
    plotRef.current = plot;
    const ro = new ResizeObserver(() => plot.setSize({ width: host.clientWidth, height: HEIGHT }));
    ro.observe(host);
    return () => {
      ro.disconnect();
      plot.destroy();
      plotRef.current = null;
    };
  }, [title, yLabel, color]);

  useEffect(() => {
    plotRef.current?.setData([xs, ys]);
  }, [xs, ys]);

  return <div className="chart" ref={hostRef} />;
}
