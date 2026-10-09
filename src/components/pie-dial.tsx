import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, FeGaussianBlur, Filter, G, Line, Path } from 'react-native-svg';

import { GrainTiles, grainScale, usePaperLook, useSvgId } from '@/components/paper';
import { paperColor } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';
import { polar, ringBands } from '@/timer/dial-geometry';
import { circleFacets, facetedCircle, facetedRingPath, polygonPath, type Facets } from '@/paper/outline';

type PieDialProps = {
  /** Fraction of time remaining, 1 → 0. */
  fraction: number;
  /** One color fills the wedge; several split it into rings, outermost first. */
  colors: string[];
  size: number;
};

const TICKS = Array.from({ length: 60 }, (_, i) => i);
/** The drawing overflows the dial's box by this much so the face's shadow isn't clipped. */
const BLEED = 12;

type Ring = { inner: number; outer: number; color: string; outerFacets: Facets; innerFacets: Facets };

/**
 * A scissor-cut paper disc with the remaining time as cut colored paper laid
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
        // Each ring edge has its own fixed cuts, so they don't line up like a machine-cut part.
        outerFacets: circleFacets(band.outer, `ring-${i}-out`),
        innerFacets: circleFacets(band.inner, `ring-${i}-in`),
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
  const look = usePaperLook();
  const id = useSvgId('face');
  const c = size / 2;
  const face = c - 3;
  const outline = useMemo(() => polygonPath(facetedCircle(c, c, face, circleFacets(face, 'dial-face'))), [c, face]);

  return (
    <Svg width={size + BLEED * 2} height={size + BLEED * 2} style={[styles.layer, { left: -BLEED, top: -BLEED }]}>
      <Defs>
        <ClipPath id={`${id}c`}>
          <Path d={outline} />
        </ClipPath>
        <Filter id={`${id}s`} filterUnits="userSpaceOnUse" x={0} y={0} width={size + BLEED * 2} height={size + BLEED * 2}>
          <FeGaussianBlur stdDeviation={3} />
        </Filter>
      </Defs>
      <G transform={`translate(${BLEED} ${BLEED})`}>
        <G transform="translate(1 3)">
          <Path d={outline} fill="#000" opacity={look.shadow * 1.3} filter={`url(#${id}s)`} />
        </G>
        <Path d={outline} fill={theme.face} />
        <G clipPath={`url(#${id}c)`} opacity={look.grain * grainScale(theme.face)}>
          <GrainTiles width={size} height={size} seed="dial-face" />
        </G>
        {/* Faint full-size ghost of the wedge so an empty dial still shows its colors. */}
        {rings.map((ring) => (
          <Path
            key={`ghost-${ring.outer}`}
            d={facetedRingPath(c, c, ring.inner, ring.outer, 1, ring.outerFacets, ring.innerFacets)}
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
    d: facetedRingPath(c, c, ring.inner, ring.outer, fraction, ring.outerFacets, ring.innerFacets),
  }));
  const all = paths.map((p) => p.d).join('');
  if (!all) return null;

  return (
    <Svg width={size} height={size} style={styles.layer}>
      <Defs>
        <ClipPath id={`${id}c`}>
          <Path d={all} clipRule="evenodd" />
        </ClipPath>
      </Defs>
      {/* A soft-edged shadow from two stacked offsets rather than a blur, which would be redone every frame. */}
      <G transform="translate(0.4 1.6)">
        <Path d={all} fill="#000" fillRule="evenodd" opacity={look.shadow * 0.45} />
      </G>
      <G transform="translate(0.2 0.7)">
        <Path d={all} fill="#000" fillRule="evenodd" opacity={look.shadow * 0.5} />
      </G>
      {paths.map((p, i) => (
        <Path key={i} d={p.d} fill={p.color} fillRule="evenodd" />
      ))}
      <G clipPath={`url(#${id}c)`} opacity={look.grain}>
        <GrainTiles width={size} height={size} seed="dial-wedge" />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, top: 0 },
});
