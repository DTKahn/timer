# Dependency guardrails — plan

From `docs/superpowers/specs/2026-11-27-dependency-guardrails-design.md`.

1. **Tests first.** `src/__tests__/build-checks.test.ts`:
   - `vercel.json` runs `npm run check` before `expo export`
   - `check` runs `expo lint`, `tsc --noEmit` and `jest`
   - no `bun.lock`, `yarn.lock` or `pnpm-lock.yaml`
   - AGENTS.md has "Last update" and "Next due" dates 30 days apart

   Watch them fail.
2. **Build.**
   - Delete `bun.lock`.
   - Ignore `.claude/` in `tsconfig.json` (`exclude`), `eslint.config.js` (`ignores`), the Jest config (`testPathIgnorePatterns` and `modulePathIgnorePatterns` with `<rootDir>/.claude/`) and `.gitignore` (`.claude/worktrees/`).
   - `package.json` scripts `check` and `deps:report`; `scripts/deps-report.sh`.
   - `vercel.json` build command: `npm run check && … npx expo export -p web`.
   - `npm install-scripts deny core-js fsevents unrs-resolver`, and confirm the lockfile is unchanged.
   - AGENTS.md:
     - fix the bun wording and commands
     - point step 5 at `npm run check`
     - add a "Dependencies" section with the rules and the dated reminder
     - add a Decision log entry in ROADMAP.md
3. **Check.**
   - `npm run check` passes in the worktree.
   - In the main checkout, the same config no longer picks up other worktrees.
   - `npm run deps:report` runs.
   - The Vercel preview build runs `check` and the site loads.
4. **Release.**
   - 0.14.4 (fix) entry and `app.json`.
   - Move the item to Done.
   - Merge.
   - Turn on Dependabot alerts and secret scanning with push protection in GitHub.
