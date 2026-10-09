import { memo, useId, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { ClipPath, Defs, FeGaussianBlur, Filter, G, Image, Path, Rect } from 'react-native-svg';

import { PaperLook, type Lift } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { edgeTones, fiberOpacity } from '@/paper/grain';
import { cutOutline, hash, polygonPath, seededTilt, tornOutline } from '@/paper/outline';
import { tornFibers } from '@/paper/torn';

const FIBERS_LIGHT = require('@/assets/images/paper-fibers-light.png');
const FIBERS_DARK = require('@/assets/images/paper-fibers-dark.png');
/** The fiber images are 480px, drawn at 160pt per tile so fibers stay fine on 3x screens. */
export const GRAIN_TILE = 160;
/** How many torn-edge strands to draw: at phone scale half the full count looks the same and halves the path data. */
const TORN_DENSITY = 0.5;

export type { Lift };

export function usePaperLook() {
  return PaperLook[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

/** SVG ids must be unique on the web page, and useId's colons aren't valid in url(). */
export function useSvgId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

/** Room around a piece for its shadow (and torn fibers) at this lift. */
export function bleedFor(lift: Lift) {
  const layers = [...PaperLook.light.lifts[lift], ...PaperLook.dark.lifts[lift]];
  return Math.ceil(Math.max(...layers.map((l) => l.dy + l.blur * 3))) + 4;
}

function Tiles({ href, width, height, seed, x, y }: { href: number; width: number; height: number; seed: string; x: number; y: number }) {
  const h = hash(seed);
  const ox = x - (h % GRAIN_TILE);
  const oy = y - ((h >>> 9) % GRAIN_TILE);
  const tiles = [];
  for (let ty = oy; ty < y + height; ty += GRAIN_TILE) {
    for (let tx = ox; tx < x + width; tx += GRAIN_TILE) {
      tiles.push(
        <Image key={`${tx},${ty}`} href={href} x={tx} y={ty} width={GRAIN_TILE} height={GRAIN_TILE} preserveAspectRatio="none" />,
      );
    }
  }
  return <>{tiles}</>;
}

/**
 * The fiber grain of a sheet of `color`, covering a w×h area: lighter and
 * darker fibers of the sheet's own color. The seed shifts it so neighboring
 * pieces don't show the same fibers.
 */
export function Grain({ color, width, height, seed, x = 0, y = 0 }: { color: string; width: number; height: number; seed: string; x?: number; y?: number }) {
  const { light, dark } = fiberOpacity(color);
  return (
    <>
      <G opacity={light}>
        <Tiles href={FIBERS_LIGHT} width={width} height={height} seed={seed} x={x} y={y} />
      </G>
      <G opacity={dark}>
        <Tiles href={FIBERS_DARK} width={width} height={height} seed={`${seed}:dark`} x={x} y={y} />
      </G>
    </>
  );
}

/**
 * A piece's shadow for its lift: one or two blurred, offset copies of its
 * silhouette. Needs the piece's coordinates (draw it inside the piece's G).
 */
export function PaperShadow({ d, lift, id, width, height }: { d: string; lift: Lift; id: string; width: number; height: number }) {
  const bleed = bleedFor(lift);
  const look = usePaperLook();
  return (
    <>
      {look.lifts[lift].map((layer, i) => (
        <G key={i} transform={`translate(0 ${layer.dy})`}>
          {layer.blur >= 0.3 && (
            <Defs>
              <Filter id={`${id}s${i}`} filterUnits="userSpaceOnUse" x={-bleed} y={-bleed} width={width + bleed * 2} height={height + bleed * 2}>
                <FeGaussianBlur stdDeviation={layer.blur} />
              </Filter>
            </Defs>
          )}
          <Path
            d={d}
            fill={look.shadowColor}
            opacity={layer.opacity}
            filter={layer.blur >= 0.3 ? `url(#${id}s${i})` : undefined}
          />
        </G>
      ))}
    </>
  );
}

export type PaperProps = {
  color: string;
  /** A stable name for this piece; it decides the exact cut, so the piece looks the same every time. */
  seed: string;
  /** Corner radius; 'round' makes a circle or pill from the piece's shorter side. */
  radius?: number | 'round';
  /** Scissor cut for small pieces, torn by hand for big ones. */
  edge?: 'cut' | 'torn';
  /** Glued flat to what's under it, raised (a button), or lifted (a panel floating above). */
  lift?: Lift;
  /** Largest tilt in degrees; the actual tilt is seeded and shrinks for wide pieces. */
  tilt?: number;
  /** Drawn inside the outline instead of the flat color (e.g. the rainbow), in the piece's coordinates. */
  art?: (width: number, height: number) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * A piece of construction paper filling its parent: a seeded scissor-cut or
 * torn outline, the paper's color with its fiber grain, and a shadow for how
 * high it sits. Put it first inside a view; the view's other children sit on
 * the paper.
 */
export const Paper = memo(function Paper({
  color,
  seed,
  radius = 12,
  edge = 'cut',
  lift = 'raised',
  tilt = 1,
  art,
  style,
}: PaperProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const id = useSvgId('paper');
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width: w, height: h } = size;
  const bleed = bleedFor(lift);

  const shape = useMemo(() => {
    if (w <= 0 || h <= 0) return null;
    const r = radius === 'round' ? Math.min(w, h) / 2 : radius;
    const options = { radius: r, seed, tilt: seededTilt(seed, Math.max(w, h), tilt) };
    if (edge === 'torn') {
      const { edge: main, fringe } = tornOutline(w, h, options);
      return { main: polygonPath(main), silhouette: polygonPath(fringe), fibers: tornFibers(main, fringe, seed, TORN_DENSITY) };
    }
    const main = polygonPath(cutOutline(w, h, options));
    return { main, silhouette: main, fibers: null };
  }, [w, h, radius, edge, seed, tilt]);

  const tones = edgeTones(color, scheme === 'dark');

  return (
    <View
      pointerEvents="none"
      style={[styles.fill, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
      }}>
      {shape && (
        <Svg width={w + bleed * 2} height={h + bleed * 2} style={{ position: 'absolute', left: -bleed, top: -bleed }}>
          <Defs>
            <ClipPath id={`${id}c`}>
              <Path d={shape.main} />
            </ClipPath>
          </Defs>
          <G transform={`translate(${bleed} ${bleed})`}>
            <PaperShadow d={shape.silhouette} lift={lift} id={id} width={w} height={h} />
            {shape.fibers && (
              <G strokeLinecap="round" fill="none">
                <Path d={shape.fibers.mat[0]} stroke={tones[0]} strokeWidth={0.16} strokeOpacity={0.7} />
                <Path d={shape.fibers.mat[1]} stroke={tones[1]} strokeWidth={0.2} strokeOpacity={0.85} />
                <Path d={shape.fibers.mat[2]} stroke={tones[2]} strokeWidth={0.22} strokeOpacity={0.95} />
                <Path d={shape.fibers.wisps} stroke={tones[1]} strokeWidth={0.14} strokeOpacity={0.6} />
              </G>
            )}
            {art ? <G clipPath={`url(#${id}c)`}>{art(w, h)}</G> : <Path d={shape.main} fill={color} />}
            <G clipPath={`url(#${id}c)`}>
              <Grain color={color} width={w + 8} height={h + 8} seed={seed} x={-4} y={-4} />
            </G>
            {shape.fibers ? (
              <G strokeLinecap="round" fill="none">
                <Path d={shape.fibers.colored} stroke={tones[0]} strokeWidth={0.2} strokeOpacity={0.9} />
                <Path d={shape.fibers.crossing} stroke={tones[1]} strokeWidth={0.16} strokeOpacity={0.6} />
              </G>
            ) : (
              <CutEdge d={shape.main} clipId={`${id}c`} />
            )}
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

/** A full-size sheet of background paper with its grain, behind a whole screen. */
export function PaperBackdrop({ color, seed = 'backdrop' }: { color: string; seed?: string }) {
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
          <Grain color={color} width={size.width} height={size.height} seed={seed} />
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
