# Timer

A visual countdown timer for iOS and the web. The remaining time is shown as a
shrinking pie in a color you pick. Favorites give one-tap presets, and History
keeps your recent timers.

Built with Expo (React Native + react-native-web) from one TypeScript codebase.

## Develop

```bash
npm install
npm run web        # browser at http://localhost:8081
npm run ios        # needs Xcode + a development build (see below)
npm test           # unit tests (timer engine, stores, dial geometry)
npm run typecheck
npx expo lint
```

The app uses native modules (notifications, audio, haptics), so on iOS it runs in
a [development build](https://docs.expo.dev/develop/development-builds/introduction/),
not Expo Go: `npx expo run:ios` locally, or `npx eas-cli@latest build --profile development`.

## Web deployment

The web app is hosted on Vercel (see `vercel.json`), which builds every push:

- `main` deploys to production at https://colorchime.com. colourchime.com and
  the `www.` addresses redirect there.
- Every other branch gets its own preview link, and the `staging` branch keeps a
  fixed one. Use these to try changes before merging.
- The build runs the tests first, so a failing test blocks the deploy.
- Vercel Web Analytics runs on production only (`src/analytics/`).

The old GitHub Pages address (https://dtkahn.github.io/timer/) now only
redirects to colorchime.com, keeping the path
(see `.github/workflows/deploy-pages.yml` and `pages-redirect/`).

## How it works

- **Timer engine** (`src/timer/engine.ts`): a pure state machine
  (`idle → running ⇄ paused → finished`). A running timer stores its absolute
  end time, so it stays exact across backgrounding, throttled tabs, and restarts.
- **Stores** (`src/store/`): Zustand, persisted to AsyncStorage (localStorage on
  web). Timer, settings, favorites, and history are all local to the device.
- **Side effects** (`src/timer/timer-effects.tsx`): finishing on time, the
  "time's up" notification, completion sound, haptics, keep-awake, and the browser tab title.
  Platform-specific alerts live in `src/platform/alerts.ts` / `alerts.web.ts`.
- **Dial** (`src/components/pie-dial.tsx`): SVG wedge from `src/timer/dial-geometry.ts`.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for what's in progress, what's next, and the
decisions behind the order. `AGENTS.md` describes how work moves through it.
