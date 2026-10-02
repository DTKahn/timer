import appJson from '../../../app.json';
import { RELEASES } from '../releases';

const parse = (v: string) => v.split('.').map(Number);
const newer = (a: string, b: string) => {
  const [x, y] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

describe('RELEASES', () => {
  it('starts with the version in app.json', () => {
    expect(RELEASES[0].version).toBe(appJson.expo.version);
  });

  it('is ordered newest first with no repeats', () => {
    for (let i = 1; i < RELEASES.length; i++) {
      expect(newer(RELEASES[i - 1].version, RELEASES[i].version)).toBe(true);
    }
  });

  it('describes every release', () => {
    for (const r of RELEASES) {
      expect(r.name).not.toBe('');
      expect(r.changes.length).toBeGreaterThan(0);
    }
  });
});
