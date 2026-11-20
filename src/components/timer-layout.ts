import { Spacing } from '@/constants/theme';

export const TOP_BAR_HEIGHT = 48;

/** Smallest and largest the time, favorites, and buttons get, relative to their full size. */
const MIN_SCALE = 0.6;
const MAX_SCALE = 1;
/** Stacked, the time, favorites, and buttons take at most this share of the height; the dial gets the rest. */
const STACKED_SECTIONS_SHARE = 0.6;
const MAX_DIAL = 600;
/** Least space between the dial and the edges of its area. */
const DIAL_MARGIN = Spacing.three;

type Size = { width: number; height: number };

export type TimerLayout = {
  /** The dial on the left with everything else beside it, instead of stacked under it. */
  sideways: boolean;
  /** Multiplies the size of the time, favorites, and buttons. */
  scale: number;
  dial: number;
  /** The square the dial sits centered in; sideways, it and the column beside it are centered on screen. */
  dialBox: number;
  /** Least space between the sections. */
  gap: number;
  /** Space under the last section. */
  bottom: number;
  /** Width of the column beside the dial; only used sideways. */
  sideWidth: number;
};

/**
 * Arranges the timer screen in `space`, what's left inside the safe area:
 * stacked, or sideways when that makes the dial bigger. `sections` is the
 * time, favorites, and buttons at full size, without the space between them;
 * they shrink to fit short or narrow screens.
 */
export function timerLayout(space: Size, sections: Size): TimerLayout {
  const stacked = stackedLayout(space, sections);
  if (space.width <= space.height) return stacked;
  const sideways = sidewaysLayout(space, sections);
  return sideways.dial > stacked.dial ? sideways : stacked;
}

/** Top bar, then the dial, time, favorites, and buttons, with three gaps between them. */
function stackedLayout({ width, height }: Size, sections: Size): TimerLayout {
  const bottom = Spacing.four;
  const room = height - TOP_BAR_HEIGHT - bottom;
  const natural = sections.height + 3 * Spacing.four;
  const scale = clamp(
    Math.min((width - 2 * Spacing.three) / sections.width, (STACKED_SECTIONS_SHARE * room) / natural),
    MIN_SCALE,
    MAX_SCALE,
  );
  const dial = Math.min(width - 2 * Spacing.four, room - natural * scale, MAX_DIAL);
  const gap = Spacing.four * scale;
  const size = Math.max(0, Math.floor(dial));
  return { sideways: false, scale, dial: size, dialBox: size, gap, bottom, sideWidth: width };
}

/** The dial on the left; on the right, the top bar over the time, favorites, and buttons, with two gaps. */
function sidewaysLayout({ width, height }: Size, sections: Size): TimerLayout {
  const bottom = Spacing.three;
  const room = height - TOP_BAR_HEIGHT - bottom;
  const scale = clamp(room / (sections.height + 2 * Spacing.three), MIN_SCALE, MAX_SCALE);
  const sideWidth = sections.width * scale + 2 * Spacing.four;
  const dial = Math.min(width - sideWidth - 2 * DIAL_MARGIN, height - 2 * DIAL_MARGIN, MAX_DIAL);
  // Spare height spreads the sections apart, up to a point; past that they stay together.
  const gap = Math.max(0, Math.min(Spacing.five, (room - sections.height * scale) / 2));
  const size = Math.max(0, Math.floor(dial));
  return { sideways: true, scale, dial: size, dialBox: size + 2 * DIAL_MARGIN, gap, bottom, sideWidth };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
