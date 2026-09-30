import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

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

  // Keep the splash up until fonts and saved timers load, so nothing flashes.
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider value={themes[scheme]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <TimerEffects />
    </ThemeProvider>
  );
}
