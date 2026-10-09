import { memo, useId, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { ClipPath, Defs, FeGaussianBlur, Filter, G, Image, Path, Rect } from 'react-native-svg';

import { PaperLook } from '@/constants/theme';
import { isHexColor } from '@/constants/timer-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cutOutline, hash, polygonPath, seededTilt, tornOutline } from '@/paper/outline';

const GRAIN = require('@/assets/images/paper-grain.png');
/** The grain image is 480px, drawn at 160pt per tile so fibers stay fine on 3x screens. */
export const GRAIN_TILE = 160;
/** Room around a piece for its shadow and edge; the drawing overflows the piece's box by this much. */
const BLEED = 14;

export function usePaperLook() {
  return PaperLook[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

/** SVG ids must be unique on the web page, and useId's colons aren't valid in url(). */
export function useSvgId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

/**
 * Grain image tiles covering a w×h area, shifted by the seed so neighboring
 * pieces don't show the same fibers.
 */
export function GrainTiles({ width, height, seed, x = 0, y = 0 }: { width: number; height: number; seed: string; x?: number; y?: number }) {
  const h = hash(seed);
  const ox = x - (h % GRAIN_TILE);
  const oy = y - ((h >>> 9) % GRAIN_TILE);
  const tiles = [];
  for (let ty = oy; ty < y + height; ty += GRAIN_TILE) {
    for (let tx = ox; tx < x + width; tx += GRAIN_TILE) {
      tiles.push(
        <Image
          key={`${tx},${ty}`}
          href={GRAIN}
          x={tx}
          y={ty}
          width={GRAIN_TILE}
          height={GRAIN_TILE}
          preserveAspectRatio="none"
        />,
      );
    }
  }
  return <>{tiles}</>;
}

export type PaperProps = {
  color: string;
  /** A stable name for this piece; it decides the exact cut, so the piece looks the same every time. */
  seed: string;
  /** Corner radius; 'round' makes a circle or pill from the piece's shorter side. */
  radius?: number | 'round';
  /** Scissor cut for small pieces, torn with a fiber fringe for big ones. */
  edge?: 'cut' | 'torn';
  /** How many layers of paper it sits above what's under it; deeper casts a larger shadow. */
  elevation?: 0 | 1 | 2 | 3;
  /** Largest tilt in degrees; the actual tilt is seeded and shrinks for wide pieces. */
  tilt?: number;
  /** Drawn inside the outline instead of the flat color (e.g. the rainbow), in the piece's coordinates. */
  art?: (width: number, height: number) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * A piece of construction paper filling its parent: a seeded scissor-cut or
 * torn outline, flat paper color with fiber grain, and a short soft shadow.
 * Put it first inside a view; the view's other children sit on the paper.
 */
export const Paper = memo(function Paper({
  color,
  seed,
  radius = 12,
  edge = 'cut',
  elevation = 1,
  tilt = 1,
  art,
  style,
}: PaperProps) {
  const look = usePaperLook();
  const id = useSvgId('paper');
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width: w, height: h } = size;

  const outline = useMemo(() => {
    if (w <= 0 || h <= 0) return null;
    const r = radius === 'round' ? Math.min(w, h) / 2 : radius;
    const options = { radius: r, seed, tilt: seededTilt(seed, Math.max(w, h), tilt) };
    if (edge === 'torn') {
      const { edge: main, fringe } = tornOutline(w, h, options);
      return { main: polygonPath(main), fringe: polygonPath(fringe) };
    }
    return { main: polygonPath(cutOutline(w, h, options)), fringe: null };
  }, [w, h, radius, edge, seed, tilt]);

  // Short, soft shadow: paper resting on paper, a bit longer per layer.
  const blur = 0.8 + elevation * 0.9;
  const drop = 0.6 + elevation * 0.9;
  const shadowOpacity = Math.min(0.9, look.shadow * (1 + (elevation - 1) * 0.25));

  return (
    <View
      pointerEvents="none"
      style={[styles.fill, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
      }}>
      {outline && (
        <Svg
          width={w + BLEED * 2}
          height={h + BLEED * 2}
          style={{ position: 'absolute', left: -BLEED, top: -BLEED }}>
          <Defs>
            <ClipPath id={`${id}c`}>
              <Path d={outline.main} />
            </ClipPath>
            {elevation > 0 && (
              <Filter
                id={`${id}s`}
                filterUnits="userSpaceOnUse"
                x={-BLEED}
                y={-BLEED}
                width={w + BLEED * 2}
                height={h + BLEED * 2}>
                <FeGaussianBlur stdDeviation={blur} />
              </Filter>
            )}
          </Defs>
          <G transform={`translate(${BLEED} ${BLEED})`}>
            {elevation > 0 && (
              <G transform={`translate(${drop * 0.35} ${drop})`}>
                <Path d={outline.fringe ?? outline.main} fill="#000" opacity={shadowOpacity} filter={`url(#${id}s)`} />
              </G>
            )}
            {outline.fringe && <Path d={outline.fringe} fill={mix(color, '#FFFFFF', look.fringe)} />}
            {art ? <G clipPath={`url(#${id}c)`}>{art(w, h)}</G> : <Path d={outline.main} fill={color} />}
            <G clipPath={`url(#${id}c)`} opacity={look.grain}>
              <GrainTiles width={w + 8} height={h + 8} seed={seed} x={-4} y={-4} />
            </G>
            {edge === 'cut' && <CutEdge d={outline.main} clipId={`${id}c`} />}
          </G>
        </Svg>
      )}
    </View>
  );
});

/**
 * The cut itself: a hairline of slightly paler, uneven fibers just inside the
 * edge, where the scissors sliced through the paper. It's the outline stroked
 * twice (once solid, once broken up), clipped to the piece so only the inner
 * half shows.
 */
export function CutEdge({ d, clipId }: { d: string; clipId: string }) {
  const look = usePaperLook();
  return (
    <G clipPath={`url(#${clipId})`}>
      <Path d={d} fill="none" stroke="#FFFFFF" strokeOpacity={look.cutFibers} strokeWidth={0.8} />
      <Path
        d={d}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity={look.cutFibers}
        strokeWidth={0.8}
        strokeDasharray="5 3 2 4 9 2 3 6"
      />
    </G>
  );
}

/** `color` moved `t` of the way toward `toward` (both hex). */
function mix(color: string, toward: string, t: number) {
  if (!isHexColor(color) || !isHexColor(toward)) return color;
  const rgb = (hex: string) => {
    let h = hex.replace('#', '');
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  };
  const [a, b] = [rgb(color), rgb(toward)];
  return `#${a.map((c, i) => Math.round(c + (b[i] - c) * t).toString(16).padStart(2, '0')).join('')}`;
}

/** A full-size sheet of background paper with its grain, behind a whole screen. */
export function PaperBackdrop({ color, seed = 'backdrop' }: { color: string; seed?: string }) {
  const look = usePaperLook();
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <View
      pointerEvents="none"
      style={[styles.fill, { backgroundColor: color }]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
      }}>
      {size.width > 0 && (
        <Svg width={size.width} height={size.height}>
          <Rect width={size.width} height={size.height} fill={color} />
          <G opacity={look.grain}>
            <GrainTiles width={size.width} height={size.height} seed={seed} />
          </G>
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Behind the piece's own content: on the web an absolutely positioned layer
  // would otherwise paint over unpositioned siblings like icons and inputs.
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 },
});
