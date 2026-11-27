#!/usr/bin/env bash
# The monthly dependency report (`npm run deps:report`). It only reads; it changes nothing.
# Fix what it shows on a branch, following "Keeping up to date" in AGENTS.md.

section() { printf '\n\033[1m== %s ==\033[0m\n%s\n\n' "$1" "$2"; }

section "Expo packages vs the installed SDK" \
  "Act on: anything listed. Fix with \`npx expo install --fix\` on a branch."
npx expo install --check

section "expo-doctor" \
  "Act on: failed checks. A newer Expo SDK being available is a roadmap item, not a quick fix."
npx --yes expo-doctor

section "Outdated packages (npm outdated)" \
  "For awareness. Expo and React Native packages move with SDK upgrades; others: \`npx expo install <pkg>\`."
npm outdated

section "Known vulnerabilities in the app's packages (npm audit --omit=dev)" \
  "Act on: new findings. Try \`npm audit fix\` (never --force). Accepted build-tool findings are listed in ROADMAP.md."
npm audit --omit=dev

section "Packages with install scripts nobody has approved or denied" \
  "Act on: anything listed. Approve only if the package needs it; otherwise \`npm install-scripts deny <pkg>\`."
npm install-scripts ls

exit 0
