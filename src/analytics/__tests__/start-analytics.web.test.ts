// Jest resolves the native variant by default, so the web module is imported
// explicitly. Each test loads a fresh copy so the once-per-page guard resets.
jest.mock('@vercel/analytics', () => ({ inject: jest.fn() }));
const mockPosthogInit = jest.fn();
jest.mock('../load-posthog', () => ({
  loadPosthog: () => Promise.resolve({ init: mockPosthogInit }),
}));

function load() {
  let mod!: typeof import('../start-analytics.web');
  let inject!: jest.Mock;
  jest.isolateModules(() => {
    mod = require('../start-analytics.web');
    inject = require('@vercel/analytics').inject;
  });
  inject.mockClear();
  mockPosthogInit.mockClear();
  return { startAnalytics: mod.startAnalytics, inject, posthogInit: mockPosthogInit };
}

test('starts both in production', async () => {
  const { startAnalytics, inject, posthogInit } = load();
  await startAnalytics('production');
  expect(inject).toHaveBeenCalledTimes(1);
  expect(inject).toHaveBeenCalledWith({ mode: 'production' });
  expect(posthogInit).toHaveBeenCalledTimes(1);
  expect(posthogInit).toHaveBeenCalledWith(
    expect.stringMatching(/^phc_/),
    expect.objectContaining({ capture_heatmaps: true, capture_dead_clicks: true }),
  );
});

test('does nothing on preview', async () => {
  const { startAnalytics, inject, posthogInit } = load();
  await startAnalytics('preview');
  expect(inject).not.toHaveBeenCalled();
  expect(posthogInit).not.toHaveBeenCalled();
});

test('does nothing when unset', async () => {
  const { startAnalytics, inject, posthogInit } = load();
  await startAnalytics(undefined);
  expect(inject).not.toHaveBeenCalled();
  expect(posthogInit).not.toHaveBeenCalled();
});

test('only starts once', async () => {
  const { startAnalytics, inject, posthogInit } = load();
  await startAnalytics('production');
  await startAnalytics('production');
  expect(inject).toHaveBeenCalledTimes(1);
  expect(posthogInit).toHaveBeenCalledTimes(1);
});

test('hides typed text in recordings, except in marked inputs', async () => {
  const { startAnalytics, posthogInit } = load();
  await startAnalytics('production');
  const { session_recording } = posthogInit.mock.calls[0][1];
  expect(session_recording.maskAllInputs).toBe(true);

  const maskInput = session_recording.maskInputFn;
  const element = (dataset: Record<string, string>) => ({ dataset }) as unknown as HTMLElement;
  expect(maskInput('05', element({ phUnmask: 'true' }))).toBe('05');
  expect(maskInput('secret', element({}))).toBe('******');
  expect(maskInput('secret', undefined)).toBe('******');
});
