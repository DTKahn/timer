/**
 * Color math for the paper's fibers. Each sheet's fibers are a lighter and a
 * darker shade of the sheet's own color: white and black fiber images laid over
 * it at opacities set here. Pale sheets get gentler dark fibers and dark sheets
 * gentler light ones, so the grain reads equally soft on every sheet.
 */

/** Full strength of the light and dark fiber images (see scripts/generate-paper-grain.py). */
const LIGHT_FULL = 0.2;
const DARK_FULL = 0.3;

function rgb(hex: string): [number, number, number] | null {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Relative luminance (0 black .. 1 white). Non-hex colors count as mid gray. */
export function luminance(color: string): number {
  const c = rgb(color);
  if (!c) return 0.2;
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Opacities for the white and black fiber images over a sheet of this color. */
export function fiberOpacity(color: string): { light: number; dark: number } {
  const l = luminance(color);
  const dark = l <= 0.35 ? 1 : Math.max(0.3, 1 - ((l - 0.35) / 0.5) * 0.7);
  const light = l >= 0.15 ? 1 : 0.35 + (0.65 * l) / 0.15;
  return { light: LIGHT_FULL * light, dark: DARK_FULL * dark };
}

/** `color` moved `t` of the way toward `toward` (both hex); other colors are returned as is. */
export function mix(color: string, toward: string, t: number): string {
  const a = rgb(color);
  const b = rgb(toward);
  if (!a || !b) return color;
  return `#${a.map((c, i) => Math.round(c + (b[i] - c) * t).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** The sheet's lighter fiber shade: what its light fibers look like. */
export function lighterFiber(color: string): string {
  return mix(color, '#FFFFFF', fiberOpacity(color).light);
}

/**
 * Colors for torn fibers. A tear exposes the sheet's own dyed fibers: its
 * color, its lighter fiber shade, and a touch lighter still at the tips.
 */
export function edgeTones(color: string, darkScheme: boolean): [string, string, string] {
  const lighter = lighterFiber(color);
  return [color, lighter, mix(lighter, '#FFFFFF', darkScheme ? 0.06 : 0.12)];
}
