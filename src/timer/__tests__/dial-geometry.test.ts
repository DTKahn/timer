import { polar, sectorPath, wedgePath } from '../dial-geometry';

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
