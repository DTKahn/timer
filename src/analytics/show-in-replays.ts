/**
 * Spread onto a TextInput whose value holds nothing personal, such as a timer
 * duration, so PostHog session recordings show what was typed instead of ***.
 * On the web it becomes data-ph-unmask="true", which maskInput checks.
 * React Native's types don't list dataSet, only react-native-web reads it.
 */
export const SHOW_IN_REPLAYS = { dataSet: { phUnmask: 'true' } } as object;
