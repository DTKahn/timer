import { contentColorOn, isHexColor, TIMER_COLORS } from '../timer-colors';

describe('timer colors', () => {
  it('has unique, valid hex values', () => {
    const values = TIMER_COLORS.map((c) => c.value.toLowerCase());
    expect(new Set(values).size).toBe(values.length);
    for (const v of values) expect(isHexColor(v)).toBe(true);
  });

  it('uses dark content on light colors and white on dark ones', () => {
    expect(contentColorOn('#FFE629')).toBe('#16181C'); // yellow
    expect(contentColorOn('#BDEE63')).toBe('#16181C'); // lime
    expect(contentColorOn('#0090FF')).toBe('#FFFFFF'); // blue
    expect(contentColorOn('#E5484D')).toBe('#FFFFFF'); // red
    expect(contentColorOn('#fff')).toBe('#16181C');
  });
});
