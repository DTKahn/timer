import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DurationParts } from '@/timer/engine';

const UNITS = [
  { key: 'hours', label: 'hours', max: 23 },
  { key: 'minutes', label: 'min', max: 59 },
  { key: 'seconds', label: 'sec', max: 59 },
] as const;

type TimePickerProps = { value: DurationParts; onChange: (value: DurationParts) => void };

export function TimePicker({ value, onChange }: TimePickerProps) {
  return (
    <View style={styles.row}>
      {UNITS.map((unit, i) => (
        <View key={unit.key} style={styles.row}>
          {i > 0 && <ThemedText style={styles.colon}>:</ThemedText>}
          <UnitField
            label={unit.label}
            max={unit.max}
            value={value[unit.key]}
            onChange={(n) => onChange({ ...value, [unit.key]: n })}
          />
        </View>
      ))}
    </View>
  );
}

function UnitField({
  label,
  max,
  value,
  onChange,
}: {
  label: string;
  max: number;
  value: number;
  onChange: (n: number) => void;
}) {
  const theme = useTheme();
  const step = (delta: number) => onChange((value + delta + max + 1) % (max + 1));

  return (
    <View style={styles.unit}>
      <StepButton label={`More ${label}`} onPress={() => step(1)} up />
      <TextInput
        value={String(value).padStart(2, '0')}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(-2);
          onChange(Math.min(max, Number(digits || 0)));
        }}
        selectTextOnFocus
        keyboardType="number-pad"
        maxLength={3}
        accessibilityLabel={label}
        style={[styles.input, { color: theme.text, backgroundColor: theme.face }]}
      />
      <StepButton label={`Fewer ${label}`} onPress={() => step(-1)} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

function StepButton({ label, onPress, up }: { label: string; onPress: () => void; up?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.step, pressed && { backgroundColor: theme.backgroundElement }]}>
      {up ? <ChevronUp size={22} color={theme.textSecondary} /> : <ChevronDown size={22} color={theme.textSecondary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  colon: { fontSize: 40, lineHeight: 48, fontFamily: Fonts.bold, marginBottom: 24, marginHorizontal: Spacing.one },
  unit: { alignItems: 'center', gap: Spacing.one },
  step: { width: 64, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  input: {
    width: 72,
    height: 72,
    borderRadius: Spacing.three,
    textAlign: 'center',
    fontSize: 44,
    fontFamily: Fonts.bold,
    fontVariant: ['tabular-nums'],
  },
});
