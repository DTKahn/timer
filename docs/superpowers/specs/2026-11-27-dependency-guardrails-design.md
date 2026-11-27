# Dependency guardrails — design

Approved by Daniel on Nov 27, 2026 ("use your best judgement" on the process changes, and to execute now), after an architect-style review of the first proposal in conversation.

## Why

Nothing kept the project's packages current or stopped a mismatched package from going live:

- `expo-doctor` found 10 Expo packages behind SDK 57's expected versions, and a stale second lockfile (`bun.lock`).
- `npm audit` reported 21 findings (7 high), none triaged. Dependabot and secret scanning were off.
- The Vercel build ran only the tests, not lint or typecheck.
- Expo SDK 58 was already out without anyone noticing.

Daniel wants security updates applied on this project and future ones, without automatic updates on his Mac, and with a reminder that appears when he's working on the project.

## Approaches considered

- **Dependabot or Renovate update pull requests.** Rejected. Merging one on GitHub pushes to `main`, which is a release that skips the release entry and version bump, and neither tool knows which versions belong together in an Expo SDK.
- **`expo-doctor` in the Vercel build.** Rejected. It compares against Expo's newest online data, not the lockfile, so any new Expo patch would fail the next production build, including urgent fixes. It also fetches its newest version on every run.
- **A scheduled GitHub Action that fails when anything is out of date.** Rejected. Something is almost always out of date, so it would fail every month and get ignored.
- **Chosen:** a deterministic gate in the Vercel build, a one-command report for a monthly routine, alerts only, and written rules.

## Design

**One-time setup**

1. One package manager, npm. Delete `bun.lock` and the AGENTS.md wording about bun.
2. Ignore other sessions' worktrees (`.claude/`) in TypeScript, ESLint, Jest (anchored to `<rootDir>`, since worktrees live inside `.claude/` themselves) and `.gitignore` (`.claude/worktrees/` only; `.claude/settings.json` stays tracked).
3. `npm run check` runs lint, typecheck and tests. Vercel's build runs it before the export, so a failure never goes live.
4. `npm run deps:report` (`scripts/deps-report.sh`) prints, with headings and a line on what to act on:
   - Expo packages behind the SDK
   - `expo-doctor`
   - `npm outdated`
   - `npm audit --omit=dev`
   - npm 12's list of packages with unapproved install scripts
5. Record npm 12 install-script denials for the three packages whose scripts are already skipped (core-js, fsevents, unrs-resolver). A new package with install scripts then stands out.
6. GitHub: turn on Dependabot alerts (no update pull requests) and secret scanning with push protection. Both are free on a public repo.
7. Tests that keep this in place:
   - The Vercel build runs `npm run check` before exporting.
   - `check` covers lint, typecheck and tests.
   - There's only one lockfile.
   - The reminder's due date is 30 days after its last-update date.

**Process (AGENTS.md, with a Decision log entry)**

8. Add and update packages only with `npx expo install` (or `--fix`). Never `…@latest` for Expo-managed packages. Never `npm audit fix --force`, which downgrades Expo.
9. Use `overrides` only for vulnerable code that ships to the browser. Note it in the roadmap and remove it at the next SDK upgrade.
10. **Dated reminder:** AGENTS.md holds "Last update" and "Next due" dates (30 days apart). When starting work, if today is past the due date, tell Daniel and offer the routine:
    - Mac tools
    - `npm run deps:report` and fixes on a branch
    - new dates
11. Dependency updates are fix releases: last-number bump, no design doc, standard release text. Expo SDK upgrades get a roadmap item with a plan, and Daniel tries the preview on his phone before merging.
12. If a release breaks production, roll back on Vercel first, then fix on a branch.

**Follow-on roadmap items:** `dependency-refresh` (SDK 57 patch updates and `npm audit fix` without `--force`) and `expo-sdk-58`.

## Left to verify while building

- How Vercel's rollback works on Daniel's plan.
- That `npm audit fix` without `--force` keeps SDK 57 aligned (verified in `dependency-refresh`).
- How EAS handles Node, install-script denials and `expo-doctor` (verified in `ios-testflight`).
