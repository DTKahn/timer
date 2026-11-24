/**
 * Loads PostHog as its own file, so it downloads after the timer is on screen
 * instead of adding to the first load. Kept separate so tests can replace it:
 * Jest can't run import() here.
 */
export function loadPosthog() {
  return import('posthog-js').then((m) => m.default);
}
