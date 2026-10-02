import { polar, ringBands, ringPath, sectorPath, wedgePath } from '../dial-geometry';

describe('dial geometry', () => {
  it('puts angle 0 at 12 o’clock and quarter turn at 3 o’clock', () => {
    expect(polar(50, 50, 10, 0)).toEqual({ x: 50, y: 40 });
    const q = polar(50, 50, 10, Math.PI / 2);
    expect(q.x).toBeCloseTo(60);
    expect(q.y).toBeCloseTo(50);
  });

  it('draws nothing for an empty timer', () => {
    expect(wedgePath(50, 50, 10, 0)).toBe('');
  });

  it('draws a full disk with two arcs', () => {
    expect(wedgePath(50, 50, 10, 1)).toBe('M 50 40 A 10 10 0 1 1 50 60 A 10 10 0 1 1 50 40 Z');
  });

  it('anchors the wedge at 12 o’clock and extends it back toward 9 for a quarter', () => {
    expect(wedgePath(50, 50, 10, 0.25)).toBe('M 50 50 L 40 50 A 10 10 0 0 1 50 40 Z');
  });

  it('uses the large-arc flag past half', () => {
    expect(wedgePath(50, 50, 10, 0.75)).toBe('M 50 50 L 60 50 A 10 10 0 1 1 50 40 Z');
  });

  it('moves its free edge clockwise as time runs out', () => {
    // The free edge is the arc's start point; its angle should grow as the fraction shrinks.
    const edgeAngle = (f: number) => {
      const [, x, y] = wedgePath(50, 50, 10, f).match(/L (\S+) (\S+)/)!.map(Number);
      return (Math.atan2(x - 50, 50 - y) + 2 * Math.PI) % (2 * Math.PI);
    };
    expect(edgeAngle(0.5)).toBeGreaterThan(edgeAngle(0.75));
    expect(edgeAngle(0.25)).toBeGreaterThan(edgeAngle(0.5));
  });
});

describe('sectorPath', () => {
  it('draws a slice between two angles', () => {
    expect(sectorPath(50, 50, 10, 0, Math.PI / 2)).toBe('M 50 50 L 50 40 A 10 10 0 0 1 60 50 Z');
  });
});

describe('ringPath', () => {
  it('is a plain wedge when the ring reaches the center', () => {
    expect(ringPath(50, 50, 0, 10, 0.25)).toBe(wedgePath(50, 50, 10, 0.25));
  });

  it('draws nothing for an empty timer', () => {
    expect(ringPath(50, 50, 5, 10, 0)).toBe('');
  });

  it('cuts a reversed inner circle out of a full ring', () => {
    expect(ringPath(50, 50, 5, 10, 1)).toBe(
      'M 50 40 A 10 10 0 1 1 50 60 A 10 10 0 1 1 50 40 Z M 50 45 A 5 5 0 1 0 50 55 A 5 5 0 1 0 50 45 Z',
    );
  });

  it('runs out along the outer edge to 12 o’clock and back along the inner edge', () => {
    expect(ringPath(50, 50, 5, 10, 0.25)).toBe('M 40 50 A 10 10 0 0 1 50 40 L 50 45 A 5 5 0 0 0 45 50 Z');
    expect(ringPath(50, 50, 5, 10, 0.75)).toBe('M 60 50 A 10 10 0 1 1 50 40 L 50 45 A 5 5 0 1 0 55 50 Z');
  });
});

describe('ringBands', () => {
  it('is the whole disk for one color', () => {
    expect(ringBands(80, 1, 2)).toEqual([{ inner: 0, outer: 80 }]);
  });

  it('splits into equal rings, outermost first, with gaps between', () => {
    expect(ringBands(80, 3, 4)).toEqual([
      { inner: 56, outer: 80 },
      { inner: 28, outer: 52 },
      { inner: 0, outer: 24 },
    ]);
  });
});
