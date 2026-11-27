import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { track } from '@/analytics/start-analytics';
import { ColorButton } from '@/components/color-picker';
import { SoundButton } from '@/components/sound-picker';
import { useSettings } from '@/store/settings';

jest.mock('@/analytics/start-analytics', () => ({ track: jest.fn() }));
// The icons ship as ES modules, which Jest doesn't transform; every icon draws nothing here.
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('@/platform/sounds', () => ({
  playSound: jest.fn(),
  preloadSounds: jest.fn(),
  stopSounds: jest.fn(),
}));

const mockTrack = track as jest.Mock;

beforeEach(async () => {
  mockTrack.mockClear();
  await act(() => useSettings.setState({ color: '#E5484D', multiColor: false, colors: ['#E5484D'], sound: 'bell' }));
});

describe('color picker', () => {
  it('sends the color tapped, which closes the picker', async () => {
    await render(<ColorButton />);
    await fireEvent.press(screen.getByLabelText('Change timer color'));
    await fireEvent.press(screen.getByLabelText('Brown'));
    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith('color picker closed', { color: 'Brown', colors: ['Brown'], multiple: false });
  });

  it('sends the current color when closed without a change', async () => {
    await render(<ColorButton />);
    await fireEvent.press(screen.getByLabelText('Change timer color'));
    await fireEvent.press(screen.getByLabelText('Close color picker'));
    expect(mockTrack).toHaveBeenCalledWith('color picker closed', { color: 'Red', colors: ['Red'], multiple: false });
  });

  it('sends every ring when Multiple mode is closed with Done', async () => {
    await act(() => useSettings.setState({ multiColor: true, colors: ['#E5484D'] }));
    await render(<ColorButton />);
    await fireEvent.press(screen.getByLabelText('Change timer color'));
    await fireEvent.press(screen.getByLabelText('Blue'));
    expect(mockTrack).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Done'));
    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith('color picker closed', { color: 'Red', colors: ['Red', 'Blue'], multiple: true });
  });
});

describe('sound picker', () => {
  it('sends only the sound selected when it closes, not the ones tried', async () => {
    await render(<SoundButton />);
    await fireEvent.press(screen.getByLabelText('Change completion sound'));
    await fireEvent.press(screen.getByLabelText('Silent'));
    await fireEvent.press(screen.getByLabelText('Guitar'));
    expect(mockTrack).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Done'));
    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith('sound picker closed', { sound: 'Guitar' });
  });

  it('sends the current sound when closed by tapping outside', async () => {
    await render(<SoundButton />);
    await fireEvent.press(screen.getByLabelText('Change completion sound'));
    await fireEvent.press(screen.getByLabelText('Close sound picker'));
    expect(mockTrack).toHaveBeenCalledWith('sound picker closed', { sound: 'Bell' });
  });
});
