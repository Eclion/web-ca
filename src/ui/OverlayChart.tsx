import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { useEffect, useRef } from 'react';

export interface OverlaySeries {
  data: (number | null)[];
  color: string;
}

interface Props {
  title: string;
  xs: number[];
  series: OverlaySeries[];
}

const HEIGHT = 180;

/**
 * uPlot line chart with N overlaid series. uPlot's series set is fixed at
 * creation, so the plot is rebuilt when the series *count* changes and merely
 * re-fed when only the data changes.
 */
export function OverlayChart({ title, xs, series }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  // uPlot's series set (count + colours) is fixed at creation, so rebuild
  // whenever the colour signature changes — not just the count. A transient
  // render during sim hand-off can momentarily duplicate a colour, and keying
  // on count alone would freeze those stale colours.
  const sig = series.map((s) => s.color).join('|');

  const buildData = (): uPlot.AlignedData => [xs, ...series.map((s) => s.data)];

  // biome-ignore lint/correctness/useExhaustiveDependencies: rebuild only when the series signature (or title) changes.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const opts: uPlot.Options = {
      title,
      width: host.clientWidth || 320,
      height: HEIGHT,
      legend: { show: false },
      cursor: { drag: { x: false, y: false } },
      scales: { x: { time: false } },
      series: [
        { label: 'step' },
        ...series.map((s) => ({ stroke: s.color, width: 1.5, points: { show: false } })),
      ],
      axes: [
        { stroke: '#888', grid: { stroke: '#2a2a2a' } },
        { stroke: '#888', grid: { stroke: '#2a2a2a' } },
      ],
    };
    const plot = new uPlot(opts, buildData(), host);
    plotRef.current = plot;
    const ro = new ResizeObserver(() => plot.setSize({ width: host.clientWidth, height: HEIGHT }));
    ro.observe(host);
    return () => {
      ro.disconnect();
      plot.destroy();
      plotRef.current = null;
    };
  }, [title, sig]);

  useEffect(() => {
    plotRef.current?.setData(buildData());
  });

  return <div className="chart" ref={hostRef} />;
}
