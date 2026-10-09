/**
 * App palette: construction paper. Light mode is warm cream stock with oatmeal
 * pieces; dark mode is black paper with charcoal pieces. The only accent is
 * the user's timer color, cut from bright paper.
 */

export const Colors = {
  light: {
    text: '#241F1A',
    textSecondary: '#5B5248',
    background: '#E9DFCB',
    backgroundElement: '#D3C4A7',
    backgroundSelected: '#BBA987',
    face: '#FBF7EE',
    tick: '#241F1A',
  },
  dark: {
    text: '#F1EDE6',
    textSecondary: '#ADA69C',
    background: '#1B1A19',
    backgroundElement: '#3B3936',
    backgroundSelected: '#504D49',
    face: '#2C2B29',
    tick: '#F1EDE6',
  },
} as const;

/** How paper pieces are drawn in each scheme (see components/paper). */
export const PaperLook = {
  light: {
    /** Opacity of the fiber texture laid over every piece. */
    grain: 0.55,
    /** Grain on the background paper, which covers the whole screen. */
    backdropGrain: 0.55,
    /** Shadow opacity for a piece one layer up; higher layers add a little. */
    shadow: 0.2,
    /** Pale fibers showing along torn edges. */
    fringe: '#FFFDF7',
  },
  dark: {
    grain: 0.5,
    backdropGrain: 0.32,
    shadow: 0.55,
    fringe: '#625E58',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Font families, loaded in the root layout. Custom fonts need one family per
 * weight, so set `fontFamily` to one of these instead of `fontWeight`.
 */
export const Fonts = {
  regular: 'Lato_400Regular',
  bold: 'Lato_700Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
