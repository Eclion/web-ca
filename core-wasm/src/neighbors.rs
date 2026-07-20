//! Separable neighbor convolution — the algorithmic win from PRD §5.2.
//!
//! Instead of recomputing a 3×3×3 sum per cell each step, we compute the
//! inclusive live-cell count `L(x,y,z)` for the whole grid with three 1-D box
//! passes (over x, then y, then z). Each pass clamps at the borders, so the
//! effective neighborhood is the *truncated* Moore window at edges — identical
//! to `calculateNeighbors.m`'s clamping (no wraparound).
//!
//! The result equals a brute-force 3×3×3 inclusive count exactly (integer sums,
//! no rounding). For Model A — where every live cell is epithelial — this live
//! count is exactly the E-neighbor count the oracle uses.
//!
//! Buffers (`row_x`, `col_y`, `l`) are preallocated by the caller and reused
//! every step; nothing is allocated inside the hot loop.

/// Layer-major flat index: `x + y*width + z*width*height`.
#[inline]
pub fn index(x: usize, y: usize, z: usize, width: usize, height: usize) -> usize {
    x + y * width + z * width * height
}

/// Compute the inclusive 3×3×3 clamped live-cell count for every cell of `cur`
/// into `l`, using `row_x` and `col_y` as scratch. All four slices have length
/// `width*height*depth`. A cell is "live" iff its value is non-zero.
pub fn compute_live_counts(
    cur: &[u8],
    width: usize,
    height: usize,
    depth: usize,
    row_x: &mut [u16],
    col_y: &mut [u16],
    l: &mut [u16],
) {
    let wh = width * height;

    // Pass 1 — horizontal (x-1..x+1), per (y, z) row.
    for z in 0..depth {
        for y in 0..height {
            let base = y * width + z * wh;
            for x in 0..width {
                let mut s = u16::from(cur[base + x] != 0);
                if x > 0 {
                    s += u16::from(cur[base + x - 1] != 0);
                }
                if x + 1 < width {
                    s += u16::from(cur[base + x + 1] != 0);
                }
                row_x[base + x] = s;
            }
        }
    }

    // Pass 2 — vertical (y-1..y+1), giving the in-plane 3×3 sum per layer.
    for z in 0..depth {
        for x in 0..width {
            for y in 0..height {
                let idx = x + y * width + z * wh;
                let mut s = row_x[idx];
                if y > 0 {
                    s += row_x[idx - width];
                }
                if y + 1 < height {
                    s += row_x[idx + width];
                }
                col_y[idx] = s;
            }
        }
    }

    // Pass 3 — depth (z-1..z+1), giving the full 3×3×3 sum.
    for y in 0..height {
        for x in 0..width {
            for z in 0..depth {
                let idx = x + y * width + z * wh;
                let mut s = col_y[idx];
                if z > 0 {
                    s += col_y[idx - wh];
                }
                if z + 1 < depth {
                    s += col_y[idx + wh];
                }
                l[idx] = s;
            }
        }
    }
}

/// 2-D separable 3×3 clamped box sum of `flat` (a `width*height` plane) into
/// `out`, using `scratch` for the intermediate horizontal pass.
fn box_2d(flat: &[u16], width: usize, height: usize, scratch: &mut [u16], out: &mut [u16]) {
    // Horizontal pass (x-1..x+1).
    for y in 0..height {
        let base = y * width;
        for x in 0..width {
            let mut s = flat[base + x];
            if x > 0 {
                s += flat[base + x - 1];
            }
            if x + 1 < width {
                s += flat[base + x + 1];
            }
            scratch[base + x] = s;
        }
    }
    // Vertical pass (y-1..y+1).
    for x in 0..width {
        for y in 0..height {
            let idx = x + y * width;
            let mut s = scratch[idx];
            if y > 0 {
                s += scratch[idx - width];
            }
            if y + 1 < height {
                s += scratch[idx + width];
            }
            out[idx] = s;
        }
    }
}

/// Compute the **full-height column** E and M totals used by the born-cell type
/// tie-break in Models B and C (PRD §3.2): for each in-plane position `(x,y)`,
/// the number of E (resp. M) cells in the clamped 3×3 window summed over *all*
/// z-layers.
///
/// Done in two stages (PRD §5.2): collapse E/M occupancy across z into 2-D
/// planes `e_flat`/`m_flat`, then a 2-D separable 3×3 box over each. `scratch`,
/// `e_flat`, `m_flat`, `col_e`, `col_m` are all `width*height` and reused.
#[allow(clippy::too_many_arguments)]
pub fn compute_column_counts(
    cur: &[u8],
    width: usize,
    height: usize,
    depth: usize,
    e_flat: &mut [u16],
    m_flat: &mut [u16],
    scratch: &mut [u16],
    col_e: &mut [u16],
    col_m: &mut [u16],
) {
    let wh = width * height;
    for plane in 0..wh {
        let mut e = 0u16;
        let mut m = 0u16;
        for z in 0..depth {
            match cur[plane + z * wh] {
                1 => m += 1,
                2 => e += 1,
                _ => {}
            }
        }
        e_flat[plane] = e;
        m_flat[plane] = m;
    }
    box_2d(e_flat, width, height, scratch, col_e);
    box_2d(m_flat, width, height, scratch, col_m);
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Independent brute-force inclusive 3×3×3 clamped live count.
    fn brute(cur: &[u8], x: usize, y: usize, z: usize, w: usize, h: usize, d: usize) -> u16 {
        let mut n = 0u16;
        for xi in x.saturating_sub(1)..=(x + 1).min(w - 1) {
            for yi in y.saturating_sub(1)..=(y + 1).min(h - 1) {
                for zi in z.saturating_sub(1)..=(z + 1).min(d - 1) {
                    if cur[index(xi, yi, zi, w, h)] != 0 {
                        n += 1;
                    }
                }
            }
        }
        n
    }

    /// Brute-force full-column count of `value` in the clamped 3×3 in-plane
    /// window at `(x,y)`, summed over all z.
    fn brute_column(
        cur: &[u8],
        x: usize,
        y: usize,
        value: u8,
        w: usize,
        h: usize,
        d: usize,
    ) -> u16 {
        let mut n = 0u16;
        for xi in x.saturating_sub(1)..=(x + 1).min(w - 1) {
            for yi in y.saturating_sub(1)..=(y + 1).min(h - 1) {
                for zi in 0..d {
                    if cur[index(xi, yi, zi, w, h)] == value {
                        n += 1;
                    }
                }
            }
        }
        n
    }

    #[test]
    fn column_counts_equal_brute_force() {
        use crate::rng::Pcg32;
        let (w, h, d) = (9usize, 7usize, 3usize);
        let mut rng = Pcg32::with_seed(555);
        let mut cur = vec![0u8; w * h * d];
        for c in cur.iter_mut() {
            *c = rng.next_bounded(3) as u8;
        }
        let mut e_flat = vec![0u16; w * h];
        let mut m_flat = vec![0u16; w * h];
        let mut scratch = vec![0u16; w * h];
        let mut col_e = vec![0u16; w * h];
        let mut col_m = vec![0u16; w * h];
        compute_column_counts(
            &cur,
            w,
            h,
            d,
            &mut e_flat,
            &mut m_flat,
            &mut scratch,
            &mut col_e,
            &mut col_m,
        );
        for y in 0..h {
            for x in 0..w {
                assert_eq!(col_e[x + y * w], brute_column(&cur, x, y, 2, w, h, d));
                assert_eq!(col_m[x + y * w], brute_column(&cur, x, y, 1, w, h, d));
            }
        }
    }

    #[test]
    fn separable_equals_brute_force_on_random_grids() {
        use crate::rng::Pcg32;
        let (w, h, d) = (9usize, 7usize, 3usize);
        let mut rng = Pcg32::with_seed(20260720);
        let mut cur = vec![0u8; w * h * d];
        for c in cur.iter_mut() {
            *c = rng.next_bounded(3) as u8;
        }

        let mut row_x = vec![0u16; w * h * d];
        let mut col_y = vec![0u16; w * h * d];
        let mut l = vec![0u16; w * h * d];
        compute_live_counts(&cur, w, h, d, &mut row_x, &mut col_y, &mut l);

        for z in 0..d {
            for y in 0..h {
                for x in 0..w {
                    assert_eq!(l[index(x, y, z, w, h)], brute(&cur, x, y, z, w, h, d));
                }
            }
        }
    }
}
