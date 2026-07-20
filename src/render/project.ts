/**
 * Flatten the 3D grid to a 2D top-down RGBA image (PRD §5.5).
 *
 * Faithful to `cellsToRGB` in `simulateCancer.m`: layers are scanned bottom→top
 * and each occupied cell overwrites the pixel, so the **topmost occupied layer**
 * determines the colour. Empty stays black.
 *
 * Colours: M (1) → red, E (2) → green, empty (0) → black (opaque).
 */
export function projectToRGBA(
  grid: Uint8Array,
  width: number,
  height: number,
  depth: number,
  out?: Uint8ClampedArray,
): Uint8ClampedArray {
  const rgba = out ?? new Uint8ClampedArray(width * height * 4);
  const wh = width * height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const plane = x + y * width;
      let v = 0;
      for (let z = 0; z < depth; z++) {
        const c = grid[plane + z * wh];
        if (c !== 0) v = c; // last (topmost) occupied layer wins
      }
      const o = plane * 4;
      rgba[o] = v === 1 ? 255 : 0; // R
      rgba[o + 1] = v === 2 ? 255 : 0; // G
      rgba[o + 2] = 0; // B
      rgba[o + 3] = 255; // A (opaque black background)
    }
  }
  return rgba;
}
