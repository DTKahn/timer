# Timer

A visual countdown timer for iOS and the web. The remaining time is shown as a
shrinking pie in a color you pick. Favorites give one-tap presets, and History
keeps your recent timers.

Built with Expo (React Native + react-native-web) from one TypeScript codebase.

## Develop

```bash
npm install
npm run web        # browser at http://localhost:8081/timer/
npm run ios        # needs Xcode + a development build (see below)
npm test           # unit tests (timer engine, stores, dial geometry)
npm run typecheck
npx expo lint
```

The app uses native modules (notifications, audio, haptics), so on iOS it runs in
a [development build](https://docs.expo.dev/develop/development-builds/introduction/),
not Expo Go: `npx expo run:ios` locally, or `npx eas-cli@latest build --profile development`.

## Web deployment

Every push to `main` deploys the web app to GitHub Pages at
https://dtkahn.github.io/timer/ (see `.github/workflows/deploy-pages.yml`).
Because the site lives under `/timer`, `app.json` sets `experiments.baseUrl`,
so the local dev server also serves the app at http://localhost:8081/timer/.

## How it works

- **Timer engine** (`src/timer/engine.ts`): a pure state machine
  (`idle → running ⇄ paused → finished`). A running timer stores its absolute
  end time, so it stays exact across backgrounding, throttled tabs, and restarts.
- **Stores** (`src/store/`): Zustand, persisted to AsyncStorage (localStorage on
  web). Timer, settings, favorites, and history are all local to the device.
- **Side effects** (`src/timer/timer-effects.tsx`): finishing on time, the
  "time's up" notification, chime, haptics, keep-awake, and the browser tab title.
  Platform-specific alerts live in `src/platform/alerts.ts` / `alerts.web.ts`.
- **Dial** (`src/components/pie-dial.tsx`): SVG wedge from `src/timer/dial-geometry.ts`.

## Roadmap

- Ship iOS through TestFlight via EAS.
- Live Activity (Dynamic Island + Lock Screen) and home-screen widget via a Swift
  WidgetKit target added with `@bacons/apple-targets`.
