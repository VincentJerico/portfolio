# Spec sheet direction

Vincent asked (2026-11-08) for more animation and transitions, a new font pairing, and a site that looks
like a professional, creative designer made it, because he tests UI/UX for a living. He shared a folder
of design galleries (Siteinspire, MaxiBestOf, Minimal Gallery, Godly, Are.na "alt web" and others) and
asked for whatever applies. After seeing mockups he picked **A · spec sheet**.

This plan builds on PR #22 (time machine redesign) and lands on the same branch. It adds no facts: every
rendered string still comes from `docs/01-PORTFOLIO-DATA.md` through `src/content`.

## Why

The galleries' strongest portfolios share a few habits: a quiet Swiss sans doing most of the work, one
characterful second face, big display type against tiny dense labels, information laid out like a
spec sheet, index lists instead of card grids, and motion carried by type, lines and timing rather than
effects. The site already plays "a site under test"; a spec sheet is the natural visual language for
that, and it reads as designed rather than templated.

## Goals

- A new font pairing that looks deliberate and specific to a QA engineer.
- Noticeably more motion: on load, on scroll, on hover and between pages.
- Layouts that borrow the galleries' craft (masthead, index list, radial map) inside the existing
  design system: same tokens, 70/20/10 colour split, both themes.

## Non-goals

- No new content, metrics or claims.
- No cursor followers or cursor swarms (tried and removed, decision C37).
- No WebGL, canvas or animation libraries.

## Anti-goals (a failure even if it works)

- Text that is unreadable mid-animation, or motion that blocks reading or clicking.
- Lighthouse going red: TBT stays within 250 ms and performance at or above 0.95 on slow CI runners.
- Anything that breaks the print CV (2 pages), axe (zero violations, both themes), the 44 px touch
  targets, or reduced motion.

## Decided by Vincent

- **Fonts: A · spec sheet.** Host Grotesk for all text and headings. Departure Mono, a pixel
  monospace, for runner data, labels, numbers and code. Archivo and Martian Mono are removed.
- The direction overall: more motion, gallery-grade craft, adapted to Site Under Test.

## The work

### 1. Fonts

- Host Grotesk through `next/font/google` (variable `wght` 300 to 800, latin subset).
- Departure Mono through `next/font/local`. It is not on Google Fonts or npm, so its woff2 (and a woff
  for the OG image renderer, which cannot read woff2) is committed under `src/fonts/` with its licence
  file. **Needs Vincent's approval to download** from the font's GitHub release
  (rektdeckard/departure-mono v1.500, 83 KB zip). If he declines, Fragment Mono (Google Fonts, option C's
  mono) takes its place and the 11 px grid rule below is dropped.
- Departure Mono is drawn on an 11 px grid, so mono text uses 11 px, 13.75 px (11 × 1.25) or 22 px to
  stay crisp; the token scale changes to match.
- Headings: Host Grotesk 700 to 800, tight tracking. Body: 400. Labels stay sentence case.
- The OG image and the icon switch to the new faces (`@fontsource/host-grotesk` for OG).
- The print CV uses Host Grotesk too, with print sizes retuned so it stays at 2 pages (the existing
  CV test checks this). Mono text in print uses Departure Mono at 11 px.

### 2. Masthead (home, above the hero)

A spec strip in Departure Mono that adds only what the hero does not already say, so nothing repeats:
"based in" (location), "tests for" (the tested categories the flip card uses, not the 12 checklist
areas, which are too long for a mono column), and "CI" ("7 of 7 repos with CI", from `metrics.ts`,
with the metric's own label). Name, role and the Manila clock stay in the sidebar; the run totals stay
in the Run summary section. Three columns on desktop, one stacked block on phones. Labels decode letter
by letter on hover (see 6).

### 3. Projects index (home)

The home page's project card grid (the featured projects, as now) becomes an index list: suite
number, name, category, and a link to the report. Hover sweeps a panel up behind the row, slides the name right and opens the hook line
underneath. On touch screens the hook is always shown. The index shows no pass or fail status,
because the site has no verified live CI state to claim. `/projects` keeps the suite doors.

### 4. Coverage map (home QA areas, and /about)

The 12 QA areas radiate from a "vincent" node in an inline SVG. Lines draw in as the section enters
the viewport (CSS scroll-driven animation, with a final-state fallback), labels follow. Hovering or
focusing an area lights its line. All 12 areas have equal weight, since the data does not rank them.
Below 768 px it falls back to the current numbered list. The SVG is decorative; the list stays in the
DOM for screen readers.

### 5. Entrances

- **First-visit boot.** Four corner counters run to 100% and a hairline splits the screen, then the
  hero's own heading reveals. About 1.2 s, once per browser session, on whichever page a visitor lands
  first, CSS only (a tiny inline script sets a class when the session flag is absent). The overlay
  carries only small text, so it can never become the page's largest paint and delay LCP; the name
  reveal is the real `h1`, painted from the start and moved by transform only. It never takes pointer
  events, is `aria-hidden`, is gone from layout when done, and never runs under reduced motion or in
  print. Lighthouse measures the page with the boot, as a first-time visitor gets it, so the boot must
  pass the existing budgets. The E2E fixture sets the session flag so tests do not wait on it; one
  dedicated test runs it.
- **Route curtain.** On navigation an accent curtain wipes up and lifts (View Transitions), replacing
  today's cross-fade, and the new page header rises in. Navigations that carry a shared-name morph
  (a project door into its report) skip the curtain, so the morph stays visible. The curtain carries no
  text, because the next page's name is not known to CSS.
- **Headings** reveal line by line on load (transform only, never opacity on text).

### 6. Hover and micro motion

- Mono labels decode letter by letter on hover or focus. The visible text is an `aria-hidden` copy;
  the real label stays in the DOM untouched, so screen readers never hear scrambled text. One delegated
  listener, installed when the browser is idle.
- Links get an underline that draws from left to right; buttons press; chips tint (existing tokens).
- The stack tools on each report scroll in a slow marquee that pauses on hover and under reduced motion,
  with the static list kept for screen readers.

## Calls Claude made (check these)

- Home gets the index list and `/projects` keeps the doors, so nothing from PR #22 is thrown away.
- The masthead skips name, clock and run totals, which already appear elsewhere on the page.
- The boot runs on the first page of a session, has no large text, and Lighthouse measures it.
- The curtain replaces the cross-fade but steps aside for the door-to-report morph.
- No status column in the index (no verified live CI state).
- Equal weight for all 12 QA areas on the map.
- The curtain carries no page name.
- The boot runs once per browser session, not once ever.
- Departure Mono sizes snap to its 11 px grid.

## Constraints carried over

Data integrity, client confidentiality and no emojis (AGENTS.md); content motion is transform-only;
everything off under reduced motion and in print; both themes pass AA; touch targets at least 44 px;
JavaScript added only where CSS cannot do the job, and only after hydration.

## Verification

- Unit: token and contrast tests; the decode helper keeps the final text exact.
- E2E: masthead facts match `metrics.ts`; index rows match the featured projects in order; the map has 12 labelled
  areas and falls back to the list on phones; the boot runs once per session, never under reduced
  motion, and never intercepts a click; screen readers get unscrambled labels; layout containment spec
  still passes; the CV stays at 2 pages.
- Gates: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`,
  then CI including Lighthouse, with screenshots in the PR.
- Decision C39 recorded in `docs/04-DECISIONS.md`.
