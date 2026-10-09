import { edgeTones, fiberOpacity, lighterFiber, luminance, mix } from '@/paper/grain';

describe('fiberOpacity', () => {
  it('softens dark fibers on pale sheets and light fibers on dark sheets', () => {
    const white = fiberOpacity('#EDEAE2');
    const black = fiberOpacity('#38342F');
    const red = fiberOpacity('#D14D4D');
    expect(white.dark).toBeLessThan(red.dark);
    expect(black.light).toBeLessThan(red.light);
  });

  it('never goes past the images’ full strength', () => {
    for (const c of ['#000000', '#FFFFFF', '#D14D4D', '#1E88E5', 'not a color']) {
      const { light, dark } = fiberOpacity(c);
      expect(light).toBeGreaterThan(0);
      expect(light).toBeLessThanOrEqual(0.2);
      expect(dark).toBeGreaterThan(0);
      expect(dark).toBeLessThanOrEqual(0.3);
    }
  });
});

describe('luminance', () => {
  it('runs from black to white', () => {
    expect(luminance('#000000')).toBe(0);
    expect(luminance('#FFFFFF')).toBeCloseTo(1);
    expect(luminance('#fff')).toBeCloseTo(1);
  });
});

describe('mix', () => {
  it('moves a color toward another', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
    expect(mix('#D14D4D', '#FFFFFF', 0)).toBe('#D14D4D');
  });

  it('leaves colors it can’t read alone', () => {
    expect(mix('hsl(0, 50%, 50%)', '#FFFFFF', 0.5)).toBe('hsl(0, 50%, 50%)');
  });
});

describe('edgeTones', () => {
  it('starts from the sheet’s own color and only gets a little lighter', () => {
    const [sheet, lighter, lightest] = edgeTones('#D14D4D', false);
    expect(sheet).toBe('#D14D4D');
    expect(lighter).toBe(lighterFiber('#D14D4D'));
    expect(luminance(lighter)).toBeGreaterThan(luminance(sheet));
    expect(luminance(lightest)).toBeGreaterThan(luminance(lighter));
    // Still red, not a pale pink band: well short of white.
    expect(luminance(lightest)).toBeLessThan(0.5);
  });
});
