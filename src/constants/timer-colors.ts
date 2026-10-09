/** In hue order so the picker reads like a spectrum. */
export const TIMER_COLORS = [
  { name: 'Red', value: '#E5484D' },
  { name: 'Tomato', value: '#E54D2E' },
  { name: 'Orange', value: '#F76B15' },
  { name: 'Amber', value: '#FFB224' },
  { name: 'Yellow', value: '#FFE629' },
  { name: 'Lime', value: '#BDEE63' },
  { name: 'Grass', value: '#46A758' },
  { name: 'Green', value: '#30A46C' },
  { name: 'Teal', value: '#12A594' },
  { name: 'Cyan', value: '#00A2C7' },
  { name: 'Sky', value: '#7CE2FE' },
  { name: 'Blue', value: '#0090FF' },
  { name: 'Indigo', value: '#3E63DD' },
  { name: 'Violet', value: '#6E56CF' },
  { name: 'Purple', value: '#8E4EC6' },
  { name: 'Plum', value: '#AB4ABA' },
  { name: 'Pink', value: '#D6409F' },
  { name: 'Ruby', value: '#E54666' },
  { name: 'Brown', value: '#AD7F58' },
  { name: 'Graphite', value: '#60646C' },
] as const;

/**
 * The timer color as construction paper: a touch less saturated and a hair
 * warmer, the way dyed paper never quite matches a screen color. Works for any
 * hex the person types in.
 */
export function paperColor(hex: string): string {
  if (!isHexColor(hex)) return hex;
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const gray = 0.3 * r + 0.59 * g + 0.11 * b;
  const warm = [1.02, 1, 0.95];
  const out = [r, g, b].map((c, i) => Math.round(Math.min(255, (c * 0.84 + gray * 0.16) * warm[i] * 0.97)));
  return `#${out.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export function isHexColor(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

/** Icon/text color that stays readable on top of `hex` (dark on light colors). */
export function contentColorOn(hex: string): '#16181C' | '#FFFFFF' {
  return relativeLuminance(hex) > 0.45 ? '#16181C' : '#FFFFFF';
}

export function relativeLuminance(hex: string): number {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
