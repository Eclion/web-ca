import { useCallback, useEffect, useRef } from 'react';
import { projectToRGBA } from '../render/project.ts';
import { useSimStore } from '../store/simStore.ts';

interface View {
  scale: number;
  tx: number;
  ty: number;
}

/**
 * 2D dish viewport. Projects the current grid frame to RGBA, blits it onto an
 * offscreen buffer at 1 device-pixel per cell, then draws it scaled with
 * nearest-neighbor (crisp cells) under a pan/zoom transform (PRD §4.1, §5.5).
 */
export function DishCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef<HTMLCanvasElement | null>(null);
  const rgbaRef = useRef<Uint8ClampedArray | null>(null);
  const viewRef = useRef<View>({ scale: 1, tx: 0, ty: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const dims = useSimStore((s) => s.dims);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { clientWidth, clientHeight } = canvas;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== clientWidth * dpr || canvas.height !== clientHeight * dpr) {
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { dims: d, frames, viewStep } = useSimStore.getState();
    const buffer = bufferRef.current;
    if (!d || !buffer) return;
    const grid = frames[viewStep];
    if (!grid) return;

    const rgba = projectToRGBA(grid, d.width, d.height, d.depth, rgbaRef.current ?? undefined);
    rgbaRef.current = rgba;
    const bctx = buffer.getContext('2d');
    if (!bctx) return;
    const img = bctx.createImageData(d.width, d.height);
    img.data.set(rgba);
    bctx.putImageData(img, 0, 0);

    const { scale, tx, ty } = viewRef.current;
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, tx * dpr, ty * dpr);
    ctx.drawImage(buffer, 0, 0);
  }, []);

  // (Re)create the offscreen buffer and fit the dish to the viewport on resize.
  useEffect(() => {
    if (!dims) return;
    const buffer = document.createElement('canvas');
    buffer.width = dims.width;
    buffer.height = dims.height;
    bufferRef.current = buffer;
    rgbaRef.current = null;

    const canvas = canvasRef.current;
    if (canvas) {
      const fit =
        Math.min(canvas.clientWidth / dims.width, canvas.clientHeight / dims.height) * 0.95;
      viewRef.current = {
        scale: fit,
        tx: (canvas.clientWidth - dims.width * fit) / 2,
        ty: (canvas.clientHeight - dims.height * fit) / 2,
      };
    }
    draw();
  }, [dims, draw]);

  // Redraw whenever the viewed frame changes.
  useEffect(() => {
    const unsub = useSimStore.subscribe(draw);
    return unsub;
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const v = viewRef.current;
      const factor = Math.exp(-e.deltaY * 0.0015);
      const scale = Math.max(0.1, Math.min(64, v.scale * factor));
      // Keep the point under the cursor fixed while zooming.
      viewRef.current = {
        scale,
        tx: px - (px - v.tx) * (scale / v.scale),
        ty: py - (py - v.ty) * (scale / v.scale),
      };
      draw();
    },
    [draw],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const v = viewRef.current;
      viewRef.current = { ...v, tx: v.tx + (e.clientX - drag.x), ty: v.ty + (e.clientY - drag.y) };
      dragRef.current = { x: e.clientX, y: e.clientY };
      draw();
    },
    [draw],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="dish-canvas"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}
