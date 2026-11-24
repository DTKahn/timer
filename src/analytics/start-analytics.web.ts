import { inject } from '@vercel/analytics';

let started = false;

/**
 * Turns on Vercel Web Analytics, on the production site only, so preview and
 * staging links, and local dev, never count as visitors. The Vercel build sets
 * EXPO_PUBLIC_VERCEL_ENV from VERCEL_ENV (see vercel.json).
 */
export function startAnalytics(
  vercelEnv: string | undefined = process.env.EXPO_PUBLIC_VERCEL_ENV,
): void {
  if (started || vercelEnv !== 'production') return;
  started = true;
  inject({ mode: 'production' });
}
