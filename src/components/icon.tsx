import { SymbolView, type SymbolViewProps } from 'expo-symbols';

type IosSymbol = Exclude<SymbolViewProps['name'], object>;
type MaterialSymbol = NonNullable<Extract<SymbolViewProps['name'], object>['web']>;

type IconProps = {
  /** SF Symbol on iOS, Material Symbol on web and Android. */
  name: { ios: IosSymbol; web: MaterialSymbol };
  size?: number;
  color: string;
};

export function Icon({ name, size = 24, color }: IconProps) {
  return (
    <SymbolView
      name={{ ios: name.ios, android: name.web, web: name.web }}
      size={size}
      tintColor={color}
    />
  );
}
