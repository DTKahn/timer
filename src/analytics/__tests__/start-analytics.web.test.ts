// Jest resolves the native variant by default, so the web module is imported
// explicitly. Each test loads a fresh copy so the once-per-page guard resets.
jest.mock('@vercel/analytics', () => ({ inject: jest.fn() }));

function load() {
  let mod!: typeof import('../start-analytics.web');
  let inject!: jest.Mock;
  jest.isolateModules(() => {
    mod = require('../start-analytics.web');
    inject = require('@vercel/analytics').inject;
  });
  inject.mockClear();
  return { startAnalytics: mod.startAnalytics, inject };
}

test('injects in production', () => {
  const { startAnalytics, inject } = load();
  startAnalytics('production');
  expect(inject).toHaveBeenCalledTimes(1);
  expect(inject).toHaveBeenCalledWith({ mode: 'production' });
});

test('does nothing on preview', () => {
  const { startAnalytics, inject } = load();
  startAnalytics('preview');
  expect(inject).not.toHaveBeenCalled();
});

test('does nothing when unset', () => {
  const { startAnalytics, inject } = load();
  startAnalytics(undefined);
  expect(inject).not.toHaveBeenCalled();
});

test('only injects once', () => {
  const { startAnalytics, inject } = load();
  startAnalytics('production');
  startAnalytics('production');
  expect(inject).toHaveBeenCalledTimes(1);
});
