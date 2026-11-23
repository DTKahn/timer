# Vercel Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the web app from Vercel at colorchime.com, with a staging branch link, preview links, and production-only Web Analytics, and redirect the old GitHub Pages address.

**Architecture:** Vercel's GitHub integration builds every push using `vercel.json`. The build runs the tests, then `expo export -p web` into `dist/`, an SPA rewrite sends every path to `/`, and Vercel's environment is passed in as `EXPO_PUBLIC_*` variables. Analytics is a web-only module that calls `inject()` only when `EXPO_PUBLIC_VERCEL_ENV === 'production'`. The GitHub Pages workflow is replaced by one that publishes a static redirect page.

**Tech Stack:** Expo SDK 57 (web, `output: "single"`), expo-router, Vercel CLI 57, `@vercel/analytics`, Jest (jest-expo), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-23-vercel-hosting-design.md`

## Global Constraints

- Production domain is `colorchime.com`. `colourchime.com`, `www.colorchime.com` and `www.colourchime.com` 308-redirect to it, keeping the path.
- Domains are registered at Namecheap and stay on Namecheap DNS. Use the records Vercel reports for each domain.
- Install uses `npm ci`, because `package-lock.json` is the lockfile CI already trusts. Add packages with `npx expo install <pkg> --npm`.
- Failing tests must block a deploy.
- Analytics must never run on preview or staging deployments, on local dev, or on native.
- Never create or edit `ios/` or `android/`.
- This merge is a release. Add an entry at the top of `src/constants/releases.ts`, set the version to `0.12.5` in both that entry and `app.json`, and set the date to the merge time. Write the copy in plain language.
- Run `npx expo lint`, `npx tsc --noEmit` and `npm test` before calling any task done.

## Review Focus

1. **Deep-link reload:** reloading `https://colorchime.com/history` or `/settings` serves the app, not a 404. Checked in Task 4, step 3.
2. **Static assets aren't rewritten:** `/_expo/static/js/...` and font and sound files return their real content type, not `index.html`. Checked in Task 4, step 3.
3. **Old links keep their path:** `dtkahn.github.io/timer/settings` lands on `colorchime.com/settings`, and `/timer` or `/timer/` lands on `/`. Pinned in the Task 3 test.
4. **Preview isn't counted:** a preview or staging build doesn't load `/_vercel/insights/script.js`. Pinned in the Task 1 test and checked in Task 4, step 3.
5. **The commit shows in Settings:** a Vercel build shows a 7-character SHA, not "dev". Checked in Task 4, step 3.

---

### Task 0: Branch

- [ ] Create the branch `vercel-hosting` from `main`. Commit the spec and this plan to it.

### Task 1: Production-only analytics

**Files:**
- Create: `src/analytics/start-analytics.web.ts`, `src/analytics/start-analytics.ts`
- Test: `src/analytics/__tests__/start-analytics.web.test.ts`
- Modify: `src/app/_layout.tsx` (call once on mount), `package.json`, `package-lock.json`

**Interfaces:**
- Produces: `startAnalytics(vercelEnv: string | undefined = process.env.EXPO_PUBLIC_VERCEL_ENV): void`. The web version calls `inject({ mode: 'production' })` from `@vercel/analytics` exactly once per page load, and only when `vercelEnv === 'production'`. The native version does nothing. The env is a parameter because babel-preset-expo can inline `EXPO_PUBLIC_*` at transform time, so tests pass the value in rather than setting `process.env`.

- [ ] **Step 1:** Run `npx expo install @vercel/analytics --npm`, then confirm `package-lock.json` now contains `@vercel/analytics`.
- [ ] **Step 2: Write the failing tests.** Jest resolves to native by default, so import `../start-analytics.web` explicitly. Mock `@vercel/analytics`, and use `jest.isolateModules` per test so the once-guard resets.
  - `injects in production`: `startAnalytics('production')`, `inject` is called once with `{ mode: 'production' }`.
  - `does nothing on preview`: `startAnalytics('preview')`, `inject` is not called.
  - `does nothing when unset`: `startAnalytics(undefined)`, `inject` is not called.
  - `only injects once`: calling `startAnalytics('production')` twice calls `inject` once.
- [ ] **Step 3:** Run `npx jest src/analytics`. Expect FAIL, because the module isn't found.
- [ ] **Step 4:** Implement both files. Call `startAnalytics()` from a `useEffect` with an empty dependency array in the root layout component.
- [ ] **Step 5:** Run `npx jest src/analytics`. Expect PASS. Then run the full `npm test`, `npx tsc --noEmit` and `npx expo lint`.
- [ ] **Step 6:** Commit with the message "Add Vercel Web Analytics on production only".

### Task 2: Vercel build config

**Files:**
- Create: `vercel.json`
- Modify: `app.json` (remove `experiments.baseUrl`), `README.md` ("Web deployment" section)

- [ ] **Step 1:** Write `vercel.json`. Follow the Expo guide's keys, plus our install, test and environment wiring:
  - `"framework": null`
  - `"installCommand": "npm ci"`
  - `"buildCommand": "npm test && EXPO_PUBLIC_COMMIT=$VERCEL_GIT_COMMIT_SHA EXPO_PUBLIC_VERCEL_ENV=$VERCEL_ENV npx expo export -p web"`
  - `"outputDirectory": "dist"`
  - `"cleanUrls": true`
  - `"rewrites": [{ "source": "/:path*", "destination": "/" }]`
- [ ] **Step 2:** Remove `"baseUrl": "/timer"` from `app.json`.
- [ ] **Step 3:** Run `npx expo export -p web`. Expect `dist/index.html` to reference `/_expo/static/...` with no `/timer` prefix. Check with `grep -c '/timer/' dist/index.html`, which should print `0`.
- [ ] **Step 4:** Rewrite the "Web deployment" section of `README.md`. It should say that pushes to `main` deploy to colorchime.com, that every branch gets a preview link and `staging` has a fixed one, and that the GitHub Pages address only redirects.
- [ ] **Step 5:** Commit with the message "Build and host the web app on Vercel".

### Task 3: GitHub Pages redirect

**Files:**
- Create: `pages-redirect/index.html`
- Modify: `.github/workflows/deploy-pages.yml`
- Test: `src/__tests__/pages-redirect.test.ts`

**Interfaces:**
- Produces: an inline script in `pages-redirect/index.html` that sets the location to `redirectTarget(location)`. The function is defined in the page and is also extracted from it for the test. `redirectTarget({pathname, search, hash}): string` returns `https://colorchime.com` + the path with the leading `/timer` removed, + search + hash.

- [ ] **Step 1: Write the failing test.** Read the HTML, pull out the `redirectTarget` function source between `// redirectTarget:start` and `// redirectTarget:end`, and evaluate it.
  - `/timer/settings` → `https://colorchime.com/settings`
  - `/timer` → `https://colorchime.com/`
  - `/timer/` → `https://colorchime.com/`
  - `/timer/history?x=1#a` → `https://colorchime.com/history?x=1#a`
- [ ] **Step 2:** Run `npx jest pages-redirect`. Expect FAIL.
- [ ] **Step 3:** Write the page. It uses `location.replace(redirectTarget(location))`, has a `<meta http-equiv="refresh">` to `https://colorchime.com/` for visitors without JavaScript, and a visible link reading "Timer has moved to colorchime.com".
- [ ] **Step 4:** Run `npx jest pages-redirect`. Expect PASS.
- [ ] **Step 5:** Change the workflow. Keep the trigger on push to `main` plus `workflow_dispatch`. Drop the install, test and export steps. Copy `pages-redirect/index.html` to `site/index.html` and to `site/404.html`, then upload `site`.
- [ ] **Step 6:** Commit with the message "Point the old GitHub Pages address at colorchime.com".

### Task 4: Vercel project, preview check

- [ ] **Step 1:** Run `vercel link --yes --project color-chime` to create and link the project. Then run `vercel git connect` to connect `DTKahn/timer`. Daniel approves GitHub access if he's prompted.
- [ ] **Step 2:** Push `vercel-hosting`. Expect a preview deployment that passes `npm test` in its build log. Check with `vercel ls` or `vercel inspect`.
- [ ] **Step 3:** Check the preview with the `vercel curl` / protected-deployment skill if it's behind Vercel Authentication, or in the browser while logged in:
  - `/settings` returns the app HTML (Review Focus 1).
  - The `_expo/static` JS returns `application/javascript` (Review Focus 2).
  - The page loads no `/_vercel/insights/script.js` (Review Focus 4).
  - Settings shows the commit SHA (Review Focus 5).

### Task 5: Domains and analytics switch

- [ ] **Step 1:** Run `vercel domains add colorchime.com color-chime`, then the same for `www.colorchime.com`, `colourchime.com` and `www.colourchime.com`. Set the last three to redirect (308) to `colorchime.com`, either in the dashboard under Project → Domains → Edit → Redirect, or through `PATCH /v9/projects/color-chime/domains/<domain>` with `{"redirect":"colorchime.com","redirectStatusCode":308}`.
- [ ] **Step 2:** Run `vercel domains inspect <domain>` for each domain. Give Daniel the exact A and CNAME records to enter in Namecheap's Advanced DNS. He should also remove the parking records Namecheap added.
- [ ] **Step 3:** Daniel enables Web Analytics: Project → Analytics → Enable.
- [ ] **Step 4:** Once DNS has propagated, `vercel domains inspect` shows each domain as valid, and `curl -sI https://colourchime.com/settings` returns `308` with `location: https://colorchime.com/settings`.

### Task 6: Docs, release, merge, staging

**Files:**
- Modify: `AGENTS.md` (Releases section), `src/constants/releases.ts`, `app.json` (version)

- [ ] **Step 1:** Update the Releases section of `AGENTS.md`. Every merge to `main` deploys to colorchime.com on Vercel. Try changes on the `staging` branch's fixed link, or on any branch's preview link, before merging.
- [ ] **Step 2:** Add release `0.12.5` and set `app.json` `version` to `0.12.5`. Name: "Timer has a new home". Change: "The timer now lives at colorchime.com, and the old address takes you there automatically." Set the date at merge time.
- [ ] **Step 3:** Run `npm test`, `npx tsc --noEmit` and `npx expo lint`. All must pass.
- [ ] **Step 4:** Merge to `main` (only after Task 5, step 4 passes) and push. Expect a Vercel production deployment on colorchime.com. The Pages workflow should succeed, and `https://dtkahn.github.io/timer/settings` should land on `https://colorchime.com/settings`.
- [ ] **Step 5:** Create `staging` from `main` and push it. Report its fixed branch URL from `vercel inspect` (the `*-git-staging-*` alias).
- [ ] **Step 6:** Check production in the browser: the timer runs, and `/_vercel/insights/script.js` loads with a 200.
