import {
  createTimer,
  formatDuration,
  joinDuration,
  pause,
  progress,
  remainingMs,
  reset,
  resume,
  setDuration,
  splitDuration,
  start,
  tick,
} from '../engine';

const MIN = 60_000;
const T0 = 1_700_000_000_000;

describe('timer engine', () => {
  it('starts idle with the full duration remaining', () => {
    const t = createTimer(5 * MIN);
    expect(t.status).toBe('idle');
    expect(remainingMs(t, T0)).toBe(5 * MIN);
    expect(progress(t, T0)).toBe(1);
  });

  it('counts down from an end timestamp, not from ticks', () => {
    const t = start(createTimer(5 * MIN), T0);
    expect(t.status).toBe('running');
    // A long gap (e.g. app backgrounded) is still exact.
    expect(remainingMs(t, T0 + 3 * MIN)).toBe(2 * MIN);
    expect(progress(t, T0 + 3 * MIN)).toBeCloseTo(0.4);
  });

  it('pauses and resumes without losing or gaining time', () => {
    let t = start(createTimer(5 * MIN), T0);
    t = pause(t, T0 + 1 * MIN);
    expect(t.status).toBe('paused');
    // Time passing while paused does not count.
    expect(remainingMs(t, T0 + 10 * MIN)).toBe(4 * MIN);
    t = resume(t, T0 + 10 * MIN);
    expect(t.status).toBe('running');
    expect(remainingMs(t, T0 + 11 * MIN)).toBe(3 * MIN);
  });

  it('finishes when tick passes the end time, even if it overshoots', () => {
    let t = start(createTimer(1 * MIN), T0);
    expect(tick(t, T0 + 30_000)).toBe(t); // unchanged reference while running
    t = tick(t, T0 + 5 * MIN);
    expect(t.status).toBe('finished');
    expect(remainingMs(t, T0 + 5 * MIN)).toBe(0);
    expect(progress(t, T0 + 5 * MIN)).toBe(0);
    if (t.status === 'finished') expect(t.endedAt).toBe(T0 + 1 * MIN);
  });

  it('never reports negative remaining time', () => {
    const t = start(createTimer(1 * MIN), T0);
    expect(remainingMs(t, T0 + 2 * MIN)).toBe(0);
  });

  it('reset returns to idle with the same duration', () => {
    const t = reset(pause(start(createTimer(2 * MIN), T0), T0 + 1000));
    expect(t).toEqual(createTimer(2 * MIN));
  });

  it('ignores invalid transitions', () => {
    const idle = createTimer(MIN);
    expect(pause(idle, T0)).toBe(idle);
    expect(resume(idle, T0)).toBe(idle);
    const running = start(idle, T0);
    expect(start(running, T0 + 1000)).toBe(running);
  });

  it('start from finished restarts the same duration', () => {
    const done = tick(start(createTimer(MIN), T0), T0 + 2 * MIN);
    const again = start(done, T0 + 3 * MIN);
    expect(again.status).toBe('running');
    expect(remainingMs(again, T0 + 3 * MIN)).toBe(MIN);
  });

  it('setDuration replaces the timer with a fresh idle one', () => {
    const t = setDuration(start(createTimer(MIN), T0), 10 * MIN);
    expect(t).toEqual(createTimer(10 * MIN));
  });

  it('refuses zero or negative durations', () => {
    expect(() => createTimer(0)).toThrow();
    expect(() => createTimer(-5)).toThrow();
  });
});

describe('duration helpers', () => {
  it('splits and joins hours, minutes, seconds', () => {
    const ms = joinDuration({ hours: 1, minutes: 2, seconds: 3 });
    expect(ms).toBe(3_723_000);
    expect(splitDuration(ms)).toEqual({ hours: 1, minutes: 2, seconds: 3 });
  });

  it('formats as m:ss under an hour and h:mm:ss above', () => {
    expect(formatDuration(5 * MIN)).toBe('5:00');
    expect(formatDuration(65_000)).toBe('1:05');
    expect(formatDuration(3_723_000)).toBe('1:02:03');
    expect(formatDuration(0)).toBe('0:00');
  });

  it('rounds partial seconds up so the display never shows 0:00 early', () => {
    expect(formatDuration(59_001)).toBe('1:00');
    expect(formatDuration(1)).toBe('0:01');
  });
});
