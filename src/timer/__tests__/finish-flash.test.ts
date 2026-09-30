import { createTimer, start, tick } from '../engine';
import { FINISH_SEQUENCE_MS, finishFlash } from '../finish-flash';

const T0 = 1_700_000_000_000;
const finished = tick(start(createTimer(60_000), T0), T0 + 60_000);
const END = T0 + 60_000;

describe('finish flash', () => {
  it('is inactive unless the timer has finished', () => {
    const running = start(createTimer(60_000), T0);
    expect(finishFlash(running, T0 + 1000)).toEqual({ active: false, lit: false });
  });

  it('flashes the disk on and off three times after finishing', () => {
    const lit = [0, 200, 700, 900, 1400, 1600].map((ms) => finishFlash(finished, END + ms).lit);
    const dark = [450, 1150, 1850].map((ms) => finishFlash(finished, END + ms).lit);
    expect(lit).toEqual([true, true, true, true, true, true]);
    expect(dark).toEqual([false, false, false]);
    expect(finishFlash(finished, END + 450).active).toBe(true);
  });

  it('ends after the sequence so editing can resume', () => {
    expect(finishFlash(finished, END + FINISH_SEQUENCE_MS)).toEqual({ active: false, lit: false });
    expect(finishFlash(finished, END + 60_000).active).toBe(false);
  });

  it('treats a clock reading just before the end as the start of the sequence', () => {
    expect(finishFlash(finished, END - 16)).toEqual({ active: true, lit: true });
  });
});
