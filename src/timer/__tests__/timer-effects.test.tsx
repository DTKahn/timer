import { act, render } from '@testing-library/react-native';

import { useTimer } from '@/store/timer';
import { TimerEffects } from '@/timer/timer-effects';

jest.mock('@/platform/alerts', () => ({
  scheduleTimerAlert: jest.fn(() => Promise.resolve()),
  cancelTimerAlert: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/platform/sounds', () => ({ playSound: jest.fn() }));

const MIN = 60_000;
const T0 = 1_700_000_000_000;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(T0);
  useTimer.getState().setDuration(MIN);
});

afterEach(() => jest.useRealTimers());

const advance = (ms: number) => act(async () => jest.advanceTimersByTime(ms));

describe('TimerEffects', () => {
  it('finishes the timer at the end time', async () => {
    await render(<TimerEffects />);
    await act(async () => useTimer.getState().start());
    await advance(MIN);
    expect(useTimer.getState().timer.status).toBe('finished');
  });

  it('still finishes when the timeout fires a little before the clock reaches the end', async () => {
    await render(<TimerEffects />);
    await act(async () => useTimer.getState().start());
    // The wall clock lags the timer clock, so the timeout fires just before endAt.
    jest.setSystemTime(T0 - 5);
    await advance(MIN);
    expect(useTimer.getState().timer.status).toBe('running');

    await advance(5);
    expect(useTimer.getState().timer.status).toBe('finished');
  });
});
