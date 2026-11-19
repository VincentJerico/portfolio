# Motion Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add eleven motion moves to the live minimal site (C51), each taken from the reference site and remade from Vincent's own content and paper-and-ink look, never copied.

**Architecture:** CSS first. Every scroll effect is a CSS scroll-driven animation inside `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`, with the final, static layout as the fallback. Text effects are server-rendered spans. The only new JavaScript is smooth scrolling, loaded at idle, on fine pointers only.

**Tech Stack:** Next.js 16.4.4 App Router, React 19.3 `ViewTransition`, Tailwind v4, CSS scroll-driven animations, `lenis` 1.3.27 (exact pin), Playwright, Vitest.

**Spec:** `docs/03-MASTER-PROMPT.md` amended by `docs/04-DECISIONS.md` (C50 one rhythm, C51 minimal reset). Vincent, 2026-11-18, on the reference site's eleven moves: "all just improve and enhance it make it as reference but don't clone it". The "The moves" table below is the design for this pass, and every row in it is my call.

## The moves

| # | Reference does | Ours does | Why it differs |
|---|---|---|---|
| 1 | A solid panel wipes up, shows the next page's name, lifts away | The new page slides up over the old like a sheet of paper, clipped from the bottom edge; the old page sinks 32 px under it; the new title then arrives letter by letter (move 2) | No curtain card: the paper sheet is the site's own material |
| 2 | Hero letters slide up from behind a mask | Every page title's letters rise 0.35 em and straighten from a 6 degree lean, 28 ms apart; nothing starts hidden | A mask hides the title on the first frame and would delay LCP (budget 2000 ms); a lean-and-rise is ours |
| 3 | Intro words go grey to white as you scroll | On home, `profile.intro` sits under the poster and its words ink in from muted to ink as the paragraph crosses the screen | Muted and ink are both AA tokens, so contrast holds at every frame (C50 rule: never opacity) |
| 4 | Stats count up from zero | About's "In numbers" digits roll like an odometer into the recorded value, each digit travelling its own distance; words in values ("of", "s p95", "requests/s") stay still | Lands on the exact data string; never a rounded or interpolated number |
| 5 | A text ring spins forever around "More about me" | A text ring of `profile.role` and `profile.location` around the CV link turns only while you scroll | Scroll-linked, so nothing moves on its own (WCAG 2.2.2) and nothing costs anything at rest |
| 6 | One tool marquee loops forever | Two rows of Vincent's proven skills slide in opposite directions as you scroll, ink and muted alternating, an accent slash between | Scroll-linked (2.2.2 again); no outlined text, which fails contrast checks |
| 7 | Work cards pin and slide sideways | On About, the career path pins and its four steps slide sideways as you scroll down, from IT Support Intern to what is next | No client screenshots exist to show, and a non-interactive list can't trap keyboard focus off screen |
| 8 | Service cards stick and stack | "How I test" becomes a deck: each of the 12 areas sticks 8 px below the one before, so the checklist piles up as you read | Sticky only, no animation: zero cost on a Lighthouse route |
| 9 | Smooth inertial scrolling | Same idea, on mouse and trackpad only; touch, keyboard, reduced motion and open dialogs keep native scrolling | Narrow on purpose: scroll smoothing is the one move with real accessibility cost |
| 10 | Film grain on top; header inverts colours | A still paper grain behind the content (never over text); a hairline draws out under the header once you leave the top | Colour inversion turns navy and vermilion into off hues with unknown contrast |
| 11 | Page flips to a light "Let's talk" end | Home's Contact becomes the ending: a sheet in the opposite theme that grows from a rounded card to full bleed as it scrolls in, with an arrow that draws itself | Reuses the other theme's AA-checked tokens; no new copy |

## Global Constraints

- "Every rendered fact comes from `docs/01-PORTFOLIO-DATA.md`. Never invent, round, aggregate or embellish." New visible copy in this pass: none beyond existing data and UI labels already on the site ("Download CV").
- "No client names, regions, logos, URLs, staff names or screenshots anywhere, including metadata, alt text, OG images and commit messages."
- "No emojis anywhere in the product." No decorative glyphs such as stars either; the separator is a slash.
- "Private files never committed: `docs/*.pdf`, `assets-inbox/`, `.env.cli`, `.env*.local`, `tests/fixtures/client-denylist.txt`."
- Gates: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, plus `pnpm test:e2e` (UI changed).
- Lighthouse budgets (`lighthouserc.json`, median of 5): performance ≥ 0.94, accessibility 1, best practices ≥ 0.95, SEO 1, LCP ≤ 2000 ms, CLS ≤ 0.05, TBT ≤ 300 ms, on `/`, `/projects`, `/projects/accessibility-testing`, `/about`, `/resume`.
- C50: transform and colour only, never opacity on content that stays; one easing (`--ease-snap`); durations from the existing tokens where one fits.
- Every move is off under `prefers-reduced-motion: reduce` and has a static final layout without scroll-driven animation support.
- One timeline per list, never per item (the existing note in `globals.css`: one scroll timeline per list item costs blocking time). Scroll-linked translates on Lighthouse routes animate a registered custom property, as `.resume-list` does, so they don't hold a compositing layer each.
- No AI attribution in commits or the PR (user rule).

## Review Focus

1. Keyboard focus around the new pinned, stacked and clipped parts must never be fully hidden. Tab through `/` and `/about` with the F-7 guard (Task 5).
2. In a browser without scroll-driven animations (Firefox today), every effect shows its final layout with all content visible: marquee wrapped, career path vertical, digits final, Contact full bleed (`tests/e2e/motion-fallback.spec.ts`, created in Task 3, extended in Tasks 4 to 6).
3. Reduced motion stops every move, smooth scrolling included (a case in each task).
4. The text effects must keep the data text exact: titles, the intro and metric values read the same to crawlers and assistive tech (Tasks 1, 3, 4).
5. Phones at 320 px: the marquee, career path and full-bleed Contact must not cause sideways scroll (Task 5).

---

### Task 1: Page titles arrive letter by letter (move 2)

**Files:**
- Create: `src/lib/motion-text.ts`, `src/components/motion/Letters.tsx`
- Modify: `src/app/page.tsx` (poster lines), the `h1` in `src/app/{about,projects,work,skills,notes,quality,contact,resume}/page.tsx` and `src/app/not-found.tsx`; `src/app/globals.css` (letter keyframes; exclude lettered titles from the header rise)
- Test: `tests/unit/motion-text.test.ts`, `tests/e2e/motion.spec.ts`

**Interfaces:**
- Produces: `splitLetters(text: string): { word: string; letters: { char: string; index: number }[] }[]`, where `index` counts letters across the whole text (spaces excluded) so the stagger runs through words. `<Letters text={string} />` renders each word as `span.word` (no wrapping inside a word) and each letter as `span.letter` with `style={{ '--i': index }}`, words separated by a real space text node. No ARIA: plain inline spans keep the heading's name and `textContent` equal to the text.

- [ ] **Step 1: Write the failing unit test** in `tests/unit/motion-text.test.ts`:
  - `splitLetters('About')` returns one word with five letters, indexes 0 to 4.
  - `splitLetters('Client work')` returns two words; the first letter of "work" has index 6.
  - `splitLetters('  a  b ')` returns words `['a', 'b']` (extra whitespace collapses).
- [ ] **Step 2: Run it.** `pnpm vitest run tests/unit/motion-text.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement `splitLetters` and `Letters`.** Use `Array.from(word)` so non-ASCII letters stay whole.
- [ ] **Step 4: Run it.** Same command. Expected: PASS.
- [ ] **Step 5: Write the failing e2e tests** in `motion.spec.ts`, inside `arrivals`:
  - `page titles arrive letter by letter`: on `/about`, `main header h1 .letter` has count 5, the h1's `textContent` is `About`, and the letters' `--i` values run 0 to 4. The first letter's `animationName` is `letter`, its computed `opacity` is `1` straight after `goto` (nothing starts hidden), and `animationDelay` of letter 4 is `0.112s`.
  - `the poster's letters rise in each line`: on `/`, every `.poster > span:not(.sr-only)` holds `.letter` spans; the existing poster tests (name, `textContent`, fit at 320/768/1280/1920) still pass unchanged.
  - Update `the 404 page arrives like every other page`: the h1's first `.letter` has `animationName` `letter`.
  - Update `one rhythm`: the header children other than the h1 are `rise 0.4s`; the h1's letters are `letter`.
  - In `reduced motion`, add: `/about` h1 letters have `animationName` `none`.
- [ ] **Step 6: Run them.** `pnpm test:e2e tests/e2e/motion.spec.ts --project=chromium`. Expected: the new and updated cases FAIL.
- [ ] **Step 7: Implement.**
  - Wrap each page's `h1` text in `<Letters>`. Leave out the project and case study titles: they are morph targets (`data-morph-title`), and splitting them would break the morph.
  - Home: each poster line becomes `<span><Letters text={first} /></span>`. The poster CSS selectors are `.poster > span`, so they don't reach the letters; keep it that way.
  - CSS, under `no-preference`: `.letter { display: inline-block; animation: letter 520ms var(--ease-snap) calc(var(--i) * 28ms) backwards; transform-origin: 0 100%; }` and `@keyframes letter { from { translate: 0 0.35em; rotate: 6deg; } }`. Change the header rise selector to `main header > :not([data-morph-title], :has(.letter))`.
- [ ] **Step 8: Run them again.** Same command, plus `--project=webkit`. Expected: PASS.
- [ ] **Step 9: Commit.** `git commit -m "Page titles arrive letter by letter"`

### Task 2: A page change slides in like a sheet (move 1)

**Files:**
- Modify: `src/app/globals.css` (route view transition block), `src/components/layout/RouteTransition.tsx` (comment only)
- Test: `tests/e2e/morph.spec.ts`

**Interfaces:**
- Consumes: `RouteTransition`'s existing classes `page-exit` and `page-enter` (the `morph` type maps to the same classes). Keep the names.

- [ ] **Step 1: Write the failing test** `a page change slides the new page up over the old`. On `/` at 1280 px, record animation names with a `requestAnimationFrame` loop that pushes `document.getAnimations().map(a => a.animationName)` into `window.__vt` for 1 s. Click the top bar's About link. Expect `__vt` to contain `vt-sheet` and `vt-sink`, and the URL to end `/about`. Under reduced motion, the same flow records neither.
- [ ] **Step 2: Run it.** `pnpm test:e2e tests/e2e/morph.spec.ts --project=chromium`. Expected: FAIL (it records `vt-in` and `vt-out` instead).
- [ ] **Step 3: Implement.** Replace `vt-in` and `vt-out`:
  - `::view-transition-group(.page-enter) { background: var(--bg); animation: 460ms var(--ease-snap) both vt-sheet; }` with `@keyframes vt-sheet { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0); } }`.
  - `::view-transition-new(.page-enter) { animation: 460ms var(--ease-snap) both rise; }`.
  - `::view-transition-old(.page-exit) { animation: 460ms var(--ease-snap) both vt-sink; }` with `@keyframes vt-sink { to { translate: 0 -32px; opacity: 0.4; } }`. The old page is a snapshot on its way out, so C50's no-opacity rule for content that stays doesn't apply.
  - Set the `.morph` group to 460 ms, so the title flies in step with the sheet.
  - Check by eye in the browser pane that the sheet is opaque. If the group background doesn't paint, put the background on `::view-transition-new(.page-enter)` instead, and ledger the ruling.
- [ ] **Step 4: Run it again,** plus the whole `morph.spec.ts` and `motion.spec.ts`. Expected: PASS, including the existing morph and theme-flood tests.
- [ ] **Step 5: Commit.** `git commit -m "Page changes slide in like a sheet"`

### Task 3: Home intro inks in, and the skills strip (moves 3 and 6)

**Files:**
- Create: `src/components/motion/InkText.tsx`, `src/components/motion/Marquee.tsx`, `tests/e2e/motion-fallback.spec.ts`
- Modify: `src/lib/motion-text.ts`, `src/app/page.tsx`, `src/app/globals.css`
- Test: `tests/unit/motion-text.test.ts`, `tests/e2e/overview.spec.ts`, `tests/e2e/motion.spec.ts`

**Interfaces:**
- Produces:
  - `inkRanges(count: number): { from: number; to: number }[]`: percentages of the `cover` range; word `i` runs from `15 + 45 * i / count` to `15 + 45 * (i + 1) / count`, rounded to 2 decimals.
  - `skillRows(groups: SkillGroup[]): [string[], string[]]`: every skill of the groups without `learning`, in data order, split at `Math.ceil(n / 2)`.
  - `<InkText text={string} className?={string} />` renders `p.ink-text` with `view-timeline: --ink`, each word a `span` with `--from` and `--to` set from `inkRanges`.
  - `<Marquee rows={[string[], string[]]} />` renders `section[aria-labelledby]` with an sr-only `h2` "Skills". Each row is `div.marquee-row[data-dir="left"|"right"]`, holding a `ul` with an `li` per skill and an accent `/` separator (`aria-hidden`), plus an identical copy `ul[aria-hidden="true"]`.

- [ ] **Step 1: Write the failing unit tests:**
  - `inkRanges(3)` equals `[{from:15,to:30},{from:30,to:45},{from:45,to:60}]`.
  - `skillRows(skills)` (real data): the two rows hold every non-learning skill exactly once, in order, and no learning group's skill.
- [ ] **Step 2: Run them.** `pnpm vitest run tests/unit/motion-text.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement both helpers.** Run again. Expected: PASS.
- [ ] **Step 4: Write the failing e2e tests:**
  - `overview.spec`: `the intro reads in full under the poster`: `.ink-text` `textContent` equals `profile.intro` (whitespace-normalised) and sits after `[data-poster]` in document order.
  - `overview.spec`: `the skills strip lists every proven skill once to assistive tech`: in the region named `Skills`, the accessible listitems equal `skillRows(skills).flat()`, and the copies are `aria-hidden`.
  - `motion.spec` (support required; skip if `CSS.supports('animation-timeline: view()')` is false): intro words have `animationName` `ink` on timeline `--ink`; the rows have `marquee` and `marquee-back` on timeline `scroll(root)`.
  - `motion.spec` `reduced motion`: intro words' `color` equals the ink colour (read through a probe, as the hover test does); the marquee copies are `display: none` and the rows have `flex-wrap: wrap`.
  - New `motion-fallback.spec.ts`, tagged `@chromium-only`, with `test.use({ launchOptions: { args: ['--disable-blink-features=ScrollTimeline'] } })`:
    - First assert `CSS.supports('animation-timeline: view()')` is `false`, so the file fails loudly if the flag stops working.
    - Then on `/`: the marquee copies are hidden, the rows wrap, and the intro words are ink.
- [ ] **Step 5: Run them.** `pnpm test:e2e tests/e2e/overview.spec.ts tests/e2e/motion.spec.ts tests/e2e/motion-fallback.spec.ts --project=chromium`. Expected: FAIL.
- [ ] **Step 6: Implement.**
  - Home: put `<InkText text={profile.intro} className="home-intro" />` between the poster and Projects. Large (`text-2xl`, `lg:text-4xl`), `measure`-wide.
  - Put `<Marquee rows={skillRows(skills)} />` between Projects and Client work.
  - CSS inside `@supports` and `no-preference`:
    - `.ink-text span { color: var(--text-muted); animation: ink linear both; animation-timeline: --ink; animation-range: cover var(--from) cover var(--to); }`, with `@keyframes ink { to { color: var(--text); } }`.
    - Rows: `display: flex; width: max-content`. Left rows animate `translate` 0 to -50%, right rows -50% to 0, on `scroll(root)`.
    - Default (outside the block): rows wrap, copies `display: none`, words ink.
  - Wrap the strip in `overflow-x: clip`.
  - Alternate items between ink and muted with `:nth-child(even)`. Size: `text-[clamp(2rem,1rem+4vw,4.5rem)]`, condensed, as the poster.
- [ ] **Step 7: Run them again.** Same command, then `--project=webkit` and `--project=mobile-chrome` without the fallback file. Expected: PASS.
- [ ] **Step 8: Commit.** `git commit -m "Home intro inks in; skills strip moves with the scroll"`

### Task 4: About: rolling numbers, the career strip, the checklist deck (moves 4, 7, 8)

**Files:**
- Create: `src/components/motion/Odometer.tsx`
- Modify: `src/lib/motion-text.ts`, `src/app/about/page.tsx`, `src/components/content/CareerPath.tsx`, `src/app/globals.css`
- Test: `tests/unit/motion-text.test.ts`, `tests/e2e/motion.spec.ts`, `tests/e2e/motion-fallback.spec.ts`

**Interfaces:**
- Produces:
  - `reel(digit: number): { lines: string; steps: number }`: for `d >= 1`, `lines` is the digits `0` to `d-1` joined by `\n` and `steps` is `d`; for `0`, `lines` is `0` to `9` and `steps` is `10`, a full turn.
  - `<Odometer value={string} />`: each digit becomes `span.odo-digit > span.odo-reel[data-reel={lines}]`, with `style={{ '--steps': steps }}`, holding the real digit; every other character stays as plain text. The reel's `::before` is `content: attr(data-reel) / ""`, so assistive tech and `textContent` see only the real value.
  - `CareerPath` keeps `ol[aria-label="Career path"]` and its four items, now wrapped in `div.career-track > div.career-sticky`.

- [ ] **Step 1: Write the failing unit tests:**
  - `reel(3)` equals `{ lines: '0\n1\n2', steps: 3 }`.
  - `reel(0).steps` is `10` and its `lines` has 10 entries.
- [ ] **Step 2: Run them, implement `reel`, run them again.** Expected: FAIL, then PASS.
- [ ] **Step 3: Write the failing e2e tests:**
  - `each number lands on its recorded value`: for every metric on `/about`, the value `p` has `textContent` equal to `metric.value` exactly. Its `ariaSnapshot()` matches `^- paragraph: "?<escaped value>"?$`, which covers `7 of 7`, `12 s p95` and `over 7,000 requests/s`.
  - With support: the metrics `ul` has `view-timeline-name` `--numbers`; reels have `animationName` `odo` on that timeline (one timeline for the list).
  - `the career path slides sideways on wide screens` (1280×800, support):
    - The `ol` has `animationName` `career`.
    - Near the track's start, the first step is in view.
    - After `scrollIntoView` on the track's end and a poll, the last step's right edge is at or inside the viewport width.
  - `the career path is a plain list on phones` (390 px): the `ol` has `animationName` `none`, and its items' tops increase.
  - `the checklist piles up as you read` (1280×800): scroll the method list until item 6 reaches the top. Items 1 and 2 are both stuck under the top bar (top under 200 px), and item 2's top is item 1's top plus 8 px (±1).
  - Reduced motion: reels `none`, the career `ol` `none`, deck items `position: static`.
  - `motion-fallback.spec`: on `/about`, each metric `textContent` equals its value and the reel's translate is 0; the career path is vertical.
- [ ] **Step 4: Run them.** `pnpm test:e2e tests/e2e/motion.spec.ts tests/e2e/motion-fallback.spec.ts --project=chromium`. Expected: FAIL.
- [ ] **Step 5: Implement.**
  - Odometer CSS:
    - `@property --roll { syntax: '<number>'; inherits: false; initial-value: 0 }`.
    - The metric value gets `line-height: 1`. `.odo-digit { display: inline-block; height: 1em; overflow: clip; vertical-align: bottom; }`.
    - `.odo-reel { display: block; position: relative; translate: 0 calc(var(--roll) * 1em); }`; the `::before` sits absolute at `bottom: 100%` with `white-space: pre`.
    - Under support and `no-preference`: `animation: odo linear both; animation-timeline: --numbers; animation-range: entry 10% cover 35%;`, with `@keyframes odo { from { --roll: var(--steps); } }`.
  - Career strip, at `min-width: 768px` with support and `no-preference`:
    - `.career-track { view-timeline: --career; height: 260svh; }`
    - `.career-sticky { position: sticky; top: 3.5rem; height: calc(100svh - 3.5rem); display: flex; align-items: center; container-type: inline-size; overflow-x: clip; }`. 3.5rem is the top bar's `h-14`.
    - The `ol` becomes a `max-content` flex row of steps at `text-[clamp(2.5rem,1rem+5vw,6rem)]`.
    - `animation: career linear both; animation-timeline: --career; animation-range: contain 0% contain 100%;`, with `@keyframes career { to { translate: calc(-100% + 100cqw) 0; } }`.
    - Outside that query, today's ruled list stays.
  - Deck:
    - The method `ol` becomes one column, numbers `text-2xl`.
    - Under `no-preference`: `li { position: sticky; top: calc(3.5rem + var(--i) * 0.5rem); background: var(--bg); }`, with `--i` set per item.
    - In print, back to static.
- [ ] **Step 6: Run them again** on chromium, webkit and mobile-chrome. Expected: PASS.
- [ ] **Step 7: Commit.** `git commit -m "About: rolling numbers, career strip, checklist deck"`

### Task 5: Home ending: Contact in the other theme, the CV ring, the arrow (moves 5 and 11)

**Files:**
- Create: `src/components/motion/CvRing.tsx`
- Modify: `src/styles/tokens.css`, `src/lib/tokens.ts`, `src/app/page.tsx`, `src/app/globals.css`
- Test: `tests/unit/tokens.test.ts`, `tests/e2e/overview.spec.ts`, `tests/e2e/motion.spec.ts`, `tests/e2e/guards.spec.ts`, `tests/e2e/layout.spec.ts`, `tests/e2e/motion-fallback.spec.ts`

**Interfaces:**
- Produces:
  - Selector lists in `tokens.css`: the light block is `:root,\n.light,\n.dark .invert` and the dark block is `.dark,\n:root:not(.dark) .invert`. `parseTokens` keys on those exact strings and still returns `{ dark, light }`.
  - `ringText(parts: string[]): string` (in `motion-text.ts`) returns `parts.join(' · ') + ' · '`.
  - `<CvRing href={string} parts={string[]} />` renders `a.cv-ring[download]` around an `svg[aria-hidden="true"]` whose `textPath` carries `ringText(parts)` fitted with `textLength`. The centre label "Download CV" is the link's accessible name.

- [ ] **Step 1: Write the failing unit tests:**
  - `tokens.test`: the light block's selector list contains `.dark .invert`; the dark block's contains `:root:not(.dark) .invert`; the existing paper and slate value tests still pass.
  - `motion-text.test`: `ringText(['A', 'B'])` is `'A · B · '`.
- [ ] **Step 2: Run them, implement both, run them again.** Expected: FAIL, then PASS.
- [ ] **Step 3: Write the failing e2e tests:**
  - `overview.spec`, `the ending is set in the other theme`: in light theme the Contact region's background is `rgb(21, 28, 38)`; after switching to dark it is `rgb(239, 233, 222)`.
  - `overview.spec`: the existing contact test still finds `Download CV` (now the ring) with `href` `profile.cvPdf` and a `download` attribute. The ring's `svg` is `aria-hidden`, and its `textPath` contains `profile.role` and `profile.location`.
  - `motion.spec` (support): the Contact region has `animationName` `sheet`; the ring `svg` has `ring-turn` on `scroll(root)`; the arrow path has `draw`. Under reduced motion all three are `none`.
  - `guards.spec`: the F-7 loop (50 Tabs, `focusEntirelyObscured` false) on `/` and `/about`.
  - `layout.spec`: at 320 px and 1280 px, `/` and `/about` have `scrollWidth - clientWidth <= 0`.
  - `motion-fallback.spec`: Contact is full bleed. The section's computed `clip-path` is `inset(0px -100vmax)` or its resolved form; read the value and assert the horizontal insets are negative.
  - The axe route test for `/` also runs in dark theme with Contact scrolled into view (`tests/a11y/routes.spec.ts`).
- [ ] **Step 4: Run them.** `pnpm test:e2e tests/e2e/overview.spec.ts tests/e2e/motion.spec.ts tests/e2e/guards.spec.ts tests/e2e/layout.spec.ts tests/e2e/motion-fallback.spec.ts tests/a11y --project=chromium`. Expected: FAIL.
- [ ] **Step 5: Implement.**
  - Contact becomes `section.invert.contact-sheet` holding:
    - a heading row: `h2` "Contact" plus an `svg.contact-arrow[aria-hidden]` (one path, `pathLength="1"`);
    - the email;
    - `CopyButton`, `CvRing` with `parts={[profile.role, profile.location]}`, and the GitHub ghost link. The old "Download CV" button is removed.
  - Full bleed without overflow: `background: var(--bg); box-shadow: 0 0 0 100vmax var(--bg); clip-path: inset(0 -100vmax);`, with `padding-block: var(--space-section)` (or the existing section gap token).
  - Under support and `no-preference`: `animation: sheet linear both; animation-timeline: view(); animation-range: entry 0% cover 35%;`, with `@keyframes sheet { from { clip-path: inset(3rem 1rem round 1.5rem); } to { clip-path: inset(0 -100vmax round 0); } }`. This replaces the `main section` rise on this one section.
  - Ring: `9rem` (`7rem` below `sm`). `rotate` from 0 to 2 turns on `scroll(root)`. The centre label takes the accent on hover and focus.
  - Arrow: `stroke-dasharray: 1; stroke-dashoffset` from 1 to 0 on `view()`, range `entry 20% cover 40%`.
  - Print: `.invert` prints as normal (black on white, no clip), next to the existing print block.
- [ ] **Step 6: Run them again** on all three projects. Expected: PASS.
- [ ] **Step 7: Commit.** `git commit -m "Home ending: Contact in the other theme, CV ring, arrow"`

### Task 6: Paper grain and the header rule (move 10)

**Files:**
- Modify: `src/app/globals.css`
- Test: `tests/e2e/motion.spec.ts`, `tests/e2e/motion-fallback.spec.ts`, `tests/e2e/resume.spec.ts`

- [ ] **Step 1: Write the failing tests:**
  - `the paper has a still grain behind the content`: `getComputedStyle(document.body, '::before')` has `position` `fixed`, `zIndex` `-1`, `pointerEvents` `none`, a `backgroundImage` containing `data:image/svg+xml`, and `animationName` `none` (it never moves).
  - `a rule draws under the top bar once you scroll` (support): the header's `::after` has `animationName` `header-rule` on `scroll(root)`.
  - Reduced motion and `motion-fallback.spec`: the rule's computed `scale` is `1` (drawn, static).
  - `resume.spec` print case: the grain `::before` is `display: none` in print media.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Grain: a 180 px tile of SVG `feTurbulence` (`baseFrequency 0.9`, `numOctaves 2`, `stitchTiles stitch`) as a data URI on `body::before`, `inset: 0`. Opacity 0.05 on paper and 0.07 on slate, through a `--grain` token in both blocks of `tokens.css`.
  - Check by eye that it paints behind the text and not under the page background. `html` has its own `background-color`, so the body background doesn't propagate to the canvas. If the grain doesn't show, move it to `html::before`, and ledger the ruling.
  - Header: `[data-site-header] { position: sticky }` already. Add an `::after` at the bottom, 1 px, `var(--border)`, `scale: 0 1` growing to `1 1` over the first 120 px of `scroll(root)`. Static `scale: 1` outside support or under reduced motion.
- [ ] **Step 4: Run them again** on all three projects. Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "Paper grain and a header rule that draws on scroll"`

### Task 7: Smooth scrolling on mouse and trackpad (move 9)

**Files:**
- Create: `src/components/motion/SmoothScroll.tsx`
- Modify: `src/app/layout.tsx`, `package.json`, `pnpm-lock.yaml`
- Test: `tests/e2e/motion.spec.ts`

**Interfaces:**
- Produces: `SmoothScroll()`, a client component that renders nothing. It starts only when `matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)')` matches, after `requestIdleCallback` (falling back to a 200 ms timeout), through `import('lenis')`. It runs `new Lenis({ autoRaf: true, lerp: 0.12, anchors: true, prevent: (node) => node.closest('dialog[open], [data-lenis-prevent]') !== null })`, and destroys the instance when the query stops matching and on unmount.

- [ ] **Step 1: Write the failing tests** in `motion.spec`, `smooth scrolling`:
  - Desktop 1280 px: after hydration, poll until `html` has class `lenis`. Then `page.mouse.wheel(0, 30000)` scrolls to the page bottom (poll `scrollY + innerHeight >= scrollHeight - 2`), and `End` from the top also reaches it.
  - Touch (`hasTouch`, `isMobile`, 390 px): `html` never gets `lenis` (check after 1 s).
  - Reduced motion: never gets `lenis`.
  - At 700×800 desktop, open the phone menu and wheel 2000 px: `scrollY` is unchanged.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.** `pnpm add lenis@1.3.27 --save-exact`. Mount `<SmoothScroll />` once in `layout.tsx`, after `SiteFooter`.
- [ ] **Step 4: Run them again,** then the whole e2e suite on chromium. Expected: PASS. Fix any older test that depended on instant wheel scrolling by polling, not by turning Lenis off.
- [ ] **Step 5: Check the budget.** `pnpm build`, then confirm `lenis` is in its own chunk and not in the home page's first-load JS (the build's route table, or the `quality.json` size).
- [ ] **Step 6: Commit.** `git commit -m "Smooth scrolling on mouse and trackpad"`

### Task 8: Record the decision, run every gate, open the PR

**Files:**
- Modify: `docs/04-DECISIONS.md`

- [ ] **Step 1: Add C52.** One row, "Motion pass", quoting Vincent's 2026-11-18 words, listing the eleven moves in one line each, and amending C50 (more moves, same easing and no-opacity rule) and C51 (home gains the intro, the skills strip and the inverted Contact; About's career path and checklist change shape).
- [ ] **Step 2: Run the gates.** `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`, with the e2e output redirected to the workspace. Expected: all pass. Retry once on the known webServer or SecurityFatalError flake.
- [ ] **Step 3: Run Lighthouse locally on the five routes:** `pnpm exec lhci autorun`, or the repo's script if `package.json` names one. Expected: within the budgets above.
  - If TBT or LCP misses, the fix order is: drop smooth scrolling from `/` and `/about` first, then the odometer's per-digit animation (keep static digits). Ledger the ruling and tell Vincent.
- [ ] **Step 4: Final whole-branch review** by a fresh reviewer on the most capable model, with this plan's Review Focus; then one fix pass, each fix RED to GREEN.
- [ ] **Step 5: Push and open the PR.** Push `design/motion-pass` and open "Motion pass: eleven moves, remade". Plain description, no attribution; screenshots go to Vincent, not the PR.
