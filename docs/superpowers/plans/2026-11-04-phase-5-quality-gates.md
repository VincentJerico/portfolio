# Phase 5: Quality Gates — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every gate in spec Section 12 runs in CI on every PR, each gate is proven able to fail, and `/quality`
shows the real results of the latest run on `main`.

**Spec:** `docs/03-MASTER-PROMPT.md` Section 12 and 14 Phase 5; amended by `docs/04-DECISIONS.md` (C21: total
JS on `/` ≤ 180 KB, Lighthouse transfer size; D1: deploy and the quality report run from Actions).

## Already in place (Phases 1–4)

Unit guards and self-tests (12.2), per-route 200/h1/main/skip link, overflow at the six widths, console errors,
heading order, drawer/dialog focus guards, theme persistence, CV PDF checks, signature feature tests, security
header tests. This phase fills the gaps and wires the pipeline.

## Global Constraints

- Playwright projects: `chromium`, `webkit`, `mobile-chrome`; CI `retries: 2`, `failOnFlakyTests: true`.
- axe tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`; zero violations on every route in both themes; axe
  JSON attached to the report.
- Lighthouse (mobile preset, 3 runs, median) on `/`, `/projects`, `/projects/accessibility-testing`, `/about`,
  `/resume`: performance ≥ 0.95, accessibility = 1, best-practices ≥ 0.95, seo = 1; budgets: total JS on `/` ≤
  180 KB transfer size (C21), LCP ≤ 2000 ms, CLS ≤ 0.05, TBT ≤ 250 ms (C22).
- lychee excludes `legatalink.free.nf` (bot check), with the reason shown on `/quality`.
- A gate that can't fail isn't a gate: every gate has a self-test that is shown failing.

## Review Focus

1. **`quality.json` written by a run where some jobs failed:** `/quality` and the sidebar must show those gates
   as FAIL, never a stale PASS. Pinned in Task 5 (unit test of the aggregator with a failing job).
2. **The self-test page leaking into production:** it exists only in builds with `E2E_SELFTEST=1`; production
   builds 404 it and it never appears in the sitemap or nav. Pinned in Task 2.
3. **WebKit differences** (focus, `<dialog>`, invoker commands, clipboard): the whole suite must pass on WebKit.
   Pinned in Task 1.
4. **A form input with only a placeholder** (the command palette): visible label required (guard F-6). Pinned in
   Task 1.
5. **The bot commit of `quality.json` re-triggering CI forever:** `[skip ci]` and a `main`-only condition.
   Pinned in Task 5 (workflow review + the job's `if`).

---

### Task 1: Playwright matrix, axe in both themes, remaining 12.3 guards

- `playwright.config.ts`: add `webkit` (Desktop Safari), `retries: process.env.CI ? 2 : 0`, `failOnFlakyTests`,
  JSON reporter (`test-results/results.json`) for the quality report.
- `tests/helpers/a11y.ts`: `expectNoViolations(page, testInfo)` (AxeBuilder, tags above, attaches JSON).
- `tests/a11y/routes.spec.ts`: every route × light/dark → `expectNoViolations`.
- Keyboard guards still missing from 12.3: visible-label check for every input (F-6, palette gets a visible
  "Search the site" label), every route's interactive controls activate with Enter/Space (sample: filter,
  toggle, copy, CV link), reduced motion disables transitions (computed `transition-duration` ~0),
  `isFocusEntirelyObscured()` port used by the drawer, image dialog, palette and runner tests, internal-link
  crawl from `/` (every same-origin link resolves < 400).
- Full suite green on all three projects.

### Task 2: Self-test page and gate self-tests

- `src/app/selftest/page.tsx`: `notFound()` unless `E2E_SELFTEST=1` at build; when on, renders a planted
  contrast failure and a focus-trap bug (a modal-looking panel that lets Tab escape behind it).
- `tests/selftest/gates.spec.ts`: `expectNoViolations` on `/selftest` must throw (by rule `color-contrast`);
  the focus-obscured guard must report the planted element; the in-page runner reports FAIL there.
- `src/lib/header-check.ts`: `headerDefects(headers, siteUrl)` used by `tests/security`; unit self-test feeds a
  non-compliant header set and expects one defect per header plus wildcard CORS.
- Production build test: `/selftest` returns 404 and is absent from `sitemap.xml`.
- `pnpm test:selftest` script and CI step: the self-test specs run and are expected to pass (they assert the
  gates fail on planted defects).

### Task 3: Lighthouse CI and lychee

- `lighthouserc.json` per Global Constraints, `startServerCommand: pnpm start -p 3300`, Chrome from Playwright.
- `lychee.toml`: exclude `legatalink.free.nf`, accept 200/204/206/429, cache, max retries.
- `.lighthouseci/` git-ignored. Local run recorded for the DoD scores table.

### Task 4: CI pipeline (12.6) and Dependabot

- Jobs: `static`; `build` (needs static; `E2E_SELFTEST=1`; CV PDF; uploads `.next` + `public/cv`); `e2e`
  matrix chromium/webkit/mobile-chrome (uploads HTML report + JSON results); `lighthouse` (needs build; LHCI
  autorun; uploads `.lighthouseci`); `links` (needs build; lychee on the prerendered HTML in `.next/server/app`;
  also `schedule: weekly`); `quality-report` (main only, `if: always()` after the gates).
- `.github/dependabot.yml`: npm and github-actions, weekly.

### Task 5: quality.json and /quality

- `scripts/build-quality-report.ts`: inputs = job results (env from `needs.*.result`), Playwright JSON
  results (per-route status/duration from the chromium run), LHCI manifest → writes `src/generated/quality.json`
  (`sample: false`). Unit-tested with fixtures, including a failed job.
- `quality-report` job runs it and commits `chore(quality): update report [skip ci]` to `main`.
- `/quality`: last run (date, short SHA, overall), gates table (gate · tool · result · details), Lighthouse
  scores per route, per-route E2E table, gate explanations with their self-tests ("A gate that can't fail isn't
  a gate"), the lychee exclusion and its reason, the D1 note (tested build vs deployed build differ only in
  this report and the PDF), link to the Actions run. With the sample report every result reads "not run".
