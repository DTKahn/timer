/**
 * App palette. The only accent is the user's timer color; everything else is
 * a quiet neutral so the dial carries the design.
 */

export const Colors = {
  light: {
    text: '#16181C',
    textSecondary: '#5A5F68',
    background: '#E9ECEF',
    backgroundElement: '#C4CAD1',
    backgroundSelected: '#A9B1BA',
    face: '#FFFFFF',
    tick: '#16181C',
  },
  dark: {
    text: '#EEF0F2',
    textSecondary: '#9AA0A8',
    background: '#141619',
    backgroundElement: '#373C43',
    backgroundSelected: '#4B525A',
    face: '#1F2226',
    tick: '#EEF0F2',
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
