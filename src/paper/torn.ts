/**
 * The fibers along a torn edge. Tearing construction paper exposes its fibers,
 * so nothing at the edge is a solid shape: there's a dense mat of short strands
 * in the sheet's own colors, thickest against the color and thinning outward,
 * strands that cross the color's edge both ways, and the odd loose wisp.
 * Everything is seeded, so a sheet keeps the same fibers on every render.
 */
import { seeded, type Point } from '@/paper/outline';

export type TornFibers = {
  /** The mat, faint to strong; drawn under the sheet in its color, lighter shade and lightest shade. */
  mat: [string, string, string];
  /** Sheet-colored strands reaching out of the color; drawn over the sheet. */
  colored: string;
  /** Strands lying across the color's edge, in the lighter shade; drawn over the sheet. */
  crossing: string;
  /** Loose wisps just past the mat, in the lighter shade. */
  wisps: string;
};

/** Strands per point of edge at density 1: the mat, colored strands, crossing strands. */
const PER_POINT = { mat: 17, colored: 3, crossing: 2.5 };
/** How wide the band of exposed fibers can get, in points. */
const MAX_BAND = 3.2;

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Fibers for a torn sheet from its outline (`edge`) and the matching points
 * just outside it (`fringe`), as from tornOutline. `density` scales the number
 * of strands (1 is the full look; lower draws faster).
 */
export function tornFibers(edge: Point[], fringe: Point[], seed: string, density = 1): TornFibers {
  const rand = seeded(`${seed}:fibers`);
  const n = edge.length;

  // A slow swell in band width, where the tear ran at an angle through the sheet.
  const arc = [0];
  for (let i = 1; i <= n; i++) {
    arc.push(arc[i - 1] + Math.hypot(edge[i % n].x - edge[i - 1].x, edge[i % n].y - edge[i - 1].y));
  }
  const total = arc[n] || 1;
  const waves = [1, 2, 3].map((k) => ({ k: k + Math.floor(rand() * 3), ph: rand() * 2 * Math.PI, a: rand() }));
  const swell = (s: number) => {
    const v = waves.reduce((acc, w) => acc + w.a * Math.sin((s / total) * 2 * Math.PI * w.k * 3 + w.ph), 0) / 1.5;
    return 0.75 + 0.9 * Math.max(0, v - 0.2);
  };

  const frame = edge.map((p, i) => {
    const dx = fringe[i].x - p.x;
    const dy = fringe[i].y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x, y: p.y, nx: dx / len, ny: dy / len, width: Math.min(MAX_BAND, len * swell(arc[i])) };
  });

  const mat: [string[], string[], string[]] = [[], [], []];
  const colored: string[] = [];
  const crossing: string[] = [];
  const wisps: string[] = [];
  const turn = (nx: number, ny: number, a: number) => [nx * Math.cos(a) - ny * Math.sin(a), nx * Math.sin(a) + ny * Math.cos(a)];
  // Mostly any angle, with about a third lying along the tear.
  const angle = () => (rand() < 0.35 ? (rand() < 0.5 ? -1 : 1) * (1.1 + rand() * 0.5) : (rand() - 0.5) * 2.2);
  type At = { x: number; y: number; nx: number; ny: number; width: number };
  const strand = (p: At, depth: number, a: number, len: number) => {
    const [nx, ny] = turn(p.nx, p.ny, a);
    const cx = p.x + p.nx * depth;
    const cy = p.y + p.ny * depth;
    return `M${r1(cx - (nx * len) / 2)} ${r1(cy - (ny * len) / 2)}l${r1(nx * len)} ${r1(ny * len)}`;
  };
  const count = (perPoint: number, length: number) => {
    const exact = perPoint * density * length;
    return Math.floor(exact) + (rand() < exact % 1 ? 1 : 0);
  };

  for (let i = 0; i < n; i++) {
    const a = frame[i];
    const b = frame[(i + 1) % n];
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);
    const at = (t: number): At => ({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      nx: a.nx + (b.nx - a.nx) * t,
      ny: a.ny + (b.ny - a.ny) * t,
      width: a.width + (b.width - a.width) * t,
    });
    for (let k = count(PER_POINT.mat, segLen); k > 0; k--) {
      const p = at(rand());
      const depth = p.width * rand() ** 1.4;
      const tier = depth < p.width * 0.45 ? (rand() < 0.5 ? 1 : 2) : rand() < 0.7 ? 0 : 1;
      mat[tier].push(strand(p, depth, angle(), 0.35 + rand() * rand() * 1.3));
    }
    for (let k = count(PER_POINT.colored, segLen); k > 0; k--) {
      const p = at(rand());
      colored.push(strand(p, -0.3 + p.width * 0.45 * rand() ** 1.5, (rand() - 0.5) * 2, 0.4 + rand()));
    }
    for (let k = count(PER_POINT.crossing, segLen); k > 0; k--) {
      const p = at(rand());
      crossing.push(strand(p, (rand() - 0.6) * 0.8, angle(), 0.3 + rand() * 0.8));
    }
    if (rand() < segLen / 28) {
      const p = at(rand());
      const [nx, ny] = turn(p.nx, p.ny, (rand() - 0.5) * 1.2);
      const len = 0.8 + rand() * 1.2;
      const bend = (rand() - 0.5) * len * 0.8;
      const x = p.x + p.nx * p.width * 0.7;
      const y = p.y + p.ny * p.width * 0.7;
      wisps.push(`M${r1(x)} ${r1(y)}q${r1((nx * len) / 2 - ny * bend)} ${r1((ny * len) / 2 + nx * bend)} ${r1(nx * len)} ${r1(ny * len)}`);
    }
  }

  return {
    mat: [mat[0].join(''), mat[1].join(''), mat[2].join('')],
    colored: colored.join(''),
    crossing: crossing.join(''),
    wisps: wisps.join(''),
  };
}
