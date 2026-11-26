This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Planning and the roadmap

`ROADMAP.md` is the one list of planned work. Every change that ships comes from an item there, and the roadmap is updated in the same branch as the work, so merging to `main` keeps it current. Follow these steps for every item.

1. **Pick.** Work on any item in **Next**, or anything else Daniel asks for. If he hasn't named one, suggest an item from **Next** and say why. Work that isn't on the roadmap, even a small fix, is added to **In progress** as it starts.
2. **Start.** Move the item to **In progress**, give it a slug if it doesn't have one, and work on a branch named after that slug, in a worktree.
3. **Design.** For features, or anything with more than one reasonable approach, agree on the approach with Daniel and write a design doc at `docs/superpowers/specs/YYYY-MM-DD-<slug>-design.md`. Daniel approves it before any code is written. For a fix with one obvious approach, a few lines in the roadmap item are enough. If the scope or approach needs to change after approval, check with Daniel first, then update the design doc and record the change in the **Decision log**.
4. **Plan.** For work with more than a couple of steps, write `docs/superpowers/plans/YYYY-MM-DD-<slug>.md` from the design doc before building.
5. **Build and check.** Write tests first. Run lint, typecheck and tests. Try the branch's Vercel preview link before merging.
6. **Release.** Follow **Releases** below. In the same branch, move the item to **Done** with its version and date.

**Departing from this process.** These steps are the default for all work. Skipping one or doing it differently is a deliberate choice, never a shortcut taken silently:
- **Skipping a step for one item** (for example, no design doc for a feature, or merging without trying the preview): say which step you'd skip and why, and go ahead only once Daniel agrees. Note it in the item.
- **Changing this process** (the steps in this section, how work moves through `ROADMAP.md`, or how releases work): agree the change with Daniel, update this section, and record it in the **Decision log**.

**Capture, don't drop.** Follow-ups found along the way go into the roadmap: **Next** or **Later** if Daniel agrees they should happen, **Ideas** otherwise. That includes review findings left for later and anything else said to be "for later". Don't fix them unasked inside another item, and don't leave them only in a conversation.

Changes that only touch planning and docs (`ROADMAP.md`, `docs/`, `AGENTS.md`, `README.md`) aren't releases. They need no release entry or version bump.

## Releases

Every merge to `main` deploys to production on Vercel (https://colorchime.com) and is a release. Try changes first on the branch's Vercel preview link, or on the `staging` branch's fixed link, before merging. Before merging, add an entry at the top of `src/constants/releases.ts` and set the same `version` in `app.json`: bump the middle number for new features, the last number for fixes only. Set `date` to the merge time. Write the name and changes in plain, non-technical language about what's different for the person using the app — the name is the most important change or changes, and each change is one sentence.
