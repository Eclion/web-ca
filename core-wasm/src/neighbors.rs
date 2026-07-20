//! Separable neighbor convolution — the algorithmic win from PRD §5.2, §5.3.
//!
//! The inclusive 3×3×3 clamped live-cell count `L(x,y,z)` is computed with three
//! 1-D box passes (over x, then y, then z), each clamped at the borders (no
//! wraparound — identical to `calculateNeighbors.m`). The `_region` variants
//! restrict the *output* to an inclusive `[x0,x1] × [y0,y1]` rectangle (full z),
//! so a run only touches the colony's bounding box plus a margin instead of the
//! whole dish (PRD §5.3). Because each pass reads the real `cur`/prior-pass
//! buffers with normal clamping, a region result is bit-identical to the full
//! computation for every cell inside the rectangle.
//!
//! Buffers are preallocated by the caller and reused every step.

/// Layer-major flat index: `x + y*width + z*width*height`.
#[inline]
pub fn index(x: usize, y: usize, z: usize, width: usize, height: usize) -> usize {
    x + y * width + z * width * height
}

/// Inclusive 3×3×3 clamped live count for every cell — whole grid.
/// Test-only convenience wrapper; the engine always runs the `_region` variant.
#[cfg(test)]
pub fn compute_live_counts(
    cur: &[u8],
    width: usize,
    height: usize,
    depth: usize,
    row_x: &mut [u16],
    col_y: &mut [u16],
    l: &mut [u16],
) {
    compute_live_counts_region(
        cur,
        width,
        height,
        depth,
        0,
        width - 1,
        0,
        height - 1,
        row_x,
        col_y,
        l,
    );
}

/// Inclusive 3×3×3 clamped live count for cells in `[x0,x1] × [y0,y1]` (all z).
#[allow(clippy::too_many_arguments)]
pub fn compute_live_counts_region(
    cur: &[u8],
    width: usize,
    height: usize,
    depth: usize,
    x0: usize,
    x1: usize,
    y0: usize,
    y1: usize,
    row_x: &mut [u16],
    col_y: &mut [u16],
    l: &mut [u16],
) {
    let wh = width * height;
    // Pass 1 (x) must cover y0-1..=y1+1 so pass 2 can read row_x[y±1].
    let ylo = y0.saturating_sub(1);
    let yhi = (y1 + 1).min(height - 1);

    for z in 0..depth {
        for y in ylo..=yhi {
            let base = y * width + z * wh;
            for x in x0..=x1 {
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

    for z in 0..depth {
        for x in x0..=x1 {
            for y in y0..=y1 {
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

    for y in y0..=y1 {
        for x in x0..=x1 {
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

/// 2-D separable 3×3 clamped box sum over the rectangle `[x0,x1] × [y0,y1]`.
#[allow(clippy::too_many_arguments)]
fn box_2d_region(
    flat: &[u16],
    width: usize,
    height: usize,
    x0: usize,
    x1: usize,
    y0: usize,
    y1: usize,
    scratch: &mut [u16],
    out: &mut [u16],
) {
    let ylo = y0.saturating_sub(1);
    let yhi = (y1 + 1).min(height - 1);
    for y in ylo..=yhi {
        let base = y * width;
        for x in x0..=x1 {
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
    for x in x0..=x1 {
        for y in y0..=y1 {
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

/// Full-height column E/M totals for the born-type tie-break — whole grid.
/// Test-only convenience wrapper; the engine always runs the `_region` variant.
#[cfg(test)]
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
    compute_column_counts_region(
        cur,
        width,
        height,
        depth,
        0,
        width - 1,
        0,
        height - 1,
        e_flat,
        m_flat,
        scratch,
        col_e,
        col_m,
    );
}

/// Full-height column E/M totals for cells in `[x0,x1] × [y0,y1]` (PRD §3.2).
#[allow(clippy::too_many_arguments)]
pub fn compute_column_counts_region(
    cur: &[u8],
    width: usize,
    height: usize,
    depth: usize,
    x0: usize,
    x1: usize,
    y0: usize,
    y1: usize,
    e_flat: &mut [u16],
    m_flat: &mut [u16],
    scratch: &mut [u16],
    col_e: &mut [u16],
    col_m: &mut [u16],
) {
    let wh = width * height;
    // The 2-D box reads flat[x±1]; fill the flattened planes one cell wider.
    let fx0 = x0.saturating_sub(1);
    let fx1 = (x1 + 1).min(width - 1);
    let fy0 = y0.saturating_sub(1);
    let fy1 = (y1 + 1).min(height - 1);
    for y in fy0..=fy1 {
        for x in fx0..=fx1 {
            let plane = x + y * width;
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
    }
    box_2d_region(e_flat, width, height, x0, x1, y0, y1, scratch, col_e);
    box_2d_region(m_flat, width, height, x0, x1, y0, y1, scratch, col_m);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rng::Pcg32;

    fn random_grid(w: usize, h: usize, d: usize, seed: u64) -> Vec<u8> {
        let mut rng = Pcg32::with_seed(seed);
        let mut cur = vec![0u8; w * h * d];
        for c in cur.iter_mut() {
            *c = rng.next_bounded(3) as u8;
        }
        cur
    }

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

    fn brute_column(cur: &[u8], x: usize, y: usize, v: u8, w: usize, h: usize, d: usize) -> u16 {
        let mut n = 0u16;
        for xi in x.saturating_sub(1)..=(x + 1).min(w - 1) {
            for yi in y.saturating_sub(1)..=(y + 1).min(h - 1) {
                for zi in 0..d {
                    if cur[index(xi, yi, zi, w, h)] == v {
                        n += 1;
                    }
                }
            }
        }
        n
    }

    #[test]
    fn separable_equals_brute_force() {
        let (w, h, d) = (9, 7, 3);
        let cur = random_grid(w, h, d, 20260720);
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

    #[test]
    fn column_counts_equal_brute_force() {
        let (w, h, d) = (9, 7, 3);
        let cur = random_grid(w, h, d, 555);
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
    fn region_matches_full_inside_the_rectangle() {
        let (w, h, d) = (12, 10, 4);
        let cur = random_grid(w, h, d, 42);

        let mut rf = vec![0u16; w * h * d];
        let mut cf = vec![0u16; w * h * d];
        let mut lf = vec![0u16; w * h * d];
        compute_live_counts(&cur, w, h, d, &mut rf, &mut cf, &mut lf);

        let mut rr = vec![0u16; w * h * d];
        let mut cr = vec![0u16; w * h * d];
        let mut lr = vec![0u16; w * h * d];
        let (x0, x1, y0, y1) = (3, 8, 2, 7);
        compute_live_counts_region(&cur, w, h, d, x0, x1, y0, y1, &mut rr, &mut cr, &mut lr);
        for z in 0..d {
            for y in y0..=y1 {
                for x in x0..=x1 {
                    assert_eq!(lr[index(x, y, z, w, h)], lf[index(x, y, z, w, h)]);
                }
            }
        }

        // Column planes too.
        let mut ef = vec![0u16; w * h];
        let mut mf = vec![0u16; w * h];
        let mut sf = vec![0u16; w * h];
        let mut cef = vec![0u16; w * h];
        let mut cmf = vec![0u16; w * h];
        compute_column_counts(&cur, w, h, d, &mut ef, &mut mf, &mut sf, &mut cef, &mut cmf);

        let mut er = vec![0u16; w * h];
        let mut mr = vec![0u16; w * h];
        let mut sr = vec![0u16; w * h];
        let mut cer = vec![0u16; w * h];
        let mut cmr = vec![0u16; w * h];
        compute_column_counts_region(
            &cur, w, h, d, x0, x1, y0, y1, &mut er, &mut mr, &mut sr, &mut cer, &mut cmr,
        );
        for y in y0..=y1 {
            for x in x0..=x1 {
                assert_eq!(cer[x + y * w], cef[x + y * w]);
                assert_eq!(cmr[x + y * w], cmf[x + y * w]);
            }
        }
    }
}
