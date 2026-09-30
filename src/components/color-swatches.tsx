import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Spacing } from '@/constants/theme';
import { contentColorOn, TIMER_COLORS } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';

type ColorSwatchesProps = { value: string; onChange: (color: string) => void };

export function ColorSwatches({ value, onChange }: ColorSwatchesProps) {
  const theme = useTheme();
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {TIMER_COLORS.map((c) => {
        const selected = c.value.toLowerCase() === value.toLowerCase();
        return (
          <Pressable
            key={c.value}
            onPress={() => onChange(c.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={c.name}
            style={({ pressed }) => [
              styles.swatch,
              { backgroundColor: c.value, borderColor: selected ? theme.text : 'transparent' },
              pressed && styles.pressed,
            ]}>
            {selected && (
              <Icon name={{ ios: 'checkmark', web: 'check' }} size={18} color={contentColorOn(c.value)} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
