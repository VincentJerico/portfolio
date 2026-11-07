# Time Machine Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Blend Vincent's "Site Under Test" concept with the qualities he picked from a reference reel:
physical, playful objects (a flip calendar, a pull-cord light switch, doors), a live local-time readout
and a "back in time" story section. Adapt the ideas without copying the reference.

**Architecture:** Four small client components (flip card, pull cord, local time, year odometer
helpers) plus CSS-only treatments for the doors and the time machine. All content comes from the
existing typed content (`profile`, `projectsInOrder()`, `timeline`, `categoryLabel`). The test-explorer
sidebar stays. No new dependencies.

**Tech Stack:** Next.js 16 App Router, React 19.3, Tailwind v4, Vitest, Playwright.

**Spec:** `docs/03-MASTER-PROMPT.md`, amended by `docs/04-DECISIONS.md` (C31 to C37). Reference reading,
confirmed by Vincent on 2026-11-08.

## Global Constraints

- Every rendered fact comes from `docs/01-PORTFOLIO-DATA.md` through `src/content`. No new copy that
  states a fact (no "available for work", no "remote-first"; `openToWork` is not verified).
- No client names, no emojis, no placeholder text.
- Sidebar navigation on desktop, drawer on mobile (spec 2.4). Decided by Claude, reversible: no top bar.
- WCAG 2.2 AA. Anything that moves on its own for more than 5 s has a pause control (SC 2.2.2). Every
  object is operable by keyboard and named for screen readers. Nothing animates under reduced motion.
- Lighthouse: performance at least 0.95 and TBT at most 250 ms on every audited route (lighthouserc.json).
- Gates: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.

## Review Focus

1. **Reduced motion.** The flip card must not auto-rotate, and the doors and cord must not animate. The
   flip card's own Next button still works.
2. **Screen readers.** The flip card's rotating word must not be announced on every flip. The full list
   is read once as static text.
3. **Hydration.** The local-time readout must not mismatch between server and client, and must reserve
   its width so nothing shifts (CLS at most 0.05).
4. **Theme from the cord.** The pull cord and the sidebar toggle must stay in sync. They need different
   accessible names so existing `Dark theme` tests stay unambiguous.
5. **Doors at 320 px.** The door grid must not overflow horizontally, and hit targets stay at least
   44 px tall.

---

### Task 1: Flip card in the overview hero

**Files:**
- Create: `src/components/content/FlipCard.tsx`
- Modify: `src/app/page.tsx` (hero, under the headline)
- Test: `tests/e2e/overview.spec.ts`

**Interfaces:**
- Produces: `FlipCard({ lead, words }: { lead: string; words: string[] })`.

The words are the project category labels in project order, de-duplicated:
`[...new Set(projectsInOrder().map((p) => categoryLabel(p.category)))]`. The lead is "I test for".

- [ ] **Step 1: Write failing tests.**
  - `flip card cycles the tested areas and pauses`: the `Pause` button has `aria-pressed="false"`.
    Clicking `Next area` changes the visible word and the counter (`02 / NN`). Clicking Pause stops the
    rotation, so the word is unchanged after 4 s.
  - `flip card is static under reduced motion`: the word is unchanged after 4 s, and `Next area` still
    advances it.
  - `flip card reads once for screen readers`: an sr-only element has the text `I test for` plus every
    word joined by ", ". The visual card is `aria-hidden`.
- [ ] **Step 2: Run them and confirm they fail.** `pnpm test:e2e tests/e2e/overview.spec.ts`
- [ ] **Step 3: Implement.** The card is a spiral-bound plate with a row of rings drawn in CSS. The
  word flips with a `rotateX` page turn every 2.6 s. A visible pause/play button and a next button
  each have `min-h-11`. Auto-rotation stops under reduced motion and when the tab is hidden.
- [ ] **Step 4: Run the tests and confirm they pass.**
- [ ] **Step 5: Commit.** `feat(overview): flip card of tested areas`

### Task 2: Pull-cord light switch and local time

**Files:**
- Create: `src/components/layout/PullCord.tsx`
- Create: `src/components/layout/LocalTime.tsx`
- Modify: `src/app/layout.tsx` (desktop only: cord fixed at the content column's top right, time in a
  slim status line above main)
- Test: `tests/e2e/theme.spec.ts`, `tests/e2e/shell.spec.ts`

**Interfaces:**
- Produces: `PullCord()`, a button named `Light switch` with `aria-pressed` equal to "light is on".
- Produces: `LocalTime({ timeZone, place }: { timeZone: string; place: string })`, which renders
  `Local time 2:14 pm · Cavite, Philippines`. `place` is `profile.location` and `timeZone` is
  `Asia/Manila`.

- [ ] **Step 1: Write failing tests.**
  - `pull cord switches theme and stays in sync with the sidebar toggle`: clicking `Light switch` adds
    `.light` to `<html>`, `Dark theme` becomes `aria-pressed="false"`, and the theme persists across a
    reload.
  - `local time shows Manila time for the profile location`: matches
    `/^Local time \d{1,2}:\d{2} (am|pm) · Cavite, Philippines$/`. The element has a reserved
    `min-width` so the page has no layout shift (assert the existing CLS test still passes).
- [ ] **Step 2: Run them and confirm they fail.**
- [ ] **Step 3: Implement.** The cord is a 1 px line with a knob. On click it stretches and springs
  back (CSS keyframe), then toggles the theme through `next-themes`. Hide it below 1024 px, where the
  drawer has the toggle. Local time renders an empty, width-reserved span on the server, then fills in
  after hydration and updates every 30 s.
- [ ] **Step 4: Run the tests and confirm they pass.**
- [ ] **Step 5: Commit.** `feat(shell): pull-cord light switch and local time`

### Task 3: Time machine on /about

**Files:**
- Create: `src/components/content/TimeMachine.tsx` (server component)
- Create: `src/lib/timeline-years.ts`
- Modify: `src/app/about/page.tsx` (replace the timeline section body)
- Test: `tests/unit/timeline-years.test.ts`, `tests/e2e/sections.spec.ts`

**Interfaces:**
- Produces: `groupByYear(events: TimelineEvent[]): { year: string; events: TimelineEvent[] }[]`. The
  year is the first four characters of `date`, groups stay in data order, and events with `kind ===
  'next'` go in a final group titled `Next`.

- [ ] **Step 1: Write failing unit tests.** `groupByYear` keeps the data order. A range like
  `'2025-01 to 2025-11'` lands in 2025. `next` events form the last group. Empty input returns `[]`.
- [ ] **Step 2: Write a failing e2e test.** The time machine shows one big year per group, and every
  timeline title appears exactly once.
- [ ] **Step 3: Implement.** Each year group is a two-column grid. On the left is a sticky, very large
  extruded year (layered `text-shadow`, decorative and `aria-hidden`, with the year also in an `h3`
  for screen readers). On the right is the group's events on the existing timeline track. Sticky
  stacking makes the next year push the previous one up, which reads as the year rolling over, with
  no JS. Below 768 px it collapses to one column with an inline year. A faint dust layer (static
  radial dots) moves with a scroll-linked parallax only.
- [ ] **Step 4: Run the tests and confirm they pass.**
- [ ] **Step 5: Commit.** `feat(about): time machine timeline`

### Task 4: Suites behind doors on /projects

**Files:**
- Create: `src/components/content/SuiteDoor.tsx`
- Modify: `src/app/projects/page.tsx` (cards become doors)
- Modify: `src/app/projects/[slug]/page.tsx` (breadcrumb link text `Back to the suites`)
- Test: `tests/e2e/projects.spec.ts`

**Interfaces:**
- Consumes: `Project` from `src/content/schema.ts`.
- Produces: `SuiteDoor({ project }: { project: Project })`, which renders `<article>` with one link
  named `Read the report for <name>`. It keeps the project-title `ViewTransition` name from
  `ProjectCard`.

- [ ] **Step 1: Write failing tests.** The projects grid still renders one `main article` per project,
  and filter and search still work (existing tests). The door link is at least 44 px tall. No
  horizontal overflow at 320 px.
- [ ] **Step 2: Implement.** A tall panel shows a label plate (`suite 01 · Accessibility`), a handle
  and the project name. On hover or focus the panel swings open about 22° on a left hinge
  (`perspective`, `rotateY`, origin left). Behind it is the hook text and `Read the report`. On click,
  the route transition plays a full swing. Reduced motion shows the hook below the name with no swing.
- [ ] **Step 3: Run the tests and confirm they pass.**
- [ ] **Step 4: Commit.** `feat(projects): suites behind doors`

### Task 5: Portrait treatment and motion budget

**Files:**
- Modify: `src/components/content/PortraitCard.tsx`, `src/app/globals.css`
- Test: Lighthouse via CI and the existing `overview.spec.ts`

- [ ] **Step 1:** The portrait shows in grayscale and turns to color on hover or focus within the card
  (`filter` transition).
- [ ] **Step 2:** Keep the content motion within the TBT budget. Scope the scroll-linked stream-in to
  timeline items, table rows and cards rather than every `li` (see the measurement in PR #21's fix).
- [ ] **Step 3:** Record decision C38 in `docs/04-DECISIONS.md`.
- [ ] **Step 4:** Run all gates, push, open a PR stacked on `design/principles-pass`, and share the
  preview link.

## Changes made while building (2026-11-08)

- **Flip card lead.** "My suites cover" replaces "I test for". Category labels such as
  "Full-stack testing" read awkwardly after "test for". Hub and capstone are excluded because they are
  not testing areas.
- **Local time placement.** The time sits under the identity block (sidebar and drawer) instead of a
  status line above main. That keeps main free of a new row and of any layout shift.
- **Door swing.** The panel opens 80 degrees, and the back side has 24% left padding, so the result
  text clears the open door.
- **Breadcrumb.** The report breadcrumb keeps "Projects"; "Back to the suites" was not needed.
