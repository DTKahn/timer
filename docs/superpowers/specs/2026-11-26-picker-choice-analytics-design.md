# Picker choice analytics — design

Approved by Daniel on Nov 26, 2026 ("dive in", after reviewing the short design in conversation).

## Why

Daniel wants to know which colors and sounds people end up using. Rebuilding that from autocaptured taps works only roughly: it breaks on Multiple color mode, on closes that aren't taps, and whenever a button label changes, and PostHog can't chart it.

## What counts

A choice is whatever is selected **when the picker closes**, however it closes (tapping a color in single mode, tapping outside, Done, Escape or the Android back button), even if nothing changed. The color list in Settings isn't a picker and isn't counted.

## Approaches

- **Event on close (chosen).** Each picker sends PostHog one event with what's selected as it closes. Exact, chartable, survives label changes.
- **Rebuild from autocapture.** No code, but approximate (see Why) and not chartable.
- **Event on every selection change.** Counts previews (sounds are tried before being chosen), which isn't what Daniel asked for.

## Design

- `color picker closed` with `color` (the single color, or the first ring), `colors` (every selected color, outermost ring first) and `multiple` (Multiple mode on). Preset colors are sent by name (`Brown`); custom colors as `Custom #AABBCC`.
- `sound picker closed` with `sound` (its name, such as `Bell`).
- Web production only, through the existing PostHog setup. On iOS and Android, and before PostHog has loaded (the first second or two of a visit), nothing is sent.
- The events hold nothing about the person, so this doesn't add to `analytics-privacy`.
- Two saved PostHog charts on the dashboard, "Colors chosen" and "Sounds chosen": last 30 days, test accounts excluded. In Multiple mode each color in the set counts once.
- Release 0.14.2, named "Analytics update".

## Left to the builder

Module layout, test shape, and the chart queries.
