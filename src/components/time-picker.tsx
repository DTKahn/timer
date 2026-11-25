import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SHOW_IN_REPLAYS } from '@/analytics/show-in-replays';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DurationParts } from '@/timer/engine';

const UNITS = [
  { key: 'hours', label: 'hours', short: 'h', max: 23 },
  { key: 'minutes', label: 'minutes', short: 'm', max: 59 },
  { key: 'seconds', label: 'seconds', short: 's', max: 59 },
] as const;

/** Each box holds two digits and the unit letter, beside a column of up and down arrows. Sizes at full scale. */
const BOX_WIDTH = 72;
const STEP_SIZE = 28;
const STEP_HEIGHT = 32;
const BOX_HEIGHT = STEP_HEIGHT * 2 + Spacing.one;
const UNITS_GAP = Spacing.two + Spacing.one;
export const TIME_PICKER_HEIGHT = BOX_HEIGHT;
export const TIME_PICKER_WIDTH = UNITS.length * (BOX_WIDTH + Spacing.one + STEP_SIZE) + (UNITS.length - 1) * UNITS_GAP;

type TimePickerProps = {
  value: DurationParts;
  onChange: (value: DurationParts) => void;
  /** Multiplies every size, so the picker fits small screens. */
  scale?: number;
};

export function TimePicker({ value, onChange, scale = 1 }: TimePickerProps) {
  const sized = sizes(scale);
  return (
    <View style={[styles.row, sized.units]}>
      {UNITS.map((unit) => (
        <UnitField
          key={unit.key}
          label={unit.label}
          short={unit.short}
          max={unit.max}
          value={value[unit.key]}
          onChange={(n) => onChange({ ...value, [unit.key]: n })}
          sized={sized}
        />
      ))}
    </View>
  );
}

function sizes(scale: number) {
  return {
    units: { gap: UNITS_GAP * scale },
    unit: { gap: Spacing.one * scale },
    box: { width: BOX_WIDTH * scale, height: BOX_HEIGHT * scale, borderRadius: Spacing.three * scale },
    short: { fontSize: 22 * scale, lineHeight: 28 * scale },
    // Just wide enough for two digits, so the letter sits right after them.
    input: { width: 42 * scale, height: BOX_HEIGHT * scale, fontSize: 34 * scale },
    steps: { gap: Spacing.one * scale },
    step: { width: STEP_SIZE * scale, height: STEP_HEIGHT * scale, borderRadius: (STEP_SIZE * scale) / 2 },
    chevron: 22 * scale,
  };
}

type Sizes = ReturnType<typeof sizes>;

function UnitField({
  label,
  short,
  max,
  value,
  onChange,
  sized,
}: {
  label: string;
  short: string;
  max: number;
  value: number;
  onChange: (n: number) => void;
  sized: Sizes;
}) {
  const theme = useTheme();
  const input = useRef<TextInput>(null);
  const step = (delta: number) => onChange((value + delta + max + 1) % (max + 1));

  return (
    <View style={[styles.unit, sized.unit]}>
      {/* Tapping the letter (or anywhere in the box) types into the number. */}
      <Pressable
        onPress={() => input.current?.focus()}
        accessible={false}
        style={[styles.box, sized.box, { backgroundColor: theme.face }]}>
        <TextInput
          ref={input}
          {...SHOW_IN_REPLAYS}
          value={String(value).padStart(2, '0')}
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, '').slice(-2);
            onChange(Math.min(max, Number(digits || 0)));
          }}
          selectTextOnFocus
          keyboardType="number-pad"
          maxLength={3}
          accessibilityLabel={label}
          style={[styles.input, sized.input, { color: theme.text }]}
        />
        {/* The input carries the full name for screen readers. */}
        <ThemedText themeColor="textSecondary" style={sized.short} accessible={false}>
          {short}
        </ThemedText>
      </Pressable>
      <View style={sized.steps}>
        <StepButton label={`More ${label}`} onPress={() => step(1)} sized={sized} up />
        <StepButton label={`Fewer ${label}`} onPress={() => step(-1)} sized={sized} />
      </View>
    </View>
  );
}

function StepButton({ label, onPress, sized, up }: { label: string; onPress: () => void; sized: Sizes; up?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ left: 4, right: 8 }}
      style={({ pressed }) => [styles.step, sized.step, pressed && { backgroundColor: theme.backgroundElement }]}>
      {up ? (
        <ChevronUp size={sized.chevron} color={theme.textSecondary} />
      ) : (
        <ChevronDown size={sized.chevron} color={theme.textSecondary} />
      )}
    </Pressable>
  );
}

// Sizes come from `sizes`, scaled to the screen.
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  unit: { flexDirection: 'row', alignItems: 'center' },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  step: { alignItems: 'center', justifyContent: 'center' },
  input: {
    padding: 0,
    textAlign: 'center',
    fontFamily: Fonts.bold,
    fontVariant: ['tabular-nums'],
  },
});
