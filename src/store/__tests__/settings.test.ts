import { SOUNDS } from '@/constants/sounds';
import { migrateSettings } from '@/store/settings';

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
