import Svg, { Circle, Line, Path } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';
import { polar, ringBands, ringPath } from '@/timer/dial-geometry';

type PieDialProps = {
  /** Fraction of time remaining, 1 → 0. */
  fraction: number;
  /** One color fills the wedge; several split it into rings, outermost first. */
  colors: string[];
  size: number;
};

const TICKS = Array.from({ length: 60 }, (_, i) => i);

export function PieDial({ fraction, colors, size }: PieDialProps) {
  const theme = useTheme();
  const c = size / 2;
  const face = c - 1;
  const wedge = c * 0.8;
  const rings = ringBands(wedge, colors.length, c * 0.015).map((band, i) => ({ ...band, color: colors[i] }));

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={c} cy={c} r={face} fill={theme.face} />
      {/* Faint full-size ghost of the wedge so an empty dial still shows its colors. */}
      {rings.map((ring) => (
        <Path key={`ghost-${ring.outer}`} d={ringPath(c, c, ring.inner, ring.outer, 1)} fill={ring.color} opacity={0.12} />
      ))}
      {rings.map((ring) => (
        <Path key={ring.outer} d={ringPath(c, c, ring.inner, ring.outer, fraction)} fill={ring.color} />
      ))}
      {TICKS.map((i) => {
        const major = i % 5 === 0;
        const angle = (i / 60) * 2 * Math.PI;
        const a = polar(c, c, c * (major ? 0.84 : 0.87), angle);
        const b = polar(c, c, c * 0.93, angle);
        return (
          <Line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={theme.tick}
            strokeOpacity={major ? 0.7 : 0.25}
            strokeWidth={major ? c * 0.018 : c * 0.009}
            strokeLinecap="round"
          />
        );
      })}
    </Svg>
  );
}
