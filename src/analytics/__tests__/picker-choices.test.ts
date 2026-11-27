import { colorChoice, soundChoice } from '../picker-choices';

describe('colorChoice', () => {
  it('names a single preset color', () => {
    expect(colorChoice({ color: '#AD7F58', multiColor: false, colors: ['#E5484D'] })).toEqual({
      color: 'Brown',
      colors: ['Brown'],
      multiple: false,
    });
  });

  it('matches preset colors regardless of case', () => {
    expect(colorChoice({ color: '#ad7f58', multiColor: false, colors: [] }).color).toBe('Brown');
  });

  it('sends custom colors as their hex code', () => {
    expect(colorChoice({ color: '#12ab3f', multiColor: false, colors: [] }).color).toBe('Custom #12AB3F');
  });

  it('lists every ring in Multiple mode, outermost first', () => {
    expect(colorChoice({ color: '#E5484D', multiColor: true, colors: ['#E5484D', '#0090FF'] })).toEqual({
      color: 'Red',
      colors: ['Red', 'Blue'],
      multiple: true,
    });
  });
});

describe('soundChoice', () => {
  it('names the sound', () => {
    expect(soundChoice('bell')).toEqual({ sound: 'Bell' });
    expect(soundChoice('silent')).toEqual({ sound: 'Silent' });
  });
});
