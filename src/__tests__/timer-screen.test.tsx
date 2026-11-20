import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TimerScreen from '@/app/index';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
// The icons ship as ES modules, which Jest doesn't transform; every icon draws nothing here.
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('@/platform/alerts', () => ({ requestAlertPermission: jest.fn(() => Promise.resolve()) }));
jest.mock('@/platform/sounds', () => ({
  playSound: jest.fn(),
  preloadSounds: jest.fn(),
  prepareSound: jest.fn(),
  stopSounds: jest.fn(),
}));

const UPRIGHT = { width: 393, height: 852, scale: 3, fontScale: 1 };
const SIDEWAYS = { width: 852, height: 393, scale: 3, fontScale: 1 };

const rotate = (window: typeof UPRIGHT) => act(() => Dimensions.set({ window, screen: window }));

const METRICS = { frame: { x: 0, y: 0, ...UPRIGHT }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

beforeEach(() => rotate(UPRIGHT));

describe('timer screen pickers', () => {
  it.each([
    ['Change completion sound', 'Close sound picker'],
    ['Change timer color', 'Close color picker'],
  ])('stay open when the phone turns (%s)', async (button, backdrop) => {
    await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <TimerScreen />
      </SafeAreaProvider>,
    );
    fireEvent.press(screen.getByLabelText(button));
    expect(screen.getByLabelText(backdrop)).toBeVisible();

    await rotate(SIDEWAYS);
    expect(screen.getByLabelText(backdrop)).toBeVisible();

    await rotate(UPRIGHT);
    expect(screen.getByLabelText(backdrop)).toBeVisible();
  });
});
