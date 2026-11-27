import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { startAnalytics } from '@/analytics/start-analytics';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStoresHydrated } from '@/hooks/use-stores-hydrated';
import { TimerEffects } from '@/timer/timer-effects';

SplashScreen.preventAutoHideAsync();

const themes = {
  light: { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: Colors.light.background } },
  dark: { ...DarkTheme, colors: { ...DarkTheme.colors, background: Colors.dark.background } },
};

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const hydrated = useStoresHydrated();
  const [fontsLoaded, fontError] = useFonts({ Lato_400Regular, Lato_700Bold });
  // A font failure falls back to system fonts rather than blocking the app.
  const ready = hydrated && (fontsLoaded || !!fontError);

  useEffect(() => {
    startAnalytics();
  }, []);

  // Keep the splash up until fonts and saved timers load, so nothing flashes.
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <WebSafeArea>
      <ThemeProvider value={themes[scheme]}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="history" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="releases" options={{ presentation: 'modal' }} />
        </Stack>
        <TimerEffects />
      </ThemeProvider>
    </WebSafeArea>
  );
}

/**
 * On the web, Expo Router (from SDK 58) reports zero safe-area insets, so the timer would sit under
 * the iPhone's notch and home bar when opened from the home screen. The library's own provider
 * measures them from the browser's CSS `env(safe-area-inset-*)` values, as SDK 57 did. On iOS and
 * Android, Expo Router already provides the real insets.
 */
function WebSafeArea({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') return children;
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}
