import { inject } from '@vercel/analytics';

import { loadPosthog } from './load-posthog';

/**
 * PostHog project token. It's public by design: it can only send events to
 * the project, not read them.
 */
const POSTHOG_TOKEN = 'phc_xXcjCagFnqQ6TGASjDj6BP37n3ECkHAh6nkVHc5wCgrN';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let started = false;

/**
 * Turns on Vercel Web Analytics and PostHog, on the production site only, so
 * preview and staging links, and local dev, never count as visitors. The
 * Vercel build sets EXPO_PUBLIC_VERCEL_ENV from VERCEL_ENV (see vercel.json).
 *
 * PostHog autocaptures pageviews and taps, and records heatmaps, rage clicks
 * (repeated taps in one spot) and dead clicks (taps where nothing happened).
 * Session recordings are switched on in the PostHog project settings.
 */
export function startAnalytics(
  vercelEnv: string | undefined = process.env.EXPO_PUBLIC_VERCEL_ENV,
): Promise<void> {
  if (started || vercelEnv !== 'production') return Promise.resolve();
  started = true;
  inject({ mode: 'production' });
  return loadPosthog()
    .then((posthog) => {
      posthog.init(POSTHOG_TOKEN, {
        api_host: POSTHOG_HOST,
        defaults: '2026-08-30',
        capture_heatmaps: true,
        capture_dead_clicks: true,
      });
    })
    // A failed download only means this visit isn't counted.
    .catch(() => {});
}
