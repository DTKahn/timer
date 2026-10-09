/**
 * Outlines for the construction-paper look: pieces cut with scissors (short
 * straight facets) or torn by hand (a ragged edge with a pale fiber fringe).
 * Everything is seeded, so a piece keeps the same edge on every render.
 */

export type Point = { x: number; y: number };

/** Small, fast PRNG; the same seed always gives the same sequence. */
export function seeded(seed: string | number): () => number {
  let h = typeof seed === 'number' ? seed >>> 0 : hash(seed);
  return () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Closed SVG path through the points, with coordinates rounded to keep strings short. */
export function polygonPath(points: Point[]): string {
  if (points.length === 0) return '';
  const r = (n: number) => Math.round(n * 10) / 10;
  return `M${points.map((p) => `${r(p.x)} ${r(p.y)}`).join('L')}Z`;
}

/**
 * Walks the edge of a w×h rounded rectangle. `at(s)` gives the point `s` along
 * the edge (clockwise from the end of the top-left corner) and its outward normal.
 */
function roundedRect(w: number, h: number, radius: number) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const sx = w - 2 * r;
  const sy = h - 2 * r;
  const arc = (Math.PI / 2) * r;
  const length = 2 * sx + 2 * sy + 4 * arc;
  // Straight run, then corner, four times: top, top-right, right, bottom-right, ...
  const runs = [sx, arc, sy, arc, sx, arc, sy, arc];

  function at(s: number): { x: number; y: number; nx: number; ny: number; corner: boolean } {
    let d = ((s % length) + length) % length;
    let i = 0;
    while (i < runs.length - 1 && d > runs[i]) {
      d -= runs[i];
      i++;
    }
    const side = i >> 1;
    if (i % 2 === 0) {
      // Straight sides: top, right, bottom, left.
      const t = d;
      if (side === 0) return { x: r + t, y: 0, nx: 0, ny: -1, corner: false };
      if (side === 1) return { x: w, y: r + t, nx: 1, ny: 0, corner: false };
      if (side === 2) return { x: w - r - t, y: h, nx: 0, ny: 1, corner: false };
      return { x: 0, y: h - r - t, nx: -1, ny: 0, corner: false };
    }
    // Corners: top-right, bottom-right, bottom-left, top-left; angle measured from straight up.
    const a = (side * Math.PI) / 2 + (r > 0 ? d / r : 0);
    const centers = [
      [w - r, r],
      [w - r, h - r],
      [r, h - r],
      [r, r],
    ];
    const [cx, cy] = centers[side];
    const nx = Math.sin(a);
    const ny = -Math.cos(a);
    return { x: cx + nx * r, y: cy + ny * r, nx, ny, corner: true };
  }

  return { at, length, radius: r, runs };
}

function rotate(points: Point[], w: number, h: number, degrees: number): Point[] {
  if (!degrees) return points;
  const a = (degrees * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const cx = w / 2;
  const cy = h / 2;
  return points.map(({ x, y }) => ({
    x: cx + (x - cx) * cos - (y - cy) * sin,
    y: cy + (x - cx) * sin + (y - cy) * cos,
  }));
}

export type OutlineOptions = {
  /** Corner radius; half the height makes a pill, half of a square makes a circle. */
  radius: number;
  seed: string;
  /** Rotation in degrees around the center; keep it tiny. */
  tilt?: number;
};

/**
 * Scissor cut: the rounded rectangle traced with short straight cuts. Curves
 * get short facets, straight sides long ones, and each cut lands a hair off
 * the line.
 */
export function cutOutline(w: number, h: number, { radius, seed, tilt = 0 }: OutlineOptions): Point[] {
  const shape = roundedRect(w, h, radius);
  const rand = seeded(seed);
  // About 9pt facets on a 40pt circle, up to 16pt on big ones.
  const facet = Math.min(16, Math.max(6, Math.sqrt(shape.length) * 0.8));
  const wobble = Math.min(0.9, Math.max(0.35, shape.length * 0.0025));
  const points: Point[] = [];
  const add = (s: number, scale = 1) => {
    const p = shape.at(s);
    const off = ((rand() * 2 - 1) * wobble - wobble * 0.3) * scale;
    points.push({ x: p.x + p.nx * off, y: p.y + p.ny * off });
  };
  // Each run is a straight side or a corner; every run starts with a cut at its first point.
  let s = 0;
  for (const run of shape.runs) {
    if (run <= 0.01) continue;
    const corner = shape.at(s + run / 2).corner;
    // Curves get short facets; a straight side is cut in a few long strokes rather than many nibbles.
    const n = corner ? Math.max(2, Math.round(run / facet)) : Math.max(1, Math.round(run / (facet * 4)));
    for (let j = 0; j < n; j++) {
      const jitter = j === 0 ? 0 : (rand() - 0.5) * 0.5;
      add(s + ((j + jitter) / n) * run, corner ? 1 : 0.6);
    }
    s += run;
  }
  return rotate(points, w, h, tilt);
}

/** Smooth periodic noise along a loop of `length`, in [-1, 1]. */
function loopNoise(rand: () => number, length: number, spacing: number) {
  const n = Math.max(3, Math.round(length / spacing));
  const knots = Array.from({ length: n }, () => rand() * 2 - 1);
  return (s: number) => {
    const t = ((((s / length) * n) % n) + n) % n;
    const i = Math.floor(t);
    const f = t - i;
    const e = (1 - Math.cos(f * Math.PI)) / 2;
    return knots[i] * (1 - e) + knots[(i + 1) % n] * e;
  };
}

/**
 * Hand torn: a ragged edge that wanders a little, plus the pale fringe of
 * exposed fibers just outside it. Both sit within about 3pt of the box.
 */
export function tornOutline(
  w: number,
  h: number,
  { radius, seed, tilt = 0 }: OutlineOptions,
): { edge: Point[]; fringe: Point[] } {
  const shape = roundedRect(w, h, radius);
  const rand = seeded(seed);
  const drift = loopNoise(rand, shape.length, 38);
  const ripple = loopNoise(rand, shape.length, 7);
  const fringeWidth = loopNoise(rand, shape.length, 9);
  const edge: Point[] = [];
  const fringe: Point[] = [];
  const step = 2.2;
  for (let s = 0; s < shape.length; s += step * (0.75 + rand() * 0.5)) {
    const p = shape.at(s);
    // Mostly inward so the torn edge stays inside the box.
    const off = -2 + drift(s) * 1.5 + ripple(s) * 0.7 + (rand() - 0.5) * 0.9;
    edge.push({ x: p.x + p.nx * off, y: p.y + p.ny * off });
    // Fibers stick out past the color by 0.5–3.5pt, with the odd longer wisp.
    const wisp = rand() < 0.08 ? rand() * 1.8 : 0;
    const out = off + 0.5 + (fringeWidth(s) + 1) * 1.2 + rand() * 0.8 + wisp;
    fringe.push({ x: p.x + p.nx * out, y: p.y + p.ny * out });
  }
  return { edge: rotate(edge, w, h, tilt), fringe: rotate(fringe, w, h, tilt) };
}

/** A tilt in degrees for a piece, seeded, smaller for wider pieces so their edges barely move. */
export function seededTilt(seed: string, w: number, max = 1.2): number {
  const rand = seeded(`${seed}:tilt`);
  const limit = Math.min(max, 24 / Math.max(w, 1));
  return (rand() * 2 - 1) * limit;
}

/** Facet corners of a scissor-cut disk, as (angle, radius scale) pairs from 12 o'clock clockwise. */
export type Facets = { angle: number; scale: number }[];

/**
 * Corners for a hand-cut circle of radius `r`. The first corner sits exactly
 * at 12 o'clock so a wedge that ends there has a clean straight edge.
 */
export function circleFacets(r: number, seed: string): Facets {
  const rand = seeded(seed);
  const count = Math.max(12, Math.round((2 * Math.PI * r) / Math.min(22, Math.max(8, Math.sqrt(r) * 2.2))));
  const wobble = Math.min(0.006, 1.2 / Math.max(r, 1));
  return Array.from({ length: count }, (_, i) => ({
    angle: i === 0 ? 0 : ((i + (rand() - 0.5) * 0.5) / count) * 2 * Math.PI,
    scale: 1 + (rand() * 2 - 1) * wobble,
  }));
}

function facetPoint(cx: number, cy: number, r: number, f: { angle: number; scale: number }): Point {
  return { x: cx + r * f.scale * Math.sin(f.angle), y: cy - r * f.scale * Math.cos(f.angle) };
}

/** Point on the faceted circle's edge at `angle`, between the two corners around it. */
function facetEdgeAt(cx: number, cy: number, r: number, facets: Facets, angle: number): Point {
  const n = facets.length;
  let i = n - 1;
  for (let k = 0; k < n; k++) {
    if (facets[k].angle > angle) {
      i = k - 1;
      break;
    }
  }
  const a = facets[i];
  const b = i + 1 < n ? facets[i + 1] : { angle: 2 * Math.PI, scale: facets[0].scale };
  const pa = facetPoint(cx, cy, r, a);
  const pb = facetPoint(cx, cy, r, b);
  // Intersect the ray from the center at `angle` with the straight cut from a to b.
  const dx = Math.sin(angle);
  const dy = -Math.cos(angle);
  const ex = pb.x - pa.x;
  const ey = pb.y - pa.y;
  const denom = dx * ey - dy * ex;
  if (Math.abs(denom) < 1e-9) return pa;
  const t = ((pa.x - cx) * ey - (pa.y - cy) * ex) / denom;
  return { x: cx + dx * t, y: cy + dy * t };
}

/** The whole faceted circle. */
export function facetedCircle(cx: number, cy: number, r: number, facets: Facets): Point[] {
  return facets.map((f) => facetPoint(cx, cy, r, f));
}

/** Corners of the faceted circle from `from` (radians) clockwise to 12 o'clock. */
function facetedArc(cx: number, cy: number, r: number, facets: Facets, from: number): Point[] {
  const points = [facetEdgeAt(cx, cy, r, facets, from)];
  for (const f of facets) if (f.angle > from) points.push(facetPoint(cx, cy, r, f));
  points.push(facetPoint(cx, cy, r, { angle: 2 * Math.PI, scale: facets[0].scale }));
  return points;
}

/**
 * The remaining-time wedge (or one ring of it) cut from faceted circles, so
 * the arc edge has fixed scissor cuts that don't shimmer as it sweeps.
 * `fraction` 1 is the full disk; the wedge ends at 12 o'clock like `ringPath`.
 */
export function facetedRingPath(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  fraction: number,
  outerFacets: Facets,
  innerFacets: Facets,
): string {
  const f = Math.min(1, Math.max(0, fraction));
  if (f <= 0) return '';
  if (f >= 0.99999) {
    const ring = polygonPath(facetedCircle(cx, cy, outer, outerFacets));
    return inner > 0 ? `${ring}${polygonPath(facetedCircle(cx, cy, inner, innerFacets).reverse())}` : ring;
  }
  const from = (1 - f) * 2 * Math.PI;
  const outside = facetedArc(cx, cy, outer, outerFacets, from);
  const inside = inner > 0 ? facetedArc(cx, cy, inner, innerFacets, from).reverse() : [{ x: cx, y: cy }];
  return polygonPath([...outside, ...inside]);
}
