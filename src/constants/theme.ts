/**
 * The pack of construction paper the app is cut from. Every surface is a
 * sheet from this pack (or a timer color, see timer-colors), all with the
 * same grain; only the color differs.
 */
export const PaperPack = {
  white: '#FBF7EE',
  manila: '#EAE0CB',
  oatmeal: '#D7C7A7',
  kraft: '#B48C61',
  lightGray: '#C5C7C4',
  charcoal: '#3A3937',
  black: '#1D1D1C',
} as const;

/**
 * App palette. Light mode: white and oatmeal pieces on a manila sheet.
 * Dark mode: charcoal pieces on a black sheet. The only accent is the
 * user's timer color.
 */
export const Colors = {
  light: {
    text: '#2A2520',
    textSecondary: '#655C50',
    background: PaperPack.manila,
    backgroundElement: PaperPack.oatmeal,
    backgroundSelected: '#BCAB89',
    face: PaperPack.white,
    tick: '#2A2520',
  },
  dark: {
    text: '#F1EFEA',
    textSecondary: '#AAA8A2',
    background: PaperPack.black,
    backgroundElement: PaperPack.charcoal,
    backgroundSelected: '#55534F',
    face: PaperPack.charcoal,
    tick: '#F1EFEA',
  },
} as const;

/** How paper pieces are drawn in each scheme (see components/paper). */
export const PaperLook = {
  light: {
    /** Opacity of the fiber texture; the same on every sheet. */
    grain: 1,
    /** Shadow opacity for a piece one layer up; higher layers add a little. */
    shadow: 0.2,
    /** How far torn fibers are lightened from the sheet's own color, toward white. */
    fringe: 0.6,
    /** Paleness of the cut fibers along scissor-cut edges. */
    cutFibers: 0.16,
  },
  dark: {
    grain: 0.75,
    shadow: 0.55,
    // Black and charcoal paper tear to a grayish core, not a white one.
    fringe: 0.1,
    cutFibers: 0.07,
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
