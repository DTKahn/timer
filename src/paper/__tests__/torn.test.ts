import { tornOutline } from '@/paper/outline';
import { tornFibers } from '@/paper/torn';

const sheet = tornOutline(300, 200, { radius: 4, seed: 'sheet' });
const points = (d: string) =>
  [...d.matchAll(/M(-?[\d.]+) (-?[\d.]+)l(-?[\d.]+) (-?[\d.]+)/g)].map((m) => {
    const [x, y, dx, dy] = m.slice(1).map(Number);
    return { x, y, x2: x + dx, y2: y + dy };
  });

describe('tornFibers', () => {
  it('gives the same fibers every time for a sheet', () => {
    expect(tornFibers(sheet.edge, sheet.fringe, 'sheet')).toEqual(tornFibers(sheet.edge, sheet.fringe, 'sheet'));
  });

  it('keeps every strand tight to the edge', () => {
    const f = tornFibers(sheet.edge, sheet.fringe, 'sheet');
    const ends = [...f.mat, f.colored, f.crossing].flatMap((d) =>
      points(d).flatMap((s) => [
        [s.x, s.y],
        [s.x2, s.y2],
      ]),
    );
    expect(ends.length).toBeGreaterThan(1000);
    // Within a few points of the box: nothing floats away from the sheet.
    const outside = ends.filter(([x, y]) => x < -6 || y < -6 || x > 306 || y > 206);
    // And never deep inside the sheet.
    const deep = ends.filter(([x, y]) => Math.min(x, y, 300 - x, 200 - y) >= 7);
    expect(outside).toEqual([]);
    expect(deep).toEqual([]);
  });

  it('draws fewer strands at a lower density', () => {
    const full = tornFibers(sheet.edge, sheet.fringe, 'sheet', 1);
    const half = tornFibers(sheet.edge, sheet.fringe, 'sheet', 0.5);
    const count = (f: typeof full) => f.mat.reduce((n, d) => n + points(d).length, 0);
    expect(count(half)).toBeLessThan(count(full) * 0.6);
    expect(count(half)).toBeGreaterThan(count(full) * 0.4);
  });
});
