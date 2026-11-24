# Move web hosting from GitHub Pages to Vercel

## Why
- Get a live link where unreleased changes can be tried before they reach `main`.
- Count real usage with analytics, starting now while the user group is small and known.
- Lay the groundwork for later features, such as preferences that persist beyond one browser.

## Goals
- Production at **colorchime.com**, built from `main`. **colourchime.com** (UK/Canadian spelling, also owned) redirects to it, keeping the path. `www.` on either domain also redirects to the bare colorchime.com.
- A stable staging link built from a `staging` branch, plus automatic preview links for every other branch.
- Vercel Web Analytics on production: visitors, page views, devices, countries.
- The old `dtkahn.github.io/timer` address sends visitors to the new one.

## Non-goals
- Moving existing users' saved data. It's a clean move: existing users start fresh, and the small group of current users is fine with that.
- PostHog, retention, or event tracking. We'll revisit once there's data.
- Accounts or syncing preferences across devices. This is future work that the move makes easier.
- Renaming the app itself to Color Chime (page title, header, `app.json` name, iOS/Android identifiers, localized "Colour" spelling, store listings). That's a separate follow-up, done before the first store submission.

## Anti-goals
- Staging or preview traffic showing up in the production analytics numbers.
- A deploy going out with failing tests. Today failing tests block the deploy, and that should stay true.
- Breaking the native (iOS/Android) build with web-only code.

## Approaches
1. **Vercel's GitHub integration builds every push (picked).** `main` deploys to production, other branches deploy to previews, and `staging` gets a fixed branch link. This needs the least setup and the fewest secrets, and it gives preview links for free.
2. GitHub Actions builds the app and pushes it to Vercel with the CLI and a token. This gives more control but needs more config and secrets, and it adds nothing we need.

Analytics: we picked **Vercel Web Analytics** over PostHog for now. It's simpler, needs no cookies and no consent banner, and ignores preview traffic. The trade-off is that it can't show whether the same person comes back on a later day. We can add PostHog later if that question matters.

## Design
- **Build config (`vercel.json`):** `npm ci` for install. It's set explicitly because both `bun.lock` and `package-lock.json` exist, and CI uses npm today. The build runs the tests, then `expo export --platform web`, with `EXPO_PUBLIC_COMMIT` set from `VERCEL_GIT_COMMIT_SHA` so Settings keeps showing the commit. Output goes to `dist`, and a rewrite sends every path to `index.html` so reloads work on `/history` and `/settings`.
- **`app.json`:** remove `experiments.baseUrl: "/timer"`, because the app now lives at the root of its domain.
- **Analytics:** add `@vercel/analytics` and call it from a web-only module (a `.web.ts` file, with an empty native counterpart) so native builds are unaffected. Web Analytics also has to be switched on for the project in the Vercel dashboard.
- **Domains:** add colorchime.com as the production domain on the Vercel project. Add colourchime.com, www.colorchime.com and www.colourchime.com as permanent (308) redirects to colorchime.com. DNS points at Vercel, either through Vercel nameservers or A/CNAME records at the registrar, depending on where the domains were bought.
- **Old Pages site:** replace the Pages workflow with one that publishes only a small redirect page (both as `index.html` and as `404.html`). The redirect sends `/timer/<path>` to `https://colorchime.com/<path>`.
- **Naming choice (context):** Color Chime was picked because it names both halves of the experience (choosing a color and a sound), works for ages 2–10, isn't tied to a visual style, and was clear as a .com and in both app stores. The UK/Canadian spelling is handled with a redirect now and, later, with localized store listings and in-app text.
- **Docs:** update the Releases section of `AGENTS.md` (merging to `main` now deploys to Vercel, and `staging` is the place to try changes) and the README if it mentions hosting.
- **Release entry:** add an entry to `releases.ts` and bump the version in `app.json` (patch). The plain-language note says the timer has a new web address.

## Steps only Daniel can do
- Run `vercel login` (the CLI token has expired).
- Approve the Vercel GitHub app's access to the `DTKahn/timer` repo when linking.
- Switch on Web Analytics in the project dashboard, if the CLI can't.
- Change DNS at the registrar, if the domains weren't bought through Vercel.

## Left to the builder
- The Vercel project name. Default to `color-chime`. The `*.vercel.app` address it creates stays as a fallback.
- Exact redirect page markup.
