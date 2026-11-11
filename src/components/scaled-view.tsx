import { View, type ViewProps } from 'react-native';

type ScaledViewProps = ViewProps & {
  /** 1 or less; below 1 the content lays out in a larger box and is shrunk to fit. */
  scale: number;
  /** The space the view fills on screen. */
  width: number;
  height: number;
};

/**
 * Fills a `width` × `height` area. At a scale below 1 the children lay out as
 * if the area were `1 / scale` times larger, then everything is shrunk evenly,
 * so screens too small for the layout show all of it, just smaller.
 */
export function ScaledView({ scale, width, height, style, ...rest }: ScaledViewProps) {
  if (scale >= 1) return <View style={[{ flex: 1 }, style]} {...rest} />;
  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <View
        style={[
          { width: width / scale, height: height / scale, transform: [{ scale }], transformOrigin: 'top left' },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}
