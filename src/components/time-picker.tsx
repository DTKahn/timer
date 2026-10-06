import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DurationParts } from '@/timer/engine';

const UNITS = [
  { key: 'hours', label: 'hours', short: 'h', max: 23 },
  { key: 'minutes', label: 'minutes', short: 'm', max: 59 },
  { key: 'seconds', label: 'seconds', short: 's', max: 59 },
] as const;

/** Each box holds two digits and the unit letter, beside a column of up and down arrows. */
const BOX_WIDTH = 72;
const STEP_SIZE = 28;
const STEP_HEIGHT = 32;
const BOX_HEIGHT = STEP_HEIGHT * 2 + Spacing.one;
export const TIME_PICKER_HEIGHT = BOX_HEIGHT;

type TimePickerProps = { value: DurationParts; onChange: (value: DurationParts) => void };

export function TimePicker({ value, onChange }: TimePickerProps) {
  return (
    <View style={[styles.row, styles.units]}>
      {UNITS.map((unit) => (
        <UnitField
          key={unit.key}
          label={unit.label}
          short={unit.short}
          max={unit.max}
          value={value[unit.key]}
          onChange={(n) => onChange({ ...value, [unit.key]: n })}
        />
      ))}
    </View>
  );
}

function UnitField({
  label,
  short,
  max,
  value,
  onChange,
}: {
  label: string;
  short: string;
  max: number;
  value: number;
  onChange: (n: number) => void;
}) {
  const theme = useTheme();
  const input = useRef<TextInput>(null);
  const step = (delta: number) => onChange((value + delta + max + 1) % (max + 1));

  return (
    <View style={styles.unit}>
      {/* Tapping the letter (or anywhere in the box) types into the number. */}
      <Pressable
        onPress={() => input.current?.focus()}
        accessible={false}
        style={[styles.box, { backgroundColor: theme.face }]}>
        <TextInput
          ref={input}
          value={String(value).padStart(2, '0')}
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, '').slice(-2);
            onChange(Math.min(max, Number(digits || 0)));
          }}
          selectTextOnFocus
          keyboardType="number-pad"
          maxLength={3}
          accessibilityLabel={label}
          style={[styles.input, { color: theme.text }]}
        />
        {/* The input carries the full name for screen readers. */}
        <ThemedText themeColor="textSecondary" style={styles.short} accessible={false}>
          {short}
        </ThemedText>
      </Pressable>
      <View style={styles.steps}>
        <StepButton label={`More ${label}`} onPress={() => step(1)} up />
        <StepButton label={`Fewer ${label}`} onPress={() => step(-1)} />
      </View>
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
      hitSlop={{ left: 4, right: 8 }}
      style={({ pressed }) => [styles.step, pressed && { backgroundColor: theme.backgroundElement }]}>
      {up ? <ChevronUp size={22} color={theme.textSecondary} /> : <ChevronDown size={22} color={theme.textSecondary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  units: { gap: Spacing.two + Spacing.one },
  unit: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  steps: { gap: Spacing.one },
  box: {
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  short: { fontSize: 22, lineHeight: 28 },
  step: {
    width: STEP_SIZE,
    height: STEP_HEIGHT,
    borderRadius: STEP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    // Just wide enough for two digits, so the letter sits right after them.
    width: 42,
    height: BOX_HEIGHT,
    padding: 0,
    textAlign: 'center',
    fontSize: 34,
    fontFamily: Fonts.bold,
    fontVariant: ['tabular-nums'],
  },
});
