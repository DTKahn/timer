import { SOUNDS } from '@/constants/sounds';
import { migrateSettings } from '@/store/settings';

describe('sounds', () => {
  it('has unique ids and includes a silent option', () => {
    const ids = SOUNDS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('silent');
  });
});

describe('settings migration', () => {
  it('turns the old chime toggle into a sound choice', () => {
    expect(migrateSettings({ color: '#123456', sound: true, haptics: false }, 0)).toEqual({
      color: '#123456',
      sound: 'chime',
      haptics: false,
    });
    expect(migrateSettings({ sound: false }, 0)).toEqual({ sound: 'silent' });
  });

  it('leaves current settings untouched', () => {
    expect(migrateSettings({ sound: 'bell' }, 1)).toEqual({ sound: 'bell' });
  });
});
