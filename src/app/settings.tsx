import Constants from 'expo-constants';
import { router } from 'expo-router';
import { CircleMinus, type LucideIcon } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useState } from 'react';

import { ColorModeSwitch, ColorSwatches } from '@/components/color-swatches';
import { Sheet } from '@/components/sheet';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { isHexColor } from '@/constants/timer-colors';
import { useTheme } from '@/hooks/use-theme';
import { useFavorites } from '@/store/favorites';
import { useSettings } from '@/store/settings';
import { formatShort } from '@/timer/engine';

// The commit is set by the deploy workflow so each release is identifiable.
const VERSION = `Version ${Constants.expoConfig?.version ?? '?'} (${process.env.EXPO_PUBLIC_COMMIT?.slice(0, 7) ?? 'dev'})`;

export default function SettingsScreen() {
  const theme = useTheme();
  const settings = useSettings();
  const [hex, setHex] = useState(settings.color);
  // Opened directly on the web there's nothing to go back to.
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Sheet title="Settings" onClose={close}>
      <ScrollView contentContainerStyle={styles.container}>

        <Section title="Timer color">
          <ColorModeSwitch
            multi={settings.multiColor}
            accent={settings.color}
            onChange={(multi) => {
              settings.setMultiColor(multi);
              // Leaving multi mode keeps the first ring as the single color.
              if (!multi) setHex(settings.colors[0]);
            }}
          />
          <ColorSwatches
            value={settings.multiColor ? settings.colors : [settings.color]}
            multi={settings.multiColor}
            onPress={(c) => {
              if (settings.multiColor) return settings.toggleColor(c);
              settings.setColor(c);
              setHex(c);
            }}
          />
          {settings.multiColor ? (
            <ThemedText type="small" themeColor="textSecondary">
              Each color is a ring on the dial, in the order picked from the outside in.
            </ThemedText>
            ) : (
            <View style={styles.hexRow}>
              <View style={[styles.hexPreview, { backgroundColor: isHexColor(hex) ? hex : 'transparent', borderColor: theme.backgroundSelected }]} />
              <TextInput
                value={hex}
                onChangeText={(text) => {
                  const next = text.startsWith('#') ? text : `#${text}`;
                  setHex(next);
                  if (isHexColor(next)) settings.setColor(next);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={7}
                accessibilityLabel="Custom color hex code"
                style={[styles.hexInput, { color: theme.text, backgroundColor: theme.face }]}
              />
              <ThemedText type="small" themeColor="textSecondary">
                Custom color
              </ThemedText>
            </View>
          )}
        </Section>

        <Section title="When time is up">
          {Platform.OS !== 'web' && (
            <Toggle label="Vibrate" value={settings.haptics} onChange={() => settings.toggle('haptics')} />
          )}
          <Toggle
            label="Keep the screen on while running"
            value={settings.keepAwake}
            onChange={() => settings.toggle('keepAwake')}
          />
        </Section>

        <FavoritesSection />

        <Pressable
          onPress={() => router.push('/releases')}
          accessibilityRole="button"
          accessibilityHint="Shows what changed in each version"
          hitSlop={8}
          style={({ pressed }) => [styles.version, pressed && { opacity: 0.6 }]}>
          <ThemedText type="small" themeColor="textSecondary">
            {VERSION}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </Sheet>
  );
}

function FavoritesSection() {
  const theme = useTheme();
  const { favorites, remove, restoreDefaults } = useFavorites();
  return (
    <Section title="Favorites">
      {favorites.length === 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          Add favorites with the ☆ button on the timer screen.
        </ThemedText>
      )}
      {favorites.map((f) => (
        <View key={f.id} style={styles.favRow}>
          <ThemedText style={styles.favLabel}>{formatShort(f.durationMs)}</ThemedText>
          <IconButton
            label={`Remove ${formatShort(f.durationMs)}`}
            onPress={() => remove(f.id)}
            icon={CircleMinus}
          />
        </View>
      ))}
      <Pressable onPress={restoreDefaults} accessibilityRole="button" style={styles.restore}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Restore default favorites
        </ThemedText>
      </Pressable>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {children}
    </View>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  const color = useSettings((s) => s.color);
  const theme = useTheme();
  return (
    <View style={styles.toggle}>
      <ThemedText>{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ true: color, false: theme.backgroundSelected }}
        thumbColor="#FFFFFF"
        // react-native-web colors the "on" thumb separately; not in RN's types.
        {...{ activeThumbColor: '#FFFFFF' }}
      />
    </View>
  );
}

function IconButton({
  label,
  icon: Glyph,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }]}>
      <Glyph size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four, gap: Spacing.five },
  section: { gap: Spacing.three },
  hexRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  hexPreview: { width: 28, height: 28, borderRadius: 14, borderWidth: 1 },
  hexInput: {
    width: 110,
    height: 40,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  toggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  favRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  favLabel: { flex: 1, fontFamily: Fonts.bold },
  iconButton: { padding: Spacing.two },
  restore: { alignSelf: 'flex-start', paddingVertical: Spacing.one },
  version: { alignSelf: 'center', paddingVertical: Spacing.one },
});
