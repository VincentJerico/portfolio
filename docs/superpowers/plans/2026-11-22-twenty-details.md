# Twenty Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Vincent's second list of twenty interface details to the paper-and-ink site, each where the site has something for it.

**Architecture:** Mostly CSS (type, spacing, motion), plus three small client changes: the projects search becomes a combobox, the copy button updates optimistically, and the title letters lay a rising copy over the real, kerned word. New client code stays off the home page.

**Tech Stack:** As C54: Next.js 16.4.4, React 19.3 (ViewTransition), Tailwind v4, CSS scroll-driven animations, Lenis, Playwright (chromium, webkit, mobile-chrome), Vitest, Lighthouse CI.

**Spec:** `docs/03-MASTER-PROMPT.md` amended by `docs/04-DECISIONS.md` (C50–C54). Vincent, 2026-11-22, "ALSO THESE": kerning, optical centre, tabular numbers, layout shift, tracking, optimistic update, x-height, touch target, leading, origin-aware animation, OKLCH, widow, safe area, stagger, line length, affordance, combobox, interruptible animation, progressive disclosure, shared element transition. Where and how each applies is my call, set out below for his OK.

**Branch:** `design/details`, cut from `main` once #48 is merged (from `design/polish` if not, rebased after).

## The twenty details

Measured on the site today: Bricolage has tabular figures ("1111" and "0000" are 117 and 256 px wide at 100 px proportional, both 237 px tabular), and Plex Mono's x-height equals Bricolage's (0.52 em), so inline code only looks small because it is set at 0.875 em.

| # | Detail | Applied to |
|---|---|---|
| D1 | Kerning | Kerning on everywhere (`font-kerning: normal`). Page titles that rise in letter by letter currently lose their kerning, because each letter is its own box. Instead, the real word is laid out kerned, and an aria-hidden copy of its letters rises in on top. When the arrival ends, the copy hides and the kerned word stays. Without motion, there is no copy. |
| D2 | Optical centre | Button, chip, filter and nav labels, and the CV ring's "Download CV", centre on their cap height (`text-box: trim-both cap alphabetic`) instead of their line box. The Contact arrow lines up with the heading's cap height. Engines without `text-box` keep today's look. |
| D3 | Tabular numbers | Numbers that change or line up use tabular figures: the rolling About metrics, the Quality scores and durations, the run summary's counts, and the local time. The local time reserves 8 characters, so "12:34 pm" no longer widens it. |
| D4 | Layout shift | A work row's hook no longer pushes the rows below when it opens on hover. Its space is reserved in the row, and it rises into that space. Contact form messages reserve their line, so an error never moves the button. **This is the one visible layout change in the list: rows sit a little taller on desktop.** |
| D5 | Tracking | One tracking scale: lowercase display type -0.02em (h1, h2, row names, the skills strip, the career labels); uppercase display -0.01em (the poster, the phone menu links); small uppercase mono +0.04em (chips); everything else 0. |
| D6 | Optimistic update | The copy button shows its check the moment it is clicked. If the clipboard refuses, it swaps back and says so. The contact form stays honest and says "sent" only when the server has accepted the message. The theme switch and the project filter are already instant. |
| D7 | x-height | Mono inside sans text (inline code, the résumé's project names, the run summary's tools, ticket ids) matches the sans x-height (`font-size-adjust: ex-height 0.52`) instead of shrinking to 0.875 em. Standalone mono labels keep their sizes. |
| D8 | Touch target | The pull cord's hit area becomes 44 px wide (it is 32 px), nav links at least 44 × 44 px, and the About certification links and the résumé's LinkedIn link at least 44 px on touch screens. |
| D9 | Leading | One leading scale: body 1.6; lead paragraphs and summaries 1.45; h3 1.3; mono labels and chips 1.4. Display type keeps its tight values (h1 0.9, poster 0.8, h2 1.05). |
| D10 | Origin-aware animation | The phone menu opens as a circle growing from the Menu button and closes back into it, like the theme flood. The evidence dialog (it grows from its thumbnail) and the theme flood (it starts from the knob) already start from where you clicked. |
| D11 | OKLCH | Done in C54 for the site's colours. The favicon still uses an old dark-blue palette; it moves to paper and ink. The share images' colours and a new `theme-color` meta tag (light and dark) are worked out from the OKLCH tokens, so all colours come from one place. Hex stays where the renderer needs it. |
| D12 | Widow | Headings and short display lines balance their lines (`text-wrap: balance`). Paragraphs, list items and captions avoid a lone last word (`text-wrap: pretty`). |
| D13 | Safe area | `viewport-fit=cover`. The page gutters, the top bar and the phone menu pad by the device's safe-area insets, so nothing sits under a notch or the home indicator, in landscape or portrait. |
| D14 | Stagger | Groups that arrive together today now arrive 40 ms apart, capped at six (like the filter cards): evidence thumbnails, findings tickets, contact form fields, About metric cards and chip lists. Groups that arrive on scroll stagger through their scroll ranges instead. |
| D15 | Line length | No paragraph runs past 75 characters a line. The résumé's paragraphs and the contact form's hint and message field take the 68-character measure. |
| D16 | Affordance | Every button, summary and label points (the pointer cursor). A work row shows an arrow that slides in on hover or focus, since the whole row is a link. The Contact email's underline draws in on hover or focus. The cord shows its name ("Dark" or "Light") beside the knob on hover or focus. Hover cues apply only where hover exists. |
| D17 | Combobox | The projects search becomes an accessible combobox. A list of up to six matching projects opens under it; the arrow keys move through it, Enter opens a project, and Escape closes the list, then clears. Typing still filters the grid as it does now, and without JavaScript it stays a plain search field. |
| D18 | Interruptible animation | The menu's circle, the menu links' rise and the form's messages become transitions, so a close or a change mid-way reverses from where they are instead of jumping. The cord's tug stays a keyframe swing. |
| D19 | Progressive disclosure | About shows its first three certifications, with the rest behind "Show all n certifications". On a project report, the findings table (each finding also has its own ticket) and the data tables open on demand. Quality's three tables do the same. Print and find-in-page still reach everything. No fact is removed. |
| D20 | Shared element transition | A report's Previous and Next links morph into the next report's title, as the project rows already do. The About capstone row does the same. |

## Global Constraints

- Everything from C54 still holds:
  - data integrity;
  - no client names;
  - no emojis;
  - private files never committed;
  - gates: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, plus `pnpm test:e2e`;
  - Lighthouse budgets: LCP ≤ 2000 ms, TBT ≤ 300 ms, CLS ≤ 0.05, home script ≤ 184,320 bytes.
- Every text pair keeps WCAG AA. Every control keeps 24 × 24 px, or 44 px where touch.spec says so. axe stays clean in both themes.
- C50: never fade text that stays. The letter copy (D1) rises in over the real word and leaves in a single frame, with no fade.
- Reduced motion turns every new move off. Print stays black on white, with every disclosure open.
- New client code ships only on the pages that use it (the combobox only on /projects).
- No AI attribution in commits or the PR.

## Review Focus

1. The rising letter copy must land exactly on the kerned word in chromium and webkit. A visible snap at the end of the arrival is a failure.
2. A long hook in a reserved row must never clip on narrow desktop widths (1024–1280 px), and it must still always show on touch screens.
3. The combobox must not announce twice: its own result count, and the existing "Showing n of m projects" status.
4. The safe-area padding must not double the gutter on desktop browsers, or in landscape on phones.
5. An optimistic check must not stay on screen when the clipboard is blocked by permissions.

---

### Task 1: Type (D1, D3, D5, D7, D9, D12, D15)

**Files:** `src/app/globals.css`, `src/components/motion/Letters.tsx`, `src/components/layout/LocalTime.tsx`, `src/components/ui/InlineCode.tsx`, `src/app/about/page.tsx`, `src/app/quality/page.tsx`, `src/app/resume/page.tsx`, `src/components/contact/ContactForm.tsx`. Tests: `tests/e2e/type.spec.ts` (new), `tests/e2e/motion.spec.ts`.

- [ ] Failing tests:
  - `D1: titles are kerned`: `h1` computes `font-kerning: normal`. After the arrival, the visible title is the real text node and the letter copy is hidden. Under reduced motion there is no visible letter box.
  - `D3: rolling numbers keep their width`: the first About metric's width stays within 0.5 px while it rolls, and the local time is as wide at "9:05 am" as at "12:34 pm" (clock stubbed).
  - `D5/D9: tracking and leading follow the scale`: the letter spacing and the line height (as a ratio of font size) per role equal the table above, within 0.005.
  - `D7: inline mono matches the x-height`: inline code computes `font-size-adjust` as ex-height 0.52 at 1 em.
  - `D12: lines balance`: h1–h3 compute `text-wrap-style: balance`, and `main p` computes `pretty`. At 390 px, a wrapping report title's lines are within 30% of each other's width.
  - `D15: no paragraph runs past 75 characters`: on every route at 1440 px, each `main p` is at most 75 times the width of "0" in its own font.
- [ ] Watch them fail, implement, and watch them pass on chromium and webkit.
- [ ] Commit "Kerned titles, tabular numbers, one tracking and leading scale, balanced lines".

### Task 2: Layout and touch (D2, D4, D8, D13, D16)

**Files:** `src/app/globals.css`, `src/app/layout.tsx` (viewport export), `src/components/layout/SiteHeader.tsx`, `src/components/layout/SiteMenu.tsx`, `src/components/content/WorkList.tsx`, `src/components/layout/PullCord.tsx`, `src/components/contact/ContactForm.tsx`. Tests: `tests/e2e/layout.spec.ts`, `tests/e2e/touch.spec.ts`, `tests/e2e/overview.spec.ts`, `tests/e2e/cord.spec.ts`.

- [ ] Failing tests:
  - `D4: hovering down the work list shifts nothing`: a PerformanceObserver records 0 layout shift while the pointer crosses three rows.
  - `D4: a form error never moves the button`: the submit button's top is unchanged after an empty submit.
  - `D8`: the cord button is at least 44 px wide; nav links are at least 44 × 44 px; the certification and LinkedIn links are at least 44 px under `pointer: coarse`.
  - `D13`: the viewport meta contains `viewport-fit=cover`. Chromium only (`@chromium-only`): with safe-area insets of 44/47/44/34 px emulated through CDP, the shell pads at least 44 px left and right, and the open menu pads at least 34 px at the bottom.
  - `D16`: every button and summary computes `cursor: pointer`; a focused work row shows its arrow; the focused cord shows its name.
  - `D2`: the CV ring label and the button labels compute `text-box-trim: trim-both` where it is supported.
- [ ] Watch them fail, implement, and watch them pass on all three projects.
- [ ] Commit "No layout shift on hover, larger targets, safe areas, clearer affordances".

### Task 3: Motion (D10, D14, D18, D20)

**Files:** `src/app/globals.css`, `src/components/layout/SiteMenu.tsx`, `src/lib/theme-switch.ts` (shared origin helper), `src/components/content/EvidenceGallery.tsx`, `src/components/content/DefectTicket.tsx`, `src/app/projects/[slug]/page.tsx`, `src/app/about/page.tsx`. Tests: `tests/e2e/motion.spec.ts`, `tests/e2e/morph.spec.ts`.

- [ ] Failing tests:
  - `D10: the menu grows from its button`: halfway open, the point under the Menu button is the dialog and the bottom-left corner is not.
  - `D14: groups arrive one after another`: the nth evidence thumbnail and the nth ticket start `min(n, 6) × 40 ms` after the first.
  - `D18: closing the menu mid-way reverses`: the links' animations are CSS transitions, and closing at 120 ms reverses from their current offset.
  - `D20: Next morphs into the next title`: during navigation, the Next link's name and the next report's h1 share one view-transition name.
- [ ] Watch them fail, implement, and watch them pass; reduced motion turns all of it off.
- [ ] Commit "The menu grows from its button; staggered groups; reversible moves; more morphs".

### Task 4: Interaction (D6, D11, D17, D19)

**Files:** `src/components/ui/CopyButton.tsx`, `src/components/content/ProjectFilter.tsx` (combobox), `src/app/icon.svg`, `src/lib/og.tsx`, `src/app/layout.tsx` (theme-color), `src/app/about/page.tsx`, `src/app/projects/[slug]/page.tsx`, `src/app/quality/page.tsx`. Tests: `tests/e2e/projects.spec.ts`, `tests/e2e/overview.spec.ts`, `tests/unit/tokens.test.ts`, `tests/e2e/resume.spec.ts` (print).

- [ ] Failing tests:
  - `D6`: with the clipboard write held for one second, the check shows within 100 ms. If the write rejects, the copy icon returns and the status says it could not copy.
  - `D17`: the search is `role="combobox"` with `aria-expanded`. ArrowDown sets `aria-activedescendant` to the first option, Enter opens `/projects/<slug>`, Escape closes the list and a second Escape clears it. axe is clean, and with JavaScript off it is a plain search box.
  - `D19`: About lists three certifications until "Show all" is opened. Print shows them all. Report and Quality tables sit in `<details>`, and their rows are unchanged.
  - `D11`: the share-image colours and the favicon's colours equal the tokens converted from OKLCH, and `theme-color` metas exist for light and dark.
- [ ] Watch them fail, implement, and watch them pass.
- [ ] Commit "Optimistic copy, a project combobox, disclosure, one colour source".

### Task 5: Decision, gates, review, PR

- [ ] Add C55 to `docs/04-DECISIONS.md` (it amends C51's type values and C52's menu arrival).
- [ ] Run every gate and a local Lighthouse 5×5.
- [ ] Get a fresh whole-branch review on the most capable model, then do one fix pass (red, then green).
- [ ] Take screenshots for Vincent, then push and open "Twenty interface details: type, targets, motion and disclosure".
