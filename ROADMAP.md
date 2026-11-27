# Roadmap

The single list of what's being worked on, what's next, and what's been decided. How to work from it is in the "Planning and the roadmap" section of `AGENTS.md`.

Each item has a short **slug**. That slug is also the item's branch name and appears in its spec and plan file names (`docs/superpowers/specs/YYYY-MM-DD-<slug>-design.md`, `docs/superpowers/plans/YYYY-MM-DD-<slug>.md`).

- **In progress:** being worked on now, with a branch.
- **Next:** agreed and coming soon, loosely in priority order, most important first. Any of them can be picked up, not only the first.
- **Later:** agreed to do, but not yet ordered.
- **Ideas:** worth remembering, not yet agreed.
- **Done:** shipped. The newest is at the top, with the release it went out in. The full history is in `src/constants/releases.ts`.
- **Decision log:** every change to an item's scope or approach after it's agreed, and every change to the planning process itself, and why.

## In progress

- **`picker-choice-analytics`: which colors and sounds people choose.** PostHog gets an event with the selected color or sound each time a picker closes, and two dashboard charts show the most common ones. Spec and plan are in `docs/superpowers/`.
- **`paper-collage`: construction-paper look.** A hand-made, cut-paper style for the timer.
  - Spikes on `paper-a-svg` (SVG paper pieces), `paper-b-skia` (Skia) and `paper-c-images` (pre-drawn images). `paper-collage` is ahead of them.
  - No spec yet.
  - **Paused since Oct 9:** decide whether to resume, and write the spec before building further.

## Next

- **`analytics-privacy`: privacy and consent for analytics.**
  - **Why:** PostHog stores a lasting ID on each device and records sessions on a site aimed at kids. The site also serves the UK and Canada through colourchime.com, and UK and EU rules generally require consent for non-essential analytics IDs. US rules for child-directed sites (COPPA) treat a lasting ID as personal information. The only privacy statement today is in `public/llms.txt`.
  - **Decide:** run PostHog without cookies (cookieless or memory-only), ask for consent, or both. Whether to keep Vercel Web Analytics alongside PostHog.
  - **Build:** a privacy page; an "ignore this device" switch so Daniel's own testing isn't counted or recorded.
- **`hosting-cleanup`: small fixes left over from the move to Vercel.**
  - Settings shows `()` instead of the commit on builds deployed from the CLI. Change `?? 'dev'` to `|| 'dev'` in `src/app/settings.tsx`.
  - Long-lived cache headers for `/_expo/static/*` and `/assets/*` in `vercel.json`.
  - Missing asset files return the app page with a 200. Keep them out of the catch-all rewrite.
  - The old-address redirect is case-sensitive (`/Timer/...`). Add the `i` flag in `pages-redirect/index.html`.
  - `.gitignore` ignores every `.env*` file. Narrow it to `.env*.local`.
  - Add a space after `&&` in the `vercel.json` build command.
  - Run lint and typecheck in the Vercel build, not only tests.
  - `bun.lock` is missing `@vercel/analytics` and `posthog-js`. Refresh it or remove it so there's one lockfile; CI and Vercel use npm.
  - `npm test` in the main checkout also runs the tests inside `.claude/worktrees/`. Add `testPathIgnorePatterns`.
  - Check `dtkahn.github.io/timer/settings` in a real browser. It should land on `colorchime.com/settings`.
  - **Housekeeping:** remove merged worktrees (`vercel-hosting`, `pickers-survive-rotation`, `roadmap`). Delete merged remote branches (`posthog-analytics`, `seo-basics`, `unmask-duration-inputs`, `worktree-vercel-hosting`). Check the three `worktree-agent-*` branches against the `paper-*` branches before removing them.
- **`staging-workflow`: decide how staging is used.**
  - The `staging` branch is still at 0.12.10, and recent work went straight from feature branches to `main`.
  - Either make "merge to `staging`, try it, then merge to `main`" the routine, or drop `staging` and rely on each branch's preview link.
  - Staging and previews currently need a Vercel login. Decide whether testers should be able to open them.
- **`native-rename`: rename the app to Color Chime on iOS and Android.**
  - `app.json` still says name "Timer", slug `timer`, scheme `timer`.
  - Set the iOS bundle identifier and Android package to Color Chime ones. They're locked once the app is submitted to a store.
  - Show "Colour Chime" on the home screen for UK, Canadian and Australian English.
  - **Before starting, Daniel:** run a trademark search for "Color Chime" and "Colour Chime".
  - **Must happen before** `ios-testflight` or `android-play-store`.

## Later

- **`ios-testflight`:** ship iOS through TestFlight with EAS.
- **`android-play-store`:** ship Android on Google Play.
- **`store-listings`:** App Store and Google Play listings. "Color Chime: Visual Timer" in the US; "Colour Chime" listings for en-GB, en-CA and en-AU.
- **`live-activity-widget`:** a Live Activity (Dynamic Island and Lock Screen) and a home-screen widget, through a Swift WidgetKit target added with `@bacons/apple-targets`.
- **`synced-preferences`:** settings, favorites and history that follow a person across devices. Needs accounts or sync, and a privacy review, since the audience is kids.

## Ideas

- **Crayon Timer:** a crayon-themed look, or a brand for it. Kept separate from the main name so the app isn't tied to one style.

## Done

- **`unmask-duration-inputs`** (0.14.1, Nov 25, 2026): session recordings show timer lengths and hex colors.
- **`seo-basics`** (0.14.0, Nov 24, 2026): link previews, the Color Chime name and icon on the web and the home screen, `robots.txt`, a sitemap, `llms.txt`.
- **`posthog-analytics`** (0.13.0, Nov 24, 2026): PostHog on the production web app, with heatmaps and session recordings that hide typed text.
- **`vercel-hosting`** (0.12.10, Nov 23, 2026): moved from GitHub Pages to Vercel at colorchime.com, with production-only Vercel Web Analytics. Spec and plan are in `docs/superpowers/`.

## Decision log

Newest first. Add an entry whenever an item's scope or approach changes after it's agreed, or the planning process in `AGENTS.md` changes.

- **2026-11-25: Next is loosely ordered.**
  - Items are listed roughly by priority, but any item in **Next** can be picked up, not only the first one.
  - Work that isn't on the roadmap is added to **In progress** when it starts.
  - Choosing an item, or reordering **Next**, doesn't need an entry here.
- **2026-11-25: docs-only changes aren't releases.** Changes that only touch `ROADMAP.md`, `docs/`, `AGENTS.md` or `README.md` need no release entry or version bump.
- **2026-11-25: roadmap created.** Gathered from the Vercel move, the releases since then, the README roadmap and the open branches. Claude suggested starting with `analytics-privacy`, because session recordings on a kids' site carry the most risk.
- **2026-11-24: PostHog added.** It had been held for "decide later" on Nov 23, and shipped in 0.13.0, with session recordings.
- **2026-11-23: chose the name Color Chime and moved hosting to Vercel.**
  - The name fits ages 2 to 10, isn't tied to a visual style, and names the experience: pick a color and a sound.
  - Both colorchime.com and colourchime.com are registered at Namecheap.
  - Existing users start fresh at the new address. That was accepted because the group is small and known.
  - Started with Vercel Web Analytics only.
