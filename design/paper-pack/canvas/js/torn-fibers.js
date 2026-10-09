// Prototype of a torn edge made entirely of fibers, on top of the app's tornOutline.
// Nothing at the edge is a solid shape: the exposed band is a dense mat of short strands,
// thickest against the color and thinning outward, and strands cross the color's edge both ways.
const o = require('./outline.js');

const f1 = (n) => Math.round(n * 10) / 10;

function tornEdge(w, h, { radius = 4, seed, tilt = 0 }) {
  const { edge, fringe } = o.tornOutline(w, h, { radius, seed, tilt });
  const rand = o.seeded(`${seed}:fibers`);
  const n = edge.length;

  // Arc length along the edge, for a slow swell in band width where the tear ran at an angle.
  const arc = [0];
  for (let i = 1; i <= n; i++) arc.push(arc[i - 1] + Math.hypot(edge[i % n].x - edge[i - 1].x, edge[i % n].y - edge[i - 1].y));
  const total = arc[n];
  const waves = [1, 2, 3].map((k) => ({ k: k + Math.floor(rand() * 3), ph: rand() * 2 * Math.PI, a: rand() }));
  const swell = (s) => {
    const v = waves.reduce((acc, wv) => acc + wv.a * Math.sin((s / total) * 2 * Math.PI * wv.k * 3 + wv.ph), 0) / 1.5;
    return 0.75 + 0.9 * Math.max(0, v - 0.2);
  };

  const frame = edge.map((p, i) => {
    const dx = fringe[i].x - p.x;
    const dy = fringe[i].y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x, y: p.y, nx: dx / len, ny: dy / len, width: Math.min(3.2, len * swell(arc[i])) };
  });

  // Under the sheet: the exposed mat, in three pale strengths. Over the sheet: strands that cross its edge.
  const mat = [[], [], []];
  const colored = [];
  const crossing = [];
  const wisps = [];
  const turn = (nx, ny, a) => [nx * Math.cos(a) - ny * Math.sin(a), nx * Math.sin(a) + ny * Math.cos(a)];
  // Mostly any angle, with a share lying along the tear.
  const angle = () => (rand() < 0.35 ? (rand() < 0.5 ? -1 : 1) * (1.1 + rand() * 0.5) : (rand() - 0.5) * 2.2);
  const strand = (p, depth, a, len) => {
    const [nx, ny] = turn(p.nx, p.ny, a);
    const cx = p.x + p.nx * depth;
    const cy = p.y + p.ny * depth;
    return `M${f1(cx - nx * len * 0.5)} ${f1(cy - ny * len * 0.5)}l${f1(nx * len)} ${f1(ny * len)}`;
  };

  for (let i = 0; i < n; i++) {
    const a = frame[i];
    const b = frame[(i + 1) % n];
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);
    const at = (t) => ({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      nx: a.nx + (b.nx - a.nx) * t,
      ny: a.ny + (b.ny - a.ny) * t,
      width: a.width + (b.width - a.width) * t,
    });
    // The mat: dense against the color, thinning toward the outside.
    for (let k = 0, c = Math.round(segLen * 17); k < c; k++) {
      const p = at(rand());
      const depth = p.width * Math.pow(rand(), 1.4);
      const tier = depth < p.width * 0.45 ? (rand() < 0.5 ? 1 : 2) : rand() < 0.7 ? 0 : 1;
      mat[tier].push(strand(p, depth, angle(), 0.35 + rand() * rand() * 1.3));
    }
    // Colored strands reaching out of the sheet into the mat.
    for (let k = 0, c = Math.round(segLen * 3); k < c; k++) {
      const p = at(rand());
      colored.push(strand(p, -0.3 + p.width * 0.45 * Math.pow(rand(), 1.5), (rand() - 0.5) * 2, 0.4 + rand()));
    }
    // Pale strands lying across the color's edge, so the edge itself breaks up.
    for (let k = 0, c = Math.round(segLen * 2.5); k < c; k++) {
      const p = at(rand());
      crossing.push(strand(p, (rand() - 0.6) * 0.8, angle(), 0.3 + rand() * 0.8));
    }
    // The odd loose wisp, short and close in.
    if (rand() < segLen / 28) {
      const p = at(rand());
      const [nx, ny] = turn(p.nx, p.ny, (rand() - 0.5) * 1.2);
      const len = 0.8 + rand() * 1.2;
      const bend = (rand() - 0.5) * len * 0.8;
      const x = p.x + p.nx * p.width * 0.7;
      const y = p.y + p.ny * p.width * 0.7;
      wisps.push(`M${f1(x)} ${f1(y)}q${f1(nx * len * 0.5 - ny * bend)} ${f1(ny * len * 0.5 + nx * bend)} ${f1(nx * len)} ${f1(ny * len)}`);
    }
  }

  return {
    edge: o.polygonPath(edge),
    fringe: o.polygonPath(fringe), // today's flat fringe, for comparison
    mat: mat.map((t) => t.join('')),
    colored: colored.join(''),
    crossing: crossing.join(''),
    wisps: wisps.join(''),
  };
}

module.exports = { tornEdge };
