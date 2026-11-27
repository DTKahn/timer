This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

The project uses npm (`package-lock.json`). Don't add bun, yarn or pnpm lockfiles.

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npm run check               # lint, typecheck and tests (Vercel runs this before every build)
npm run deps:report         # the monthly dependency report (see Keeping up to date)
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run `npm run check` before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `npx eas-cli@latest <command>`; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Planning and the roadmap

`ROADMAP.md` is the one list of planned work. Every change that ships comes from an item there, and the roadmap is updated in the same branch as the work, so merging to `main` keeps it current. Follow these steps for every item.

1. **Pick.** **Next** is loosely in priority order, but it isn't a queue: work on any item in it, or anything else Daniel asks for. If he hasn't named one, suggest one (usually the top) and say why. Work that isn't on the roadmap, even a small fix, is added to **In progress** as it starts.
2. **Start.** Move the item to **In progress**, give it a slug if it doesn't have one, and work on a branch named after that slug, in a worktree.
3. **Design.** For features, or anything with more than one reasonable approach, agree on the approach with Daniel and write a design doc at `docs/superpowers/specs/YYYY-MM-DD-<slug>-design.md`. Daniel approves it before any code is written. For a fix with one obvious approach, a few lines in the roadmap item are enough. If the scope or approach needs to change after approval, check with Daniel first, then update the design doc and record the change in the **Decision log**.
4. **Plan.** For work with more than a couple of steps, write `docs/superpowers/plans/YYYY-MM-DD-<slug>.md` from the design doc before building.
5. **Build and check.** Write tests first. Run `npm run check`. Try the branch's Vercel preview link before merging.
6. **Release.** Follow **Releases** below. In the same branch, move the item to **Done** with its version and date.

**Departing from this process.** These steps are the default for all work. Skipping one or doing it differently is a deliberate choice, never a shortcut taken silently:
- **Skipping a step for one item** (for example, no design doc for a feature, or merging without trying the preview): say which step you'd skip and why, and go ahead only once Daniel agrees. Note it in the item.
- **Changing this process** (the steps in this section, how work moves through `ROADMAP.md`, or how releases work): agree the change with Daniel, update this section, and record it in the **Decision log**.

**Capture, don't drop.** Follow-ups found along the way go into the roadmap: **Next** or **Later** if Daniel agrees they should happen, **Ideas** otherwise. That includes review findings left for later and anything else said to be "for later". Don't fix them unasked inside another item, and don't leave them only in a conversation.

Changes that only touch planning and docs (`ROADMAP.md`, `docs/`, `AGENTS.md`, `README.md`) aren't releases. They need no release entry or version bump.

## Releases

Every merge to `main` deploys to production on Vercel (https://colorchime.com) and is a release. Try changes first on the branch's Vercel preview link, or on the `staging` branch's fixed link, before merging. Before merging, add an entry at the top of `src/constants/releases.ts` and set the same `version` in `app.json`: bump the middle number for new features, the last number for fixes only. Set `date` to the merge time. Write the name and changes in plain, non-technical language about what's different for the person using the app — the name is the most important change or changes, and each change is one sentence.

If a release breaks the live site, roll back to the previous deployment in Vercel first (Instant Rollback), then fix on a branch. If something works locally but not on Vercel, redeploy without the build cache before digging further.

## Keeping up to date

**Last update:** 2026-11-27
**Next due:** 2026-12-27

When you start work on this project, compare today's date with **Next due**. If it has passed, tell Daniel before starting what he asked for, and offer to run the routine below first or right after. Ask once per session. After the routine, set **Last update** to the day it was done and **Next due** to 30 days later, in the same branch as any fixes (or as a docs-only change if nothing needed fixing). A test checks the two dates are 30 days apart.

The routine:

1. **Daniel's Mac** (Homebrew; nothing runs automatically):
   - `brew update && brew upgrade && brew cleanup`, then `npm update -g`.
   - Before upgrading, check `brew outdated node`. If it would move Node to a new major version (26 → 27), don't take it: install `node@<current major>` instead. Changing majors is a planned roadmap item, because `engines.node` in `package.json` and Vercel must change with it (a test fails when they disagree).
   - Also check System Settings → Software Update for Apple's Command Line Tools.
2. **The project:** run `npm run deps:report` and fix what it shows on a branch, as a dependency release (below). A new Expo SDK becomes its own roadmap item.

## Dependencies

- Add and update packages only with `npx expo install <package>` (or `npx expo install --fix`). It picks versions that match the Expo SDK. Never `npm install <package>@latest` for Expo or React Native packages.
- Never run `npm audit fix --force`: it downgrades Expo to fix tooling findings. `npm audit fix` without `--force` is fine on a branch, as long as `npx expo install --check` is still clean afterwards.
- Use `overrides` in `package.json` only for vulnerable code that ships to the browser. Note each one in the roadmap and remove it at the next SDK upgrade.
- npm 12 blocks packages' install scripts unless they're approved. `allowScripts` in `package.json` records the decisions. If `npm install-scripts ls` lists a package, approve it only if it needs its script to work; otherwise deny it.
- **Dependency releases.** Updating packages within the current SDK is a fix release: bump the last number, no design doc (a few lines in the roadmap item are enough). The release name is "Behind-the-scenes updates", with one change: "Nothing changes in the timer: its building blocks were updated to keep it secure and working smoothly."
- **Expo SDK upgrades** are roadmap items with a plan doc that follows Expo's upgrade guide. Daniel tries the preview on his phone before merging.
- GitHub sends Dependabot alerts for new vulnerabilities. Dependabot doesn't open update pull requests: merging one on GitHub would be a release without a release entry.
