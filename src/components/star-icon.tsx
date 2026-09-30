import Svg, { Path } from 'react-native-svg';

// Five-point star on a 24×24 grid.
const STAR = 'M12 2.8l2.75 5.9 6.45.72-4.8 4.38 1.33 6.36L12 16.9l-5.73 3.26 1.33-6.36-4.8-4.38 6.45-.72z';

/** Star drawn as SVG so the filled and outline states match on every platform. */
export function StarIcon({ filled, color, size = 24 }: { filled: boolean; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={STAR}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
