import { circleCut, cutOutline, cutRingPath, polygonPath, seeded, tornOutline, type Point } from '@/paper/outline';

describe('seeded', () => {
  it('repeats for the same seed and differs between seeds', () => {
    const a = seeded('chip-60000');
    const b = seeded('chip-60000');
    const c = seeded('chip-120000');
    const first = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(first);
    expect([c(), c(), c()]).not.toEqual(first);
  });
});

const longestStep = (points: Point[]) =>
  Math.max(...points.map((p, i) => Math.hypot(points[(i + 1) % points.length].x - p.x, points[(i + 1) % points.length].y - p.y)));

describe('cutOutline', () => {
  it('gives the same edge every time for a piece', () => {
    const options = { radius: 20, seed: 'start', tilt: 0.3 };
    expect(polygonPath(cutOutline(300, 72, options))).toBe(polygonPath(cutOutline(300, 72, options)));
  });

  it('stays within a couple of points of the box', () => {
    for (const [w, h, r] of [
      [40, 40, 20],
      [72, 72, 36],
      [342, 72, 36],
      [72, 68, 10],
    ]) {
      for (const p of cutOutline(w, h, { radius: r, seed: `${w}x${h}` })) {
        expect(p.x).toBeGreaterThan(-2);
        expect(p.y).toBeGreaterThan(-2);
        expect(p.x).toBeLessThan(w + 2);
        expect(p.y).toBeLessThan(h + 2);
      }
    }
  });

  it('cuts curves smoothly rather than in long straight facets', () => {
    expect(longestStep(cutOutline(72, 72, { radius: 36, seed: 'sound' }))).toBeLessThan(5);
    expect(longestStep(cutOutline(342, 72, { radius: 36, seed: 'start' }))).toBeLessThan(5);
  });

  it('keeps a circle round, give or take a hand-cut wobble', () => {
    for (const p of cutOutline(72, 72, { radius: 36, seed: 'reset' })) {
      expect(Math.abs(Math.hypot(p.x - 36, p.y - 36) - 36)).toBeLessThan(1.5);
    }
  });

  it('cuts each piece a little differently', () => {
    const a = polygonPath(cutOutline(72, 72, { radius: 36, seed: 'a' }));
    const b = polygonPath(cutOutline(72, 72, { radius: 36, seed: 'b' }));
    expect(a).not.toBe(b);
  });
});

describe('tornOutline', () => {
  it('keeps the fiber fringe outside the colored edge, within the bleed', () => {
    const { edge, fringe } = tornOutline(360, 700, { radius: 4, seed: 'sheet' });
    expect(fringe).toHaveLength(edge.length);
    for (const p of fringe) {
      expect(p.x).toBeGreaterThan(-6);
      expect(p.x).toBeLessThan(366);
    }
  });
});

describe('circleCut', () => {
  it('starts exactly at 12 o’clock and goes once around, in order', () => {
    const cut = circleCut(100, 'face');
    expect(cut[0].angle).toBe(0);
    for (let i = 1; i < cut.length; i++) expect(cut[i].angle).toBeGreaterThanOrEqual(cut[i - 1].angle);
    expect(cut[cut.length - 1].angle).toBeLessThan(2 * Math.PI);
  });

  it('stays close to the true radius', () => {
    for (const s of circleCut(200, 'dial')) expect(Math.abs(s.scale - 1) * 200).toBeLessThan(1.5);
  });
});

describe('cutRingPath', () => {
  const outer = circleCut(100, 'out');
  const inner = circleCut(50, 'in');
  const points = (d: string) =>
    d
      .replace(/Z/g, '')
      .split(/[ML]/)
      .filter(Boolean)
      .map((pair) => pair.split(' ').map(Number));

  it('draws nothing when no time is left', () => {
    expect(cutRingPath(120, 120, 0, 100, 0, outer, inner)).toBe('');
  });

  it('draws a closed disk or ring when full', () => {
    expect(cutRingPath(120, 120, 0, 100, 1, outer, inner).match(/Z/g)).toHaveLength(1);
    expect(cutRingPath(120, 120, 50, 100, 1, outer, inner).match(/Z/g)).toHaveLength(2);
  });

  it('runs a wedge from the center out to 12 o’clock', () => {
    const pts = points(cutRingPath(120, 120, 0, 100, 0.25, outer, inner));
    expect(pts).toContainEqual([120, 120]);
    // The top of the 12 o'clock edge sits straight above the center.
    const top = pts.reduce((a, b) => (b[1] < a[1] ? b : a));
    expect(Math.abs(top[0] - 120)).toBeLessThan(1.5);
    expect(top[1]).toBeLessThan(22);
  });

  it('keeps the moving edge the same shape as it sweeps, so it doesn’t shimmer', () => {
    // The point just inside the outer edge on the moving cut, rotated back to 12 o'clock.
    const nearRim = (fraction: number) => {
      const a = (1 - fraction) * 2 * Math.PI;
      const pts = points(cutRingPath(120, 120, 0, 100, fraction, outer, inner));
      // The path closes by running back out along the moving edge; its last point is nearest the rim.
      const [x, y] = pts[pts.length - 1];
      const dx = x - 120;
      const dy = y - 120;
      return { along: dx * Math.sin(a) - dy * Math.cos(a), across: dx * Math.cos(a) + dy * Math.sin(a) };
    };
    const a = nearRim(0.7);
    const b = nearRim(0.3);
    expect(b.along).toBeCloseTo(a.along, 0);
    expect(b.across).toBeCloseTo(a.across, 0);
  });
});
