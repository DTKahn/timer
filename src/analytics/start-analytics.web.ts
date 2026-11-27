import { inject } from '@vercel/analytics';

import { loadPosthog } from './load-posthog';

/**
 * PostHog project token. It's public by design: it can only send events to
 * the project, not read them.
 */
const POSTHOG_TOKEN = 'phc_xXcjCagFnqQ6TGASjDj6BP37n3ECkHAh6nkVHc5wCgrN';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let started = false;
/** Set once PostHog has loaded and started; events before then are dropped. */
let posthog: { capture: (event: string, properties: Record<string, unknown>) => unknown } | null = null;

/**
 * Hides typed text in session recordings unless the input is marked as holding
 * nothing personal (see SHOW_IN_REPLAYS). Runs in the visitor's browser, so
 * hidden text never reaches PostHog.
 */
function maskInput(text: string, element?: HTMLElement): string {
  return element?.dataset.phUnmask === 'true' ? text : '*'.repeat(text.length);
}

/**
 * Turns on Vercel Web Analytics and PostHog, on the production site only, so
 * preview and staging links, and local dev, never count as visitors. The
 * Vercel build sets EXPO_PUBLIC_VERCEL_ENV from VERCEL_ENV (see vercel.json).
 *
 * PostHog autocaptures pageviews and taps, and records heatmaps, rage clicks
 * (repeated taps in one spot) and dead clicks (taps where nothing happened).
 * Session recordings are switched on in the PostHog project settings. They
 * hide what people type, except in inputs marked with SHOW_IN_REPLAYS.
 */
export function startAnalytics(
  vercelEnv: string | undefined = process.env.EXPO_PUBLIC_VERCEL_ENV,
): Promise<void> {
  if (started || vercelEnv !== 'production') return Promise.resolve();
  started = true;
  inject({ mode: 'production' });
  return loadPosthog()
    .then((instance) => {
      instance.init(POSTHOG_TOKEN, {
        api_host: POSTHOG_HOST,
        defaults: '2026-08-30',
        capture_heatmaps: true,
        capture_dead_clicks: true,
        session_recording: {
          maskAllInputs: true,
          maskInputFn: maskInput,
        },
      });
      posthog = instance;
    })
    // A failed download only means this visit isn't counted.
    .catch(() => {});
}

/** Sends an event to PostHog, once it has started on the production site. */
export function track(event: string, properties: Record<string, unknown>): void {
  posthog?.capture(event, properties);
}
