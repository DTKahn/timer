/**
 * The pack of construction paper the app is cut from. Every surface is a
 * sheet from this pack (or a timer color, see timer-colors), all with the
 * same grain; only the color differs.
 */
export const PaperPack = {
  // Real construction paper: white is a dull off-white and black a warm, faded charcoal.
  white: '#EDEAE2',
  manila: '#EAE0CB',
  oatmeal: '#D7C7A7',
  kraft: '#B48C61',
  lightGray: '#C5C7C4',
  charcoal: '#4C4843',
  black: '#38342F',
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
    backgroundSelected: '#615C56',
    face: PaperPack.charcoal,
    tick: '#F1EFEA',
  },
} as const;

/**
 * How high a piece sits on what's under it: glued flat (the dial face on the
 * page), raised (a button), or lifted (a torn panel floating above everything).
 */
export type Lift = 'glued' | 'raised' | 'lifted';

/** One shadow layer: drop in points, blur (standard deviation) in points, opacity. */
type ShadowLayer = { dy: number; blur: number; opacity: number };

/** How paper pieces are drawn in each scheme (see components/paper). */
export const PaperLook: Record<
  'light' | 'dark',
  { shadowColor: string; lifts: Record<Lift, ShadowLayer[]>; cutFibers: number }
> = {
  light: {
    // A warm brown shadow, like daylight on paper, rather than gray.
    shadowColor: '#2B1E0F',
    lifts: {
      glued: [{ dy: 0.5, blur: 0.2, opacity: 0.3 }],
      raised: [
        { dy: 1, blur: 0.5, opacity: 0.2 },
        { dy: 3, blur: 2.5, opacity: 0.18 },
      ],
      lifted: [
        { dy: 2, blur: 1, opacity: 0.16 },
        { dy: 10, blur: 8, opacity: 0.22 },
      ],
    },
    /** Paleness of the cut fibers along scissor-cut edges. */
    cutFibers: 0.16,
  },
  dark: {
    // Shadows need more weight to read at all on black paper.
    shadowColor: '#000000',
    lifts: {
      glued: [{ dy: 0.6, blur: 0.25, opacity: 0.65 }],
      raised: [
        { dy: 1, blur: 0.5, opacity: 0.55 },
        { dy: 3, blur: 3, opacity: 0.5 },
      ],
      lifted: [
        { dy: 2, blur: 1, opacity: 0.5 },
        { dy: 10, blur: 9, opacity: 0.6 },
      ],
    },
    cutFibers: 0.07,
  },
};

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
