import { SOUNDS } from '@/constants/sounds';
import { dialColors, migrateSettings, toggledColors, useSettings } from '@/store/settings';

describe('sounds', () => {
  it('offers bell, bird, guitar, and silent', () => {
    expect(SOUNDS.map((s) => s.id)).toEqual(['bell', 'bird', 'guitar', 'silent']);
  });
});

describe('settings migration', () => {
  it('turns the old chime toggle into a sound choice', () => {
    expect(migrateSettings({ color: '#123456', sound: true, haptics: false }, 0)).toEqual({
      color: '#123456',
      sound: 'bell',
      haptics: false,
    });
    expect(migrateSettings({ sound: false }, 0)).toEqual({ sound: 'silent' });
  });

  it('moves retired sounds to the bell', () => {
    for (const old of ['chime', 'marimba', 'beeps', 'soft']) {
      expect(migrateSettings({ sound: old }, 1)).toEqual({ sound: 'bell' });
    }
  });

  it('leaves current sounds untouched', () => {
    expect(migrateSettings({ sound: 'guitar' }, 1)).toEqual({ sound: 'guitar' });
    expect(migrateSettings({ sound: 'silent' }, 2)).toEqual({ sound: 'silent' });
  });
});

describe('multi-color selection', () => {
  it('adds colors in the order picked', () => {
    expect(toggledColors(['#111111'], '#222222')).toEqual({ colors: ['#111111', '#222222'], color: '#111111' });
  });

  it('removes a picked color, ignoring case, and keeps the accent on the first ring', () => {
    expect(toggledColors(['#AAAAAA', '#222222'], '#aaaaaa')).toEqual({ colors: ['#222222'], color: '#222222' });
  });

  it('keeps the last color selected', () => {
    expect(toggledColors(['#111111'], '#111111')).toEqual({ colors: ['#111111'], color: '#111111' });
  });

  it('draws one color unless multi-color mode is on', () => {
    const colors = ['#111111', '#222222'];
    expect(dialColors({ color: '#333333', multiColor: false, colors })).toEqual(['#333333']);
    expect(dialColors({ color: '#111111', multiColor: true, colors })).toEqual(colors);
  });

  it('starts multi-color mode from the current color and leaves it on the first ring', () => {
    const { setColor, setMultiColor, toggleColor } = useSettings.getState();
    setColor('#333333');
    setMultiColor(true);
    expect(useSettings.getState().colors).toEqual(['#333333']);
    toggleColor('#444444');
    toggleColor('#333333');
    setMultiColor(false);
    expect(useSettings.getState()).toMatchObject({ multiColor: false, color: '#444444' });
  });
});
