/** Point on a circle, where angle 0 is 12 o'clock and angles run clockwise. */
export function polar(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle) };
}

/**
 * SVG path for the remaining-time wedge (1 = full disk, 0 = nothing). The
 * wedge ends at 12 o'clock and extends counterclockwise from it, so as time
 * runs out its free edge sweeps clockwise back to 12, like a physical
 * visual timer.
 */
export function wedgePath(cx: number, cy: number, r: number, fraction: number): string {
  const f = Math.min(1, Math.max(0, fraction));
  if (f <= 0) return '';
  if (f >= 0.99999) {
    // An arc can't start and end at the same point, so draw two half circles.
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
  }
  return sectorPath(cx, cy, r, (1 - f) * 2 * Math.PI, 2 * Math.PI);
}

/** SVG path for a pie slice from angle `from` to `to` (radians, clockwise from 12). */
export function sectorPath(cx: number, cy: number, r: number, from: number, to: number): string {
  const a = polar(cx, cy, r, from);
  const b = polar(cx, cy, r, to);
  const largeArc = to - from > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${round(a.x)} ${round(a.y)} A ${r} ${r} 0 ${largeArc} 1 ${round(b.x)} ${round(b.y)} Z`;
}

function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

/**
 * SVG path for the remaining-time wedge clipped to the band between `inner`
 * and `outer`, so several colors can count down together as concentric rings.
 */
export function ringPath(cx: number, cy: number, inner: number, outer: number, fraction: number): string {
  const f = Math.min(1, Math.max(0, fraction));
  if (inner <= 0) return wedgePath(cx, cy, outer, f);
  if (f <= 0) return '';
  if (f >= 0.99999) {
    // The inner circle runs the other way so it punches a hole in the outer one.
    return (
      `M ${cx} ${cy - outer} A ${outer} ${outer} 0 1 1 ${cx} ${cy + outer} A ${outer} ${outer} 0 1 1 ${cx} ${cy - outer} Z ` +
      `M ${cx} ${cy - inner} A ${inner} ${inner} 0 1 0 ${cx} ${cy + inner} A ${inner} ${inner} 0 1 0 ${cx} ${cy - inner} Z`
    );
  }
  const from = (1 - f) * 2 * Math.PI;
  const largeArc = f > 0.5 ? 1 : 0;
  const a = polar(cx, cy, outer, from);
  const d = polar(cx, cy, inner, from);
  return (
    `M ${round(a.x)} ${round(a.y)} A ${outer} ${outer} 0 ${largeArc} 1 ${cx} ${cy - outer} ` +
    `L ${cx} ${cy - inner} A ${inner} ${inner} 0 ${largeArc} 0 ${round(d.x)} ${round(d.y)} Z`
  );
}

/**
 * Splits a disk of `radius` into `count` equal-width rings separated by `gap`,
 * outermost first. The innermost ring reaches the center.
 */
export function ringBands(radius: number, count: number, gap: number): { inner: number; outer: number }[] {
  const n = Math.max(1, count);
  const width = (radius - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => {
    const outer = radius - i * (width + gap);
    return { inner: i === n - 1 ? 0 : outer - width, outer };
  });
}
