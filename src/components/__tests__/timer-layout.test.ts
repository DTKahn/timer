import { TOP_BAR_HEIGHT, timerLayout } from '@/components/timer-layout';

/** The time picker, favorites, and buttons at full size, as on the timer screen. */
const SECTIONS = { width: 336, height: 268 };

const layout = (width: number, height: number) => timerLayout({ width, height }, SECTIONS);

/** Height everything takes, which must fit in the space given. */
function usedHeight(width: number, height: number) {
  const l = layout(width, height);
  return l.sideways
    ? TOP_BAR_HEIGHT + SECTIONS.height * l.scale + 2 * l.gap + l.bottom
    : TOP_BAR_HEIGHT + l.dial + SECTIONS.height * l.scale + 3 * l.gap + l.bottom;
}

describe('timerLayout', () => {
  it('stacks everything at full size on an upright phone', () => {
    const l = layout(393, 759);
    expect(l.sideways).toBe(false);
    expect(l.scale).toBe(1);
    expect(l.dial).toBeGreaterThan(300);
  });

  it('puts the dial beside everything else on a phone held sideways', () => {
    const l = layout(734, 372);
    expect(l.sideways).toBe(true);
    expect(l.dial).toBeGreaterThan(300);
    expect(l.dialBox + l.sideWidth).toBeLessThanOrEqual(734);
  });

  it('shrinks the buttons to fit a short screen held sideways', () => {
    const l = layout(813, 299);
    expect(l.sideways).toBe(true);
    expect(l.scale).toBeLessThan(1);
    expect(usedHeight(813, 299)).toBeLessThanOrEqual(299);
    expect(l.dial).toBeLessThanOrEqual(299);
  });

  it('shrinks the buttons on a short upright screen, leaving room for the dial', () => {
    const l = layout(390, 520);
    expect(l.sideways).toBe(false);
    expect(l.scale).toBeLessThan(1);
    expect(l.dial).toBeGreaterThan(140);
    expect(usedHeight(390, 520)).toBeLessThanOrEqual(520);
  });

  it('shrinks the time to fit a narrow screen', () => {
    expect(layout(320, 548).scale).toBeLessThan(1);
  });

  it('keeps a big window stacked with a capped dial', () => {
    const l = layout(800, 1200);
    expect(l.sideways).toBe(false);
    expect(l.dial).toBe(600);
  });

  it('fits every size from small phones to desktops', () => {
    for (let width = 320; width <= 1000; width += 20) {
      for (let height = 280; height <= 1200; height += 20) {
        const l = layout(width, height);
        expect(usedHeight(width, height)).toBeLessThanOrEqual(height + 1e-9);
        expect(l.dial).toBeLessThanOrEqual(Math.min(width, height));
        if (l.sideways) expect(l.dialBox + l.sideWidth).toBeLessThanOrEqual(width);
      }
    }
  });
});
