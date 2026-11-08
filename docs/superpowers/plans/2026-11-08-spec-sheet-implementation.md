# Spec Sheet Direction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved spec sheet direction: Host Grotesk with Departure Mono, a masthead, a
home project index, a coverage map, decoding labels, a first-visit boot, a route curtain, a heading
reveal and a stack marquee.

**Architecture:** Server components and CSS carry almost everything. Client JavaScript is limited to
one idle-installed decode listener and an inline boot flag script. Motion is transform, clip-path or
stroke only, scoped to `@media screen and (prefers-reduced-motion: no-preference)`, with
scroll-driven pieces inside `@supports (animation-timeline: view())`.

**Tech Stack:** Next.js 16.4 App Router, React 19.3 (`<ViewTransition>`, Link `transitionTypes`),
Tailwind v4, next/font (google and local), Vitest, Playwright with axe.

**Spec:** `docs/superpowers/plans/2026-11-08-spec-sheet-direction.md` (approved by Vincent,
2026-11-08, including the Departure Mono download).

## Global Constraints

- Every rendered fact comes from `src/content` (`docs/01-PORTFOLIO-DATA.md`); no new strings that state facts.
- No client names, regions, logos, URLs or staff names; no emojis anywhere.
- Content motion is transform, clip-path or SVG stroke only; never `opacity` or `filter` on text.
- Everything animated is off under `prefers-reduced-motion: reduce` and in print.
- Touch targets stay at least 44 px; axe has zero violations in both themes.
- The print CV stays at 1 to 2 pages (`tests/e2e/resume.spec.ts`).
- Lighthouse budgets in `lighthouserc.json` stay green (TBT ≤ 250 ms local, performance ≥ 0.95, LCP ≤ 2000 ms, CLS ≤ 0.05).
- Departure Mono text sizes snap to its 11 px grid: 11 px (`0.6875rem`) and 13.75 px (`0.859375rem`).
- Done means `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e` pass.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

- A first-time visitor who clicks or tabs during the boot: nothing is blocked, focus lands where it would without the boot. (Task 6 test.)
- Screen reader users on a decoding label: they hear the real label, never scrambled glyphs. (Task 2 test.)
- A visitor on a phone (no hover): project index rows show their hook without hover; the coverage map is replaced by the list. (Tasks 4 and 5 tests.)
- The door-to-report morph keeps working after the curtain lands. (Task 7 test.)
- The marquee's intentional overflow must not trip the layout containment spec, and print shows the static tool list. (Task 8 test.)

---

### Task 1: Fonts

**Files:**
- Create: `src/fonts/departure-mono/DepartureMono-Regular.woff2`, `DepartureMono-Regular.woff`, `LICENSE` (from the v1.500 release zip)
- Modify: `src/lib/fonts.ts`, `src/app/globals.css` (theme font vars; `h1`/`h2`/`h3`; `label-mono`; every `font-stretch`), `src/lib/og.tsx`, `src/app/icon.svg`, `package.json`
- Test: `tests/e2e/fonts.spec.ts` (new)

**Interfaces:**
- Produces: CSS variables `--font-host-grotesk` and `--font-departure-mono`; Tailwind `--font-sans`/`--font-display` → Host Grotesk, `--font-mono` → Departure Mono. `fontVariables` export keeps its name.

- [ ] **Step 1: Write the failing test** `tests/e2e/fonts.spec.ts`

```ts
test('headings use Host Grotesk and runner labels use Departure Mono, both loaded', async ({ page }) => {
  await page.goto('/');
  const h1 = await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily);
  expect(h1).toMatch(/Host Grotesk/i);
  const label = await page.locator('.label-mono').first().evaluate((el) => getComputedStyle(el));
  expect(label.fontFamily).toMatch(/Departure Mono/i);
  expect(label.fontSize).toBe('11px');
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family).join('|');
  });
  expect(loaded).toMatch(/Host Grotesk/i);
  expect(loaded).toMatch(/Departure Mono/i);
});

test('small mono text snaps to the 11 px grid', async ({ page }) => {
  await page.goto('/');
  const sizes = await page.locator('.font-mono.text-xs').evaluateAll((els) =>
    [...new Set(els.map((el) => getComputedStyle(el).fontSize))],
  );
  expect(sizes).toEqual(['11px']);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec playwright test tests/e2e/fonts.spec.ts --project=chromium`
Expected: FAIL, font family is Archivo.

- [ ] **Step 3: Download the font**

Run: `curl -L -o "$SCRATCH/dm.zip" https://github.com/rektdeckard/departure-mono/releases/download/v1.500/DepartureMono-1.500.zip && unzip -o "$SCRATCH/dm.zip" -d "$SCRATCH/dm"`, then copy the Regular `.woff2`, `.woff` and the licence file into `src/fonts/departure-mono/`. Expected: three files, woff2 under 30 KB.

- [ ] **Step 4: Implement**

`src/lib/fonts.ts`: `Host_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-host-grotesk' })` (variable `wght`) and `localFont({ src: '../fonts/departure-mono/DepartureMono-Regular.woff2', display: 'swap', variable: '--font-departure-mono', fallback: ['ui-monospace', 'Menlo', 'monospace'] })`. In `globals.css`: point the three theme font vars at them; delete every `font-stretch` declaration (Host Grotesk has no width axis); `h1` weight 800 with `letter-spacing: -0.025em`, `h2` 700 with `-0.015em`, `h3` 600; `label-mono` `font-size: 0.6875rem`, weight 400; add a base rule setting `.font-mono.text-xs, .font-mono.text-\[0\.6875rem\]` to `0.6875rem` and `.font-mono.text-sm` to `0.859375rem`; tm-year keeps its size and drops `font-stretch`. `og.tsx`: add `@fontsource/host-grotesk` (400, 700, 800 woff) and read Departure Mono's woff from `src/fonts/departure-mono/`; remove `@fontsource/archivo` and `@fontsource/martian-mono` from `package.json`. `icon.svg`: `font-family="'Departure Mono', ui-monospace, Menlo, monospace"`. Print block: retune sizes only if `resume.spec` fails.

- [ ] **Step 5: Run tests**

Run: `pnpm exec playwright test tests/e2e/fonts.spec.ts tests/e2e/resume.spec.ts tests/e2e/og.spec.ts tests/e2e/layout.spec.ts --project=chromium`
Expected: PASS (CV at most 2 pages; containment holds).

- [ ] **Step 6: Commit** `feat(type): Host Grotesk with Departure Mono`

---

### Task 2: Decoding labels

**Files:**
- Create: `src/lib/decode.ts`, `src/components/ui/DecodeLabel.tsx`, `src/components/ui/DecodeHost.tsx`
- Modify: `src/app/layout.tsx` (mount `<DecodeHost />` once), `src/components/content/Section.tsx` (kicker uses `DecodeLabel`)
- Test: `tests/unit/decode.test.ts`, `tests/e2e/decode.spec.ts`

**Interfaces:**
- Produces: `scrambleFrame(text: string, frame: number, random: () => number): string`; `<DecodeLabel text={string} className?={string} />` renders `<span class="decode {className}"><span class="sr-only">{text}</span><span aria-hidden="true" data-decode>{text}</span></span>`.

- [ ] **Step 1: Write the failing unit test** `tests/unit/decode.test.ts`

```ts
it('keeps length and spaces, and settles on the exact text', () => {
  const text = 'tests for';
  for (let f = 0; f < text.length * 2; f++) {
    const out = scrambleFrame(text, f, () => 0.5);
    expect(out).toHaveLength(text.length);
    expect(out[5]).toBe(' ');
  }
  expect(scrambleFrame(text, text.length * 2, Math.random)).toBe(text);
});
it('reveals left to right: frame 2n fixes the first n characters', () => {
  expect(scrambleFrame('based in', 6, () => 0).slice(0, 3)).toBe('bas');
});
```

- [ ] **Step 2: Run it to verify it fails** — `pnpm exec vitest run tests/unit/decode.test.ts`, Expected: FAIL (module missing).

- [ ] **Step 3: Implement** `scrambleFrame` (characters at index `< frame / 2` and spaces are kept; others replaced from `abcdefghijklmnopqrstuvwxyz0123456789#%&*` by `random`), `DecodeLabel` (server component), and `DecodeHost` (`'use client'`, renders `null`; installs one delegated `pointerover` and `focusin` listener on `document` inside `requestIdleCallback` with a 1200 ms `setTimeout` fallback; on a `.decode` ancestor it animates the `[data-decode]` child every 28 ms through `text.length * 2` frames, ignoring a label already animating; does nothing when `matchMedia('(prefers-reduced-motion: reduce)')` matches).

- [ ] **Step 4: Write the e2e test** `tests/e2e/decode.spec.ts`

```ts
test('a hovered kicker scrambles only its hidden copy and settles on the real text', async ({ page }) => {
  await page.goto('/');
  await waitForHydration(page);
  const kicker = page.locator('#run-summary .decode').first();
  const real = await kicker.locator('.sr-only').textContent();
  await kicker.hover();
  await expect(kicker.locator('.sr-only')).toHaveText(real!);
  await expect(kicker.locator('[data-decode]')).toHaveText(real!, { timeout: 2000 });
  await expect(kicker.locator('[data-decode]')).toHaveAttribute('aria-hidden', 'true');
});
```

- [ ] **Step 5: Run both tests** — Expected: PASS. Also run `tests/e2e/sections.spec.ts` (kickers still read correctly).

- [ ] **Step 6: Commit** `feat(motion): labels decode on hover`

---

### Task 3: Masthead

**Files:**
- Create: `src/components/content/Masthead.tsx`
- Modify: `src/app/page.tsx` (render above the hero section, inside the page's top-level flex column)
- Test: `tests/e2e/overview.spec.ts`

**Interfaces:**
- Consumes: `DecodeLabel` (Task 2).
- Produces: `<Masthead location={string} testedAreas={string[]} ci={Metric} />` rendering `<section aria-label="At a glance"><dl>` with three `dt`/`dd` pairs: "based in", "tests for", "CI".

- [ ] **Step 1: Write the failing test** (in `overview.spec.ts`)

```ts
test('the masthead states location, tested areas and CI coverage from the data', async ({ page }) => {
  const mast = page.getByRole('region', { name: 'At a glance' });
  const ci = metrics.find((m) => m.id === 'ci-repos')!;
  await expect(mast.locator('dd').nth(0)).toHaveText(profile.location);
  await expect(mast.locator('dd').nth(1)).toHaveText(testedAreas.join(' · '));
  await expect(mast.locator('dd').nth(2)).toContainText(ci.value);
  await expect(mast.locator('dd').nth(2)).toContainText(ci.label);
});
```

`testedAreas` in the test is computed exactly as `src/app/page.tsx` computes it (move that expression into `src/lib/content.ts` as `testedAreas(): string[]` and use it in both places).

- [ ] **Step 2: Run it to verify it fails** — Expected: FAIL, region not found.

- [ ] **Step 3: Implement** `Masthead`: Departure Mono at 11 px, `rounded-card border border-line bg-surface`, `grid gap-x-8 gap-y-3 sm:grid-cols-3`, `dt` uses `DecodeLabel` in `text-ink-muted`, `dd` in `text-ink`; CI `dd` shows a pass-coloured dot (decorative, `aria-hidden`) then `{ci.value} {ci.label.toLowerCase()}`. Data: `profile.location`, `testedAreas()`, `metrics.find(m => m.id === 'ci-repos')`; render nothing for a missing metric.

- [ ] **Step 4: Run** `tests/e2e/overview.spec.ts tests/e2e/layout.spec.ts tests/a11y` — Expected: PASS.

- [ ] **Step 5: Commit** `feat(home): masthead`

---

### Task 4: Home project index

**Files:**
- Create: `src/components/content/ProjectIndex.tsx`
- Modify: `src/app/page.tsx` (Featured projects section renders `ProjectIndex` instead of the `ProjectCard` grid), `src/app/globals.css` (`.index-row` motion), `src/components/content/SuiteDoor.tsx` (report link gets `transitionTypes={['morph']}`)
- Test: `tests/e2e/overview.spec.ts`, `tests/e2e/touch.spec.ts`

**Interfaces:**
- Produces: `<ProjectIndex projects={Project[]} huntPrefix="overview" />`. Each row is an `<li>` wrapped in `Inspectable` with id `` `${huntPrefix}-card-${slug}` `` (unchanged ids). Row link: `<Link href={/projects/${slug}} transitionTypes={['morph']}>` whose content is `<span class="sr-only">Read the report for </span>` plus the name inside `<ViewTransition name={project-title-${slug}} share="morph" default="none">`.

- [ ] **Step 1: Write the failing tests**

In `overview.spec.ts`, keep `featured projects appear in order and link to their reports` as is, and add:

```ts
test('each index row shows its suite number, category and result', async ({ page }) => {
  const rows = page.getByRole('region', { name: 'Featured projects' }).getByRole('listitem');
  const featured = projectsInOrder().filter((p) => p.featured);
  await expect(rows).toHaveCount(featured.length);
  for (const [i, p] of featured.entries()) {
    await expect(rows.nth(i)).toContainText(`suite ${String(p.order).padStart(2, '0')}`);
    await expect(rows.nth(i)).toContainText(categoryLabel(p.category));
    await expect(rows.nth(i)).toContainText(p.hook);
  }
});
```

In `touch.spec.ts` (touch project): the first row's hook is visible without hover (`toBeVisible()`).

- [ ] **Step 2: Run to verify failure** — Expected: FAIL (no list items with those texts).

- [ ] **Step 3: Implement** the row grid `grid-cols-[4.5rem_minmax(0,1fr)_auto]` (number, name, category) with the hook in a second grid row under the name. The whole row is clickable through the link's stretched `after:absolute after:inset-0`. Hover/focus-within CSS: `::before` panel `scale: 1 0 → 1 1` from the bottom, name `translate: 0.75rem 0`, hook row `grid-template-rows: 0fr → 1fr`. Under `(hover: none)` the hook row is always open. No status column.

- [ ] **Step 4: Run** `overview.spec.ts touch.spec.ts bughunt.spec.ts layout.spec.ts` — Expected: PASS.

- [ ] **Step 5: Commit** `feat(home): projects as an index`

---

### Task 5: Coverage map

**Files:**
- Create: `src/lib/radial.ts`, `src/components/content/CoverageMap.tsx`
- Modify: `src/app/page.tsx` and `src/app/about/page.tsx` ("How I test" sections render `<CoverageMap areas={qaAreas} />` before `<QaAreaGrid />`), `src/components/content/QaAreaGrid.tsx` (wrapper gets `md:sr-only`), `src/app/globals.css` (`.cov-*` rules)
- Test: `tests/unit/radial.test.ts`, `tests/e2e/overview.spec.ts`

**Interfaces:**
- Produces: `radialLayout(count: number, box: { cx: number; cy: number; rx: number; ry: number }): { x: number; y: number; anchor: 'start' | 'middle' | 'end' }[]` (angles start at −90° plus half a step, so no label sits exactly at the top or bottom). `<CoverageMap areas={readonly string[]} />` renders `<svg aria-hidden="true" class="cov-map hidden md:block" viewBox="0 0 760 420">`.

- [ ] **Step 1: Write the failing unit test**

```ts
it('places 12 points on the ellipse, none straight above or below the centre', () => {
  const pts = radialLayout(12, { cx: 380, cy: 210, rx: 165, ry: 145 });
  expect(pts).toHaveLength(12);
  for (const p of pts) {
    expect(((p.x - 380) / 165) ** 2 + ((p.y - 210) / 145) ** 2).toBeCloseTo(1, 5);
    expect(Math.abs(p.x - 380)).toBeGreaterThan(1);
  }
  expect(pts[0]!.anchor).toBe('start');
});
```

- [ ] **Step 2: Run to verify failure** — Expected: FAIL (module missing).

- [ ] **Step 3: Implement** `radialLayout` and `CoverageMap`: a centre square and the label "vincent", one `<g class="cov-area">` per area with a `<line>` (`pathLength="1"`, `stroke-dasharray: 1`) and a `<text>` in Departure Mono 11 px, all equal weight. CSS: lines draw via `stroke-dashoffset: 1 → 0` on `animation-timeline: view()` (range `entry 10% cover 40%`), labels slide `translate: 0 6px → 0` (no opacity), `.cov-area:hover line` turns `var(--accent)` at 2 px. Without scroll-timeline support or with reduced motion, the final state shows.

- [ ] **Step 4: Write the e2e test** (in `overview.spec.ts`)

```ts
test('how I test draws a coverage map on wide screens and keeps the list for everyone', async ({ page }) => {
  const section = page.getByRole('region', { name: 'How I test' });
  await expect(section.getByRole('listitem')).toHaveCount(12);
  const map = section.locator('svg.cov-map');
  await expect(map).toHaveAttribute('aria-hidden', 'true');
  await expect(map.locator('text')).toHaveCount(13); // 12 areas plus the centre label
});
```

Plus, at a 375 px viewport, `map` is hidden and the list is visible.

- [ ] **Step 5: Run** `vitest run tests/unit/radial.test.ts`, then `overview.spec.ts layout.spec.ts tests/a11y` — Expected: PASS.

- [ ] **Step 6: Commit** `feat(motion): QA areas as a coverage map`

---

### Task 6: First-visit boot and heading reveal

**Files:**
- Create: `src/components/layout/Boot.tsx`
- Modify: `src/app/layout.tsx` (`<head>` inline script; `<Boot />` as the first child of `<body>`), `src/app/globals.css` (`.boot*`, `@property --boot-n`, heading reveal), `tests/helpers/test.ts` (auto fixture `skipBoot`, an option defaulting to `true`)
- Test: `tests/e2e/boot.spec.ts`

**Interfaces:**
- Produces: session key `vja-boot`; `<html data-boot>` while the boot runs; `[data-boot-overlay]` element.

- [ ] **Step 1: Write the failing test** `tests/e2e/boot.spec.ts`

```ts
test.use({ skipBoot: false });

test('the boot runs on the first page of a session, never blocks a click, then stays away', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-boot', '');
  await expect(page.locator('[data-boot-overlay]')).toHaveCSS('pointer-events', 'none');
  await page.getByRole('link', { name: 'View projects' }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-boot', /.*/);
});

test('reduced motion never boots', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-boot', /.*/);
});
```

- [ ] **Step 2: Run to verify failure** — Expected: FAIL (no `data-boot`).

- [ ] **Step 3: Implement** the head script (runs before paint):

```js
try {
  if (!sessionStorage.getItem('vja-boot') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.setAttribute('data-boot', '');
    sessionStorage.setItem('vja-boot', '1');
  }
} catch {}
```

`Boot` renders `<div data-boot-overlay aria-hidden="true" data-print-hide>` with four corner counters and a hairline, all small Departure Mono text. CSS, only under `html[data-boot]` and `screen` plus no-preference: the counters count 0 to 100 via `@property --boot-n { syntax: '<integer>'; inherits: false; initial-value: 0 }` and `counter-reset: n var(--boot-n)` with `content: counter(n) '%'` over 800 ms; the hairline scales `scale: 0 1 → 1 1`; at 1.2 s the overlay ends `visibility: hidden` (animation fill). The overlay is `position: fixed; inset: 0; pointer-events: none; background: var(--bg)` and slides up out of view (`translate: 0 -100%`) from 900 ms. Heading reveal: page `h1` elements sit in an `overflow: clip` line and rise `translate: 0 100% → 0` (350 ms after the boot when it runs, immediately otherwise). The overlay never holds large text, so it is never the LCP element. `skipBoot` fixture: `page.addInitScript(() => sessionStorage.setItem('vja-boot', '1'))` when the option is `true`.

- [ ] **Step 4: Run** `boot.spec.ts`, then the full chromium e2e project (`pnpm exec playwright test --project=chromium`) — Expected: PASS.

- [ ] **Step 5: Check Lighthouse locally** — `pnpm exec lhci autorun` (uses `lighthouserc.json`). Expected: every assertion passes, LCP ≤ 2000 ms.

- [ ] **Step 6: Commit** `feat(motion): first-visit boot and heading reveal`

---

### Task 7: Route curtain

**Files:**
- Modify: `src/components/layout/RouteTransition.tsx`, `src/app/globals.css` (view-transition rules), `src/components/content/ProjectIndex.tsx` and `SuiteDoor.tsx` (already tagged `morph` in Task 4)
- Test: `tests/e2e/shell.spec.ts`

**Interfaces:**
- Consumes: Link `transitionTypes={['morph']}` on door and index links (Task 4).
- Produces: `RouteTransition` maps `enter={{ morph: 'page-enter', default: 'page-curtain-in' }}` and `exit={{ morph: 'page-exit', default: 'page-curtain-out' }}`.

- [ ] **Step 1: Write the failing test**

```ts
test('page changes use the curtain classes, and report links keep the morph', async ({ page }) => {
  await page.goto('/');
  const classes = await page.evaluate(() =>
    [...document.styleSheets].flatMap((s) => [...s.cssRules].map((r) => r.cssText)).join('\n'),
  );
  expect(classes).toMatch(/view-transition-new\(\.page-curtain-in\)/);
  await page.getByRole('link', { name: /^Read the report for/ }).first().click();
  await expect(page.locator('h1')).toHaveCount(1);
});
```

- [ ] **Step 2: Run to verify failure** — Expected: FAIL (no curtain rule).

- [ ] **Step 3: Implement** the curtain: the old page lifts and clips away upward (`clip-path: inset(0 0 0 0) → inset(0 0 100% 0)`, `translate: 0 -2rem`, 320 ms) while the new page is revealed from the bottom (`clip-path: inset(100% 0 0 0) → inset(0)`, 520 ms, `var(--ease-snap)`), with a 3 px accent leading edge drawn by `box-shadow` on `::view-transition-new(.page-curtain-in)`. The `.morph` group keeps its current rules. All inside `@media (prefers-reduced-motion: no-preference)`.

- [ ] **Step 4: Run** `shell.spec.ts projects.spec.ts` — Expected: PASS.

- [ ] **Step 5: Commit** `feat(motion): route curtain`

---

### Task 8: Stack marquee on reports, underline draw, decision record

**Files:**
- Modify: `src/components/content/RunSummaryPanel.tsx` (Tools row), `src/app/globals.css` (`.marquee*`, link underline draw), `tests/e2e/layout.spec.ts` (exempt `[data-marquee]` descendants), `docs/04-DECISIONS.md` (C39)
- Test: `tests/e2e/projects.spec.ts`

**Interfaces:**
- Produces: `[data-marquee]` viewport element.

- [ ] **Step 1: Write the failing test**

```ts
test('report tools scroll in a marquee that screen readers and print read as one list', async ({ page }) => {
  const project = projectsInOrder()[0]!;
  await page.goto(`/projects/${project.slug}`);
  const marquee = page.locator('[data-marquee]');
  await expect(marquee.locator('ul:not([aria-hidden])').getByRole('listitem')).toHaveCount(project.stack.length);
  await expect(marquee.locator('ul[aria-hidden="true"]')).toHaveCount(1);
  await page.emulateMedia({ media: 'print' });
  await expect(marquee.locator('ul[aria-hidden="true"]')).toBeHidden();
});
```

- [ ] **Step 2: Run to verify failure** — Expected: FAIL (no `[data-marquee]`).

- [ ] **Step 3: Implement** the marquee: `overflow: hidden` viewport with a track holding the real list and an `aria-hidden` copy; `translate: 0 → -50%` over `max(12s, 2.5s × tools)` linear infinite; paused on hover and focus-within; under reduced motion and in print the copy is `display: none` and the track wraps. Underline draw: content links get `background-size: 0 1px → 100% 1px` on hover and focus (no colour change beyond the existing one). Layout spec: `shown()` returns false inside `[data-marquee]`. Record C39 in `docs/04-DECISIONS.md` summarising the direction and the calls listed in the spec.

- [ ] **Step 4: Run the full gate**

Run: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`
Expected: all pass.

- [ ] **Step 5: Commit and push** `feat(motion): report stack marquee and drawn underlines`, then `git push`; CI (including Lighthouse and the preview checks) must go green, and the PR gets before/after screenshots.

## Changes from the spec

- "Headings reveal line by line" becomes "the heading rises out of its line": splitting lines needs JavaScript measurement on every resize; a single masked rise gives the same effect with CSS.
- The coverage map highlights on hover only, since the SVG is decorative (`aria-hidden`) and so not focusable; keyboard users get the same areas in the list.
