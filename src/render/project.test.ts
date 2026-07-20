import { describe, expect, it } from 'vitest';
import { projectToRGBA } from './project.ts';

describe('projectToRGBA', () => {
  it('colors M red and E green, empty black', () => {
    // 2×1×1 grid: M at (0,0), E at (1,0).
    const grid = new Uint8Array([1, 2]);
    const rgba = projectToRGBA(grid, 2, 1, 1);
    expect(Array.from(rgba.slice(0, 4))).toEqual([255, 0, 0, 255]); // M → red
    expect(Array.from(rgba.slice(4, 8))).toEqual([0, 255, 0, 255]); // E → green
  });

  it('projects the topmost occupied layer (last write wins)', () => {
    // 1×1×3 column: layer0 E, layer1 empty, layer2 M → topmost occupied is M.
    const grid = new Uint8Array([2, 0, 1]);
    const rgba = projectToRGBA(grid, 1, 1, 3);
    expect(Array.from(rgba.slice(0, 4))).toEqual([255, 0, 0, 255]); // red (M on top)
  });

  it('leaves empty columns black', () => {
    const grid = new Uint8Array([0, 0]);
    const rgba = projectToRGBA(grid, 1, 1, 2);
    expect(Array.from(rgba.slice(0, 4))).toEqual([0, 0, 0, 255]);
  });

  it('reuses a provided output buffer', () => {
    const out = new Uint8ClampedArray(4);
    const rgba = projectToRGBA(new Uint8Array([2]), 1, 1, 1, out);
    expect(rgba).toBe(out);
    expect(Array.from(out)).toEqual([0, 255, 0, 255]);
  });
});
