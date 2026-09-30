import { migrateFavorites, useFavorites } from '@/store/favorites';
import { recentTimes, useHistory } from '@/store/history';
import { useTimer } from '@/store/timer';

const MIN = 60_000;
const T0 = 1_700_000_000_000;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(T0);
  useTimer.getState().setDuration(MIN);
  useHistory.getState().clear();
});

afterEach(() => jest.useRealTimers());

describe('timer store', () => {
  it('records a completed run in history', () => {
    useTimer.getState().start();
    jest.setSystemTime(T0 + 2 * MIN);
    useTimer.getState().tick();

    expect(useTimer.getState().timer.status).toBe('finished');
    const [entry] = useHistory.getState().entries;
    expect(entry).toMatchObject({
      durationMs: MIN,
      startedAt: T0,
      endedAt: T0 + MIN,
      outcome: 'completed',
      ranMs: MIN,
    });
  });

  it('records only once even if tick is called repeatedly after finishing', () => {
    useTimer.getState().start();
    jest.setSystemTime(T0 + 2 * MIN);
    useTimer.getState().tick();
    useTimer.getState().tick();
    expect(useHistory.getState().entries).toHaveLength(1);
  });

  it('records a cancelled run when reset mid-way', () => {
    useTimer.getState().start();
    jest.setSystemTime(T0 + 20_000);
    useTimer.getState().reset();
    expect(useTimer.getState().timer.status).toBe('idle');
    expect(useHistory.getState().entries[0]).toMatchObject({
      outcome: 'cancelled',
      endedAt: T0 + 20_000,
    });
  });

  it('records only active running time for a stopped run, excluding pauses', () => {
    useTimer.getState().start();
    jest.setSystemTime(T0 + 10_000);
    useTimer.getState().pause();
    jest.setSystemTime(T0 + 50_000);
    useTimer.getState().resume();
    jest.setSystemTime(T0 + 55_000);
    useTimer.getState().reset();
    expect(useHistory.getState().entries[0].ranMs).toBe(15_000);
  });

  it('does not record anything when resetting an idle timer', () => {
    useTimer.getState().reset();
    useTimer.getState().setDuration(2 * MIN);
    expect(useHistory.getState().entries).toHaveLength(0);
  });
});

describe('history', () => {
  it('lists distinct recent times, newest first', () => {
    const { record } = useHistory.getState();
    for (const m of [1, 5, 1, 3]) {
      record({ durationMs: m * MIN, ranMs: m * MIN, startedAt: 0, endedAt: 0, outcome: 'completed' });
    }
    expect(recentTimes(useHistory.getState().entries)).toEqual([3 * MIN, MIN, 5 * MIN]);
  });

  it('caps the recent times list', () => {
    const { record } = useHistory.getState();
    for (let m = 1; m <= 5; m++) {
      record({ durationMs: m * MIN, ranMs: m * MIN, startedAt: 0, endedAt: 0, outcome: 'completed' });
    }
    expect(recentTimes(useHistory.getState().entries, 2)).toHaveLength(2);
  });
});

describe('favorites', () => {
  it('seeds the default quick-set times', () => {
    useFavorites.getState().restoreDefaults();
    expect(useFavorites.getState().favorites.map((f) => f.durationMs / MIN)).toEqual([
      1, 2, 5, 10, 30,
    ]);
  });

  it('adds new durations in sorted order and ignores duplicates', () => {
    useFavorites.getState().restoreDefaults();
    useFavorites.getState().add(4 * MIN);
    useFavorites.getState().add(4 * MIN);
    expect(useFavorites.getState().favorites.map((f) => f.durationMs / MIN)).toEqual([
      1, 2, 4, 5, 10, 30,
    ]);
  });

  it('sorts a previously hand-ordered list when loading old saved data', () => {
    const saved = { favorites: [{ id: 'a', durationMs: 5 * MIN }, { id: 'b', durationMs: MIN }] };
    expect(migrateFavorites(saved, 0)).toEqual({
      favorites: [{ id: 'b', durationMs: MIN }, { id: 'a', durationMs: 5 * MIN }],
    });
  });
});
