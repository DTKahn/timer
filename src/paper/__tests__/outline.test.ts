import { circleFacets, cutOutline, facetedRingPath, polygonPath, seeded, tornOutline } from '@/paper/outline';

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

describe('facetedRingPath', () => {
  const outer = circleFacets(100, 'out');
  const inner = circleFacets(50, 'in');

  it('draws nothing when no time is left', () => {
    expect(facetedRingPath(120, 120, 0, 100, 0, outer, inner)).toBe('');
  });

  it('draws a closed disk or ring when full', () => {
    expect(facetedRingPath(120, 120, 0, 100, 1, outer, inner).match(/Z/g)).toHaveLength(1);
    expect(facetedRingPath(120, 120, 50, 100, 1, outer, inner).match(/Z/g)).toHaveLength(2);
  });

  it('ends the wedge exactly at 12 o’clock', () => {
    const d = facetedRingPath(120, 120, 0, 100, 0.25, outer, inner);
    // The last arc corner before the center is straight above it.
    expect(d).toMatch(/L120 \d+(\.\d)?L120 120Z$/);
  });
});
