import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, G, Line, Path } from 'react-native-svg';

import { bleedFor, CutEdge, Grain, PaperShadow, usePaperLook, useSvgId } from '@/components/paper';
import { paperColor } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';
import { polar, ringBands } from '@/timer/dial-geometry';
import { circleCut, cutCircle, cutRingPath, polygonPath, type CircleCut } from '@/paper/outline';

type PieDialProps = {
  /** Fraction of time remaining, 1 → 0. */
  fraction: number;
  /** One color fills the wedge; several split it into rings, outermost first. */
  colors: string[];
  size: number;
};

const TICKS = Array.from({ length: 60 }, (_, i) => i);
/** The drawing overflows the dial's box by this much so the face's shadow isn't clipped. */
const BLEED = bleedFor('glued');

type Ring = { inner: number; outer: number; color: string; outerCut: CircleCut; innerCut: CircleCut };

/**
 * A hand-cut paper disc with the remaining time as cut colored paper laid
 * on it. The face never changes while the timer runs, so it's its own drawing;
 * only the wedge redraws each frame, and it has no blur to recompute.
 */
export function PieDial({ fraction, colors, size }: PieDialProps) {
  const c = size / 2;
  const wedge = c * 0.8;
  const key = colors.join(',');
  const rings: Ring[] = useMemo(
    () =>
      ringBands(wedge, colors.length, c * 0.015).map((band, i) => ({
        ...band,
        color: paperColor(colors[i]),
        // Each ring edge is cut separately, so they don't line up like a machine-cut part.
        outerCut: circleCut(band.outer, `ring-${i}-out`),
        innerCut: circleCut(band.inner, `ring-${i}-in`),
      })),
    // The colors array is rebuilt by the store; its contents are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wedge, c, key],
  );

  return (
    <View style={{ width: size, height: size }}>
      <DialFace size={size} rings={rings} />
      <Wedge size={size} rings={rings} fraction={fraction} />
    </View>
  );
}

const DialFace = memo(function DialFace({ size, rings }: { size: number; rings: Ring[] }) {
  const theme = useTheme();
  const id = useSvgId('face');
  const c = size / 2;
  const face = c - 3;
  const outline = useMemo(() => polygonPath(cutCircle(c, c, face, circleCut(face, 'dial-face'))), [c, face]);

  return (
    <Svg width={size + BLEED * 2} height={size + BLEED * 2} style={[styles.layer, { left: -BLEED, top: -BLEED }]}>
      <Defs>
        <ClipPath id={`${id}c`}>
          <Path d={outline} />
        </ClipPath>
      </Defs>
      <G transform={`translate(${BLEED} ${BLEED})`}>
        {/* Glued flat to the page: only a hairline of shadow where the paper's thickness meets it. */}
        <PaperShadow d={outline} lift="glued" id={id} width={size} height={size} />
        <Path d={outline} fill={theme.face} />
        <G clipPath={`url(#${id}c)`}>
          <Grain color={theme.face} width={size} height={size} seed="dial-face" />
        </G>
        <CutEdge d={outline} clipId={`${id}c`} />
        {/* Faint full-size ghost of the wedge so an empty dial still shows its colors. */}
        {rings.map((ring) => (
          <Path
            key={`ghost-${ring.outer}`}
            d={cutRingPath(c, c, ring.inner, ring.outer, 1, ring.outerCut, ring.innerCut)}
            fill={ring.color}
            fillRule="evenodd"
            opacity={0.14}
          />
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
              strokeLinecap="butt"
            />
          );
        })}
      </G>
    </Svg>
  );
});

function Wedge({ size, rings, fraction }: { size: number; rings: Ring[]; fraction: number }) {
  const look = usePaperLook();
  const id = useSvgId('wedge');
  const c = size / 2;
  const paths = rings.map((ring) => ({
    color: ring.color,
    d: cutRingPath(c, c, ring.inner, ring.outer, fraction, ring.outerCut, ring.innerCut),
  }));
  const all = paths.map((p) => p.d).join('');
  if (!all) return null;
  const glued = look.lifts.glued[0];

  return (
    <Svg width={size} height={size} style={styles.layer}>
      <Defs>
        <ClipPath id={`${id}c`}>
          <Path d={all} clipRule="evenodd" />
        </ClipPath>
      </Defs>
      {/* Glued to the face: a hairline offset shadow, with no blur to redo every frame. */}
      <G transform={`translate(0 ${glued.dy})`}>
        <Path d={all} fill={look.shadowColor} fillRule="evenodd" opacity={glued.opacity} />
      </G>
      {paths.map((p, i) => (
        <Path key={i} d={p.d} fill={p.color} fillRule="evenodd" />
      ))}
      <G clipPath={`url(#${id}c)`}>
        <Grain color={rings[0].color} width={size} height={size} seed="dial-wedge" />
      </G>
      {paths.map((p, i) => (
        <CutEdge key={i} d={p.d} clipId={`${id}c`} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, top: 0 },
});
