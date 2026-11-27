# Picker choice analytics — plan

From `docs/superpowers/specs/2026-11-26-picker-choice-analytics-design.md`.

1. **Tests first.**
   - `src/analytics/__tests__/picker-choices.test.ts`: color and sound names, custom colors, Multiple mode.
   - `src/analytics/__tests__/start-analytics.web.test.ts`: `track` sends nothing before PostHog starts, and captures after.
   - `src/components/__tests__/picker-choices.test.tsx`: each way of closing each picker sends one event with what's selected; trying sounds without closing sends nothing.
2. **Build.**
   - `src/analytics/picker-choices.ts`: turns settings into event properties.
   - `track(event, properties)` in `start-analytics.web.ts` (PostHog `capture`) and `start-analytics.ts` (no-op).
   - Call it from every close path in `color-picker.tsx` and `sound-picker.tsx`.
3. **Check.** Lint, typecheck, tests; a local web build shows no errors; try the preview link.
4. **Release.** 0.14.2 entry and `app.json`; roadmap item to Done; merge when Daniel says so; then save the two charts once events arrive.
