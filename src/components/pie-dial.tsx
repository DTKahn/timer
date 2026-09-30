import Svg, { Circle, Line, Path } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';
import { polar, wedgePath } from '@/timer/dial-geometry';

type PieDialProps = {
  /** Fraction of time remaining, 1 → 0. */
  fraction: number;
  color: string;
  size: number;
};

const TICKS = Array.from({ length: 60 }, (_, i) => i);

export function PieDial({ fraction, color, size }: PieDialProps) {
  const theme = useTheme();
  const c = size / 2;
  const face = c - 1;
  const wedge = c * 0.8;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={c} cy={c} r={face} fill={theme.face} />
      {/* Faint full-size ghost of the wedge so an empty dial still shows its color. */}
      <Circle cx={c} cy={c} r={wedge} fill={color} opacity={0.12} />
      <Path d={wedgePath(c, c, wedge, fraction)} fill={color} />
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
      <Circle cx={c} cy={c} r={c * 0.075} fill={theme.face} />
      <Circle cx={c} cy={c} r={c * 0.035} fill={color} />
    </Svg>
  );
}
