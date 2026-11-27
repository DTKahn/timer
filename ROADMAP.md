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

- **`paper-collage`: construction-paper look.** A hand-made, cut-paper style for the timer.
  - Spikes on `paper-a-svg` (SVG paper pieces), `paper-b-skia` (Skia) and `paper-c-images` (pre-drawn images). `paper-collage` is ahead of them.
  - No spec yet.
  - **Paused since Oct 9:** decide whether to resume, and write the spec before building further.
- **`dependency-guardrails`: keep versions current without breaking things.** One package manager, one `npm run check` that Vercel runs before every build, a `deps:report` command, Dependabot alerts and secret scanning, and the rules and dated monthly reminder in AGENTS.md. Spec and plan are in `docs/superpowers/`.

## Next

- **`dependency-refresh`: bring SDK 57 packages up to date.** A dependency release (see AGENTS.md).
  - `npx expo install --fix` for the 10 Expo packages behind SDK 57's expected versions.
  - `npm audit fix` without `--force`, then `npx expo install --check` must be clean.
  - Write down which remaining `npm audit --omit=dev` findings are accepted because they're only in build tools.
- **`expo-sdk-58`: upgrade to Expo SDK 58** (`latest` since before Nov 27; supports Node 26).
  - Follow Expo's upgrade guide, with a plan doc. Clears findings that only SDK 58 fixes, such as `decode-uri-component` through `expo-router`'s `query-string`, which ships in the web bundle.
  - Daniel tries the preview on his phone (home screen, sounds, rotation) before merging.
  - **Must happen before** `ios-testflight`, since Expo Go and EAS follow the newest SDK.
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
  - When `eas.json` is created, set each build profile's `node` version there too (EAS doesn't read `engines`), and extend `src/__tests__/node-version.test.ts` to check it matches.
- **`android-play-store`:** ship Android on Google Play.
- **`app-icon`:** design the real Color Chime icon.
  - The web uses a provisional icon from `seo-basics`: the app's red dial, in `assets/images/favicon.png`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png` and the link-preview image `public/og-image.png`.
  - The native app still has Expo's placeholder icon: `assets/images/icon.png`, `assets/expo.icon`, the `android-icon-*` files and `splash-icon.png`.
  - Replace both sets together. **Must happen before** `ios-testflight` or `android-play-store`.
- **`store-listings`:** App Store and Google Play listings. "Color Chime: Visual Timer" in the US; "Colour Chime" listings for en-GB, en-CA and en-AU.
  - **Decide:** list it as a kids' app (Apple's Kids Category, Google Play's Families program) or as a tool for parents and teachers. The kids' categories restrict third-party analytics and links out of the app, which ties in with `analytics-privacy`. The same framing affects the AI app-directory idea below.
- **`live-activity-widget`:** a Live Activity (Dynamic Island and Lock Screen) and a home-screen widget, through a Swift WidgetKit target added with `@bacons/apple-targets`.
- **`synced-preferences`:** settings, favorites and history that follow a person across devices. Needs accounts or sync, and a privacy review, since the audience is kids.
  - Accounts would be optional. When they arrive, update the "no accounts" and "no sign-up" wording in `public/llms.txt` (Privacy) and in the link-preview description in `public/index.html`, along with the privacy page.

## Ideas

- **Crayon Timer:** a crayon-themed look, or a brand for it. Kept separate from the main name so the app isn't tied to one style.
- **Content pages for search (web):** separate, readable pages that people find through search, while the timer screen stays exactly as it is. Discussed Nov 24 as the step after `seo-basics`.
  - Use-case pages (bedtime, tidy-up, toothbrushing, screen time, classroom transitions) and a "Why Color Chime" page. Each has a button that opens the timer already set.
  - Reached from one row in Settings (a real link, so search engines can follow it), the sitemap, and links between the pages. Nothing is added to the timer screen.
  - Needs static rendering (`web.output: "static"`) and per-page titles. The root layout (`src/app/_layout.tsx`) draws nothing until saved settings and fonts load, so content pages must render without waiting for that, or their built HTML is empty.
  - The privacy page from `analytics-privacy` could be the first of these pages.
- **Ready-made timer links (web):** pages like `/10-minute-timer` that open a timer already set, plus a plain link (such as `?m=10`) to share. The plain link tells search engines it's the same page as the home page.
- **Getting mentioned elsewhere:** AI assistants and search mostly recommend what other sites mention. Teachers (lists of free classroom tools, Pinterest, teacher groups), parents (Pinterest, parenting communities), Product Hunt, and occupational and speech therapist blogs. Link the site and the store listings to each other once the store apps exist.
- **AI app directories:** a small MCP server with a timer widget (an MCP App) on colorchime.com, listed in ChatGPT's app directory, Claude's Connectors Directory and Google's Connected Apps (Gemini and Search). One build covers all three.
  - ChatGPT doesn't allow apps that explicitly target children under 13, so it would be described as a tool for parents and teachers.
  - Needs no sign-in. Does need a privacy page, a support contact, screenshots, and verification on the OpenAI Platform.
  - A timer inside a chat is weaker than the app, so it's mostly a way to be discovered.
- **Voice assistants:** "Hey Siri, start a Color Chime timer" through App Intents, and Gemini on Android through AppFunctions (Android 16 and up). Both need native code added to the Expo app, so they come after the store apps ship.

## Done

- **`node-version`** (0.14.3, Nov 27, 2026): `package.json` sets Node to `26.x`, and Vercel builds with it. A test fails if the tests run on another major version. A fix with one obvious approach, so no design doc. Daniel's Mac moved from Node 23 to 26 the same day.
- **`search-registration`** (no release, Nov 27, 2026): colorchime.com is verified in Google Search Console and Bing Webmaster Tools, and the sitemap is submitted to both. Link previews checked: Facebook, X, WhatsApp and Slack get the title and image.
- **`picker-choice-analytics`** (0.14.2, Nov 26, 2026): PostHog gets the color or sound selected each time a picker closes. Spec and plan are in `docs/superpowers/`.
- **`unmask-duration-inputs`** (0.14.1, Nov 25, 2026): session recordings show timer lengths and hex colors.
- **`seo-basics`** (0.14.0, Nov 24, 2026): link previews, the Color Chime name and a provisional dial icon on the web and the home screen, `robots.txt`, a sitemap, `llms.txt`.
- **`posthog-analytics`** (0.13.0, Nov 24, 2026): PostHog on the production web app, with heatmaps and session recordings that hide typed text.
- **`vercel-hosting`** (0.12.10, Nov 23, 2026): moved from GitHub Pages to Vercel at colorchime.com, with production-only Vercel Web Analytics. Spec and plan are in `docs/superpowers/`.

## Decision log

Newest first. Add an entry whenever an item's scope or approach changes after it's agreed, or the planning process in `AGENTS.md` changes.

- **2026-11-27: AI crawlers are all allowed, including training crawlers.**
  - `public/robots.txt` lets every crawler in: search crawlers (such as OAI-SearchBot, Claude-SearchBot, Googlebot, Bingbot) and training crawlers (such as GPTBot, ClaudeBot, Google-Extended, CCBot).
  - Why: models that learn about Color Chime can recommend it even without a live search, and the site has no writing worth protecting. Visitors' settings and data never appear on public pages.
  - Can be revisited, for example if the content pages grow into substantial original writing. Blocking would only affect future crawling, and search crawlers should stay allowed either way.

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
