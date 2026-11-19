# Motion Tuning and the Pull Cord Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the motion from C52 smoother and more obvious, and bring back the pull cord as the theme switch on wide screens, with its own motion.

**Architecture:** Mostly tuning: new shared motion tokens (a softer, longer easing and bigger travel) replace the C50/C52 values in `globals.css`. The cord comes back as a client component restored from `2ec10a6^:src/components/layout/PullCord.tsx`, restyled for paper and ink, wired to the existing `switchTheme` flood.

**Tech Stack:** As C52: Next.js 16.4.4, React 19.3, Tailwind v4, CSS scroll-driven animations, Lenis 1.3.27, Playwright, Vitest.

**Spec:** `docs/03-MASTER-PROMPT.md` amended by `docs/04-DECISIONS.md` (C50, C51, C52). Vincent, 2026-11-19: "make the transition and animation make it smoother and obvious", and "bring back the lamp shade string for light mode and dark mode, also add motion, animation, and transition". Every value below is my call.

## The changes

| Where | Now (C52) | After | Why |
|---|---|---|---|
| Shared easing | `--ease-snap` (0.2, 0.8, 0.2, 1) for everything | `--ease-glide` (0.16, 1, 0.3, 1) for arrivals and page changes; `--ease-snap` kept for hover and press | A long, soft settle reads as smoother; snappy stays for things that answer the pointer |
| Arrivals (sections, rows, header lines) | Rise 16 px over 400 ms | Rise 40 px over 700 ms | Obvious from across the room, still transform only (C50) |
| Page change | Sheet over 460 ms, old page sinks 32 px | Sheet over 700 ms, old page sinks 80 px and falls back to 0.3 | The sheet should be seen sliding up |
| Page titles | Letters rise 0.35 em, lean 6°, 28 ms apart, 520 ms each | Rise 0.9 em, lean 12°, 45 ms apart, 800 ms each | Clearly letter by letter |
| Home poster | Rises 16 px as one (stays whole for LCP) | Line one slides in from the left and line two from the right, 6vw each, 900 ms | An obvious arrival that keeps both lines whole text, the largest paint |
| Row hover | Nudge 12 px over 180 ms; hook opens | Nudge 28 px over 320 ms, the row number slides with it | Visible answer to the pointer |
| Numbers | Roll 700 ms on arrival | Roll 1200 ms, 80 ms apart from left to right | Reads as rolling |
| Skills strip | 60vw over the strip's view | 100vw over the strip's view (still under 1.5 px per px scrolled) | More travel, still a drift |
| Smooth scrolling | Lenis `lerp` 0.12 | `lerp` 0.075 | A longer glide |
| Pull cord | Gone since C51 | Back on screens 1024 px and up, replacing the "Dark" button there (the button stays below 1024 px). Hangs from the top-right; a short settle swing on load (under 3 s, then still); hover draws it down; a tug stretches it, springs back, swings to rest and floods the new theme from the knob; in the dark theme the knob glows like a lit bulb | What Vincent asked for, kept to one theme control per screen size; the swing stops on its own (WCAG 2.2.2) |

## Global Constraints

- Everything from C52's plan still holds: data integrity, no client names, no emojis, private files never committed, gates `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` plus `pnpm test:e2e`, the Lighthouse budgets (LCP ≤ 2000 ms on CI's runner, TBT ≤ 300 ms, CLS ≤ 0.05, home script ≤ 184,320 bytes).
- C50: transform and colour only on content that stays; never fade it.
- Reduced motion turns every move off, the cord's swing included (a tug just switches the theme).
- The poster's two lines stay whole text (C52 ruling: the name must stay the largest paint).
- The cord is a real `button` with `aria-pressed` and an accessible name, at least 44 px tall to hit, hidden in print, and never covering content or focus.
- No AI attribution in commits or the PR.

## Review Focus

1. The bigger travel must not make sideways scroll at 320 px or push rows under the header (sampled scroll positions, as in C52's layout test).
2. Lighthouse on CI's slower runner: the 900 ms poster slide must not move the largest paint later. Check that its first frame is visible (transform only) and that CI's LCP stays under 2000 ms.
3. The cord and the top-bar button must never both show, and at least one theme control is always reachable by keyboard at every width.
4. A tug while a theme flood is still running must not double-switch or desync `aria-pressed`.
5. Under reduced motion, nothing swings, slides or rolls, and the cord still switches the theme.

---

### Task 1: Smoother, more obvious motion

**Files:** `src/app/globals.css`, `src/components/motion/SmoothScroll.tsx`; tests in `tests/e2e/motion.spec.ts`, `tests/e2e/morph.spec.ts`, `tests/e2e/overview.spec.ts`, `tests/e2e/layout.spec.ts`.

- [ ] Failing tests first, each asserting the new value:
  - arrivals are `rise 0.7s` on `--ease-glide` and travel 40 px;
  - title letters have 0.045 s steps and 0.8 s duration;
  - the poster lines' `animationName` is `poster-left` and `poster-right` and they hold no `.letter`;
  - a hovered row's link span translates 28 px;
  - the page-change animations last 0.7 s;
  - the strip travels at most 1.5 px per px scrolled;
  - Lenis is created with `lerp` 0.075 (read from `window.__lenisOptions`, set only when `E2E_SELFTEST` is set, or from the component through a data attribute; choose the one that adds no test hook to production code, and ledger it).
- [ ] Run, watch them fail, apply the table's values as tokens (`--ease-glide`, `--rise: 40px`, `--dur-arrive: 700ms`, `--dur-sheet: 700ms`), run green on chromium, webkit and mobile-chrome.
- [ ] Commit: "Smoother, more obvious motion".

### Task 2: The pull cord is back

**Files:** create `src/components/layout/PullCord.tsx` (restored from `2ec10a6^`, restyled); modify `src/components/layout/SiteHeader.tsx` (the "Dark" button gets `lg:hidden`), `src/app/layout.tsx` (mount the cord), `src/app/globals.css` (cord motion); tests in `tests/e2e/theme.spec.ts`, `tests/e2e/motion.spec.ts`, `tests/e2e/touch.spec.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/resume.spec.ts`.

- [ ] Failing tests first:
  - At 1280 px, a button named "Light switch" exists with `aria-pressed` and the top-bar "Dark theme" button is hidden; at 1023 px it's the other way round.
  - Clicking the cord switches the theme, flips `aria-pressed`, records a `theme` view transition and a `cord-tug` animation; a second click during the flood ends in a consistent state (Review Focus 4).
  - The cord's settle swing (`cord-settle`) has a finite iteration count totalling under 3 s.
  - In the dark theme the knob has a glow (non-`none` `box-shadow`).
  - Reduced motion: no animations on the cord, and a click still switches the theme.
  - Its hit area is at least 44 px tall; it is hidden in print; Tab reaches it at 1280 px and `focusEntirelyObscured` stays false.
- [ ] Run, watch them fail, build the cord and its CSS, run green on all three projects.
- [ ] Commit: "The pull cord is back, with motion".

### Task 3: Decision, gates, review, PR

- [ ] Add C53 to `docs/04-DECISIONS.md` (amends C50's timing, C51's removal of the cord, C52's values).
- [ ] Run every gate, then local Lighthouse 5×5; then a fresh whole-branch review on the most capable model and one fix pass (each fix red then green).
- [ ] Push `design/motion-tuning` (rebased on main once #44 has merged) and open "Smoother motion and the pull cord".
