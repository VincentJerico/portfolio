# Phase 3b: The Site Under Test — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The four signature features (spec 4.4 A–D), the hero runner block, and the approved UX additions
P1–P5, all keyboard/touch/mouse operable, honest (no scripted outcomes, no fake PASS), and within the JS budget
policy Vincent decides.

**Architecture:** Server components stay the default. Client islands: `TestExplorerNav` (A + P1),
`RunSuiteButton` → dynamically imported `RunnerPanel` + `runner/checks/*` (B; axe-core loads only on click),
`BugHuntProvider` + `Inspectable` (C), `CommandPalette` (P3, dynamically imported on first Cmd/Ctrl+K).
`src/generated/quality.json` (sample, `"sample": true`) is read on the server and passed as props.

**Spec:** `docs/03-MASTER-PROMPT.md` 4.3, 4.4, 7.1, 7.3, 12.3 (signature tests), 14 Phase 3b; amended by
`docs/04-DECISIONS.md` (P1–P5 approved by Vincent 2026-10-25).

## Global Constraints

- Never a fake PASS: with `quality.json` sample or missing, every status reads "not run".
- Runner checks are real; failures are shown honestly. axe tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`.
- Bug Hunt is off by default, opt-in (`?bughunt=1` or toggle), persisted in `localStorage` inside try/catch,
  never active without JS, on `/resume`, or in print; turning it off restores every true value immediately;
  zero axe violations with it on.
- Ticket bodies are quoted or closely paraphrased from the repos' `docs/FINDINGS.md`; missing fields are
  omitted, never written fresh.
- Single-key shortcuts are forbidden (WCAG 2.1.4); the palette uses Cmd/Ctrl+K only.
- Motion CSS-only, off under `prefers-reduced-motion`.

## Review Focus

1. **Bug Hunt toggled off mid-hunt on a page with a planted bug:** the true value returns without reload.
   Pinned in Task 5.
2. **Runner launched twice quickly, or closed mid-run:** no duplicate panels, no unhandled rejection, focus
   returns to the trigger. Pinned in Task 4.
3. **`localStorage` blocked (Safari private, sandboxed iframe):** coverage, Bug Hunt and theme still work for
   the visit. Pinned in Tasks 1 and 5.
4. **Command palette with a query that matches nothing, then Esc:** "No results" announced; focus returns.
   Pinned in Task 6.
5. **A deep link to `#ticket-F-7`:** opens that ticket and scrolls it into view. Pinned in Task 2.

---

### Task 1: Test explorer sidebar, quality.json and coverage (A, P1)

**Files:** Create `src/generated/quality.json` (`{ "sample": true, ... }`), `src/lib/quality.ts`,
`src/components/explorer/{TestExplorerNav,SiteChecksChip}.tsx`, `src/lib/coverage.ts`; Modify Sidebar,
MobileNav; Tests `tests/unit/quality.test.ts`, `tests/e2e/explorer.spec.ts`.

- `QualityReport` Zod schema: `sample`, `generatedAt`, `commit`, `runUrl`, `overall`, `gates[]`,
  `routes: Record<path, { status: 'pass'|'fail'; durationMs: number }>`; `routeStatus(report, path)` →
  `'pass'|'fail'|'not-run'` (always `not-run` when `sample`).
- Explorer: header `portfolio.spec` + summary ("not run yet" for sample, else "{n} passed · {m} failed · last
  run {date}"); rows = status dot (+ visually hidden "passing"/"failing"/"not run"), page name (the link's
  accessible name), `aria-hidden` mono spec label and duration; Projects is a disclosure (`aria-expanded`) with
  one child row per project. Footer chip "Site checks: {PASS|FAIL|not run}" → `/quality`.
- P1: visited paths stored in `localStorage` (`vj:coverage`), try/catch; rows show a visited tick
  (`aria-hidden`, plus visually hidden "visited"); line "You've covered {k} of {n} pages" counts top-level
  nav pages.
- Tests: unit for `routeStatus`; E2E nested lists inside `<nav>`, accessible names equal page names, Projects
  folder toggles `aria-expanded`, sample → every row "not run" and no "passing" text anywhere, coverage counts
  up after visiting two pages, coverage works with `localStorage` throwing.

### Task 2: Defect ticket bodies and severity drill-down (D, P4)

**Files:** Modify `src/content/schema.ts` (Finding: `impact?`, `recommendation?` — logged), `src/content/
projects.ts`, `DefectTicket`, `RunSummaryPanel`, `FindingsTable`; Create `src/components/content/
TicketOpener.tsx`; Tests `tests/unit/tickets.test.ts`, `tests/e2e/tickets.spec.ts`.

- Transcribe for accessibility (7), security (8), performance (3): `actual` ← Observed, `steps` ← Reproduce
  (split into steps only where the source lists them), `impact`, `recommendation`, `trackedBy`, `ticketStatus`
  ("Pinned by test" where the source says the test pins the defect; D-1 "Report only").
- Unit test: every ticket string, markdown stripped and whitespace normalised, is a substring of the
  normalised source file (sources read from `tests/fixtures/findings/*.md`, copied from the clones).
- P4: severity chips in the run summary open (and scroll to) every ticket of that severity; any
  `#ticket-ID` hash opens that ticket on load and on `hashchange`.

### Task 3: Hero runner block

**Files:** Create `src/components/content/RunnerHeroBlock.tsx`; Modify `src/app/page.tsx`; Test in
`tests/e2e/overview.spec.ts`.

- `aria-hidden` block: `$ npx playwright test --project=vincent` then 5 result lines built only from metrics
  (`PASS  accessibility-testing  7 WCAG failures found where axe reported 0`, etc.); types in once via CSS
  `steps()` animation; fully static under reduced motion. The same facts already exist as text in the
  metric strip.

### Task 4: Run tests on this page (B)

**Files:** Create `src/components/runner/{RunSuiteButton,RunnerPanel}.tsx`, `src/components/runner/checks/
{a11y,structure,images,links,headers,performance,index}.ts`, `src/app/selftest/page.tsx` (only when
`E2E_SELFTEST=1`); Tests `tests/e2e/runner.spec.ts`.

- Button in sidebar footer, `/quality` and the overview strip; on click `import('./RunnerPanel')`, which
  imports `axe-core`. Panel = native modal dialog, mono lines with PASS/FAIL/WARN chip and per-check time,
  summary "{p} passed, {f} failed in {t}s" in an `aria-live="polite"` region (summary only), Bug Hunt line.
- Checks: axe (tags above), document structure (one h1, no skipped levels, main, lang), images alt, same-origin
  links HEAD < 400 (external listed only), security headers (spec 10; WARN until Phase 4 adds them), performance
  (nav timing, LCP, CLS vs 12.5 budgets).
- Tests: axe chunk not requested before click; all 6 checks report on `/`, `/projects`, a report page; focus into
  panel and back; double-click opens one panel; self-test page reports its planted contrast and alt failures.

### Task 5: Bug Hunt (C)

**Files:** Create `src/content/bug-hunt.ts` (5 PlantedBug), `src/components/bughunt/{BugHuntProvider,
BugHuntToggle,Inspectable,DefectTicket,HuntBanner}.tsx`; Modify the five host components; Tests
`tests/e2e/bughunt.spec.ts`.

- Bugs (approved 2026-10-24): HUNT-01 `/skills` heading "Accessibilty"; HUNT-02 `/` metric shows "109" with
  "91 Playwright UI + 17 Playwright API"; HUNT-03 `/about` timeline "Published performance-testing (k6)" dated
  2027-10-24; HUNT-04 `/projects` one card offset 3px; HUNT-05 `/` "Download CV" with an external-link icon.
- Inspectables on many clean elements per page (headings, metric tiles, cards, timeline rows, hero buttons):
  an "Inspect" button appears in hunt mode; clean → "No defect here."; planted → defect ticket
  (ID, title, severity, steps, expected, actual, would be caught by). Counter "Bugs found k/5", hints list
  (page of each unfound bug), completion card "5 of 5 found." with an email CTA.
- Tests: off by default; `?bughunt=1` on; all 5 found by keyboard only; clean element says "No defect here";
  turning off restores true DOM text for each planted element; axe 0 violations in hunt mode; absent on
  `/resume`, in print and without JS; works with `localStorage` throwing.

### Task 6: P2 next links, P3 command palette, P5 view transitions

**Files:** Create `src/lib/next-spec.ts`, `src/components/content/NextSpec.tsx`,
`src/components/palette/{CommandPaletteTrigger,CommandPalette}.tsx`; Modify `next.config.ts`
(`experimental.viewTransition` per bundled docs) and `globals.css`; Tests `tests/unit/next-spec.test.ts`,
`tests/e2e/palette.spec.ts`.

- P2: fixed reading order Overview → Projects → each report (by order) → Client Work → case studies → Skills →
  About → Resume → Quality → Contact → Overview; each page ends with "Next: {page}".
- P3: Cmd/Ctrl+K and a visible "Search" button open a combobox dialog (pages, projects, findings by ID/title);
  arrow keys, Enter, Esc; "No results" in a live region; focus returns to the opener.
- P5: route changes cross-fade via the View Transitions API; disabled under reduced motion.

### Task 7: JS trim and DoD

- Replace lucide icons in client components with inline SVG (≈9 KB); measure gzipped JS per route.
- DoD: screenshot sequence of each feature on mobile and desktop, runner output from 3 routes, Bug Hunt played
  to 5/5 with keyboard only, JS numbers.
