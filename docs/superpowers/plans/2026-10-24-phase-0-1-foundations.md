# Phases 0–1: Pre-flight, Scaffold and Foundations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A public repo with a running Next.js 16 site: validated env, verified design tokens in both themes, a
keyboard-operable sidebar/drawer shell, a placeholder page with a real `<h1>` for every route, a custom 404, and
green `static` + `build` CI jobs.

**Architecture:** Static App Router site. Design tokens live in one CSS file and are contrast-checked by a unit
test that parses that file. The mobile drawer is a native `<dialog>` opened by an invoker-command button
(`commandfor`/`command="show-modal"`), so it works without JS; a small client component adds `aria-expanded`
sync, close-on-navigate and close-on-resize.

**Tech Stack:** Node 22 (fnm), pnpm, Next.js 16.4, TypeScript strict, Tailwind CSS v4, next-themes 0.4, Zod 4,
Vitest, Playwright, ESLint flat config, Prettier, GitHub Actions, Vercel CLI (token auth).

**Spec:** `docs/03-MASTER-PROMPT.md` (Sections 2, 3, 4.1, 4.3, 5, 11, 12.1, 13, 14 Phases 0–1), amended by
`docs/04-DECISIONS.md`. Content source: `docs/01-PORTFOLIO-DATA.md`.

Later phases get their own plan file, written when the previous phase is approved.

## Global Constraints

- No emojis anywhere in the product (UI, copy, metadata).
- Never render `TODO`, placeholder text or lorem ipsum. Placeholder routes show a real `<h1>` with the page name
  only, plus at most one sentence taken verbatim from the data file.
- No database, CMS, auth, state library, CSS-in-JS, animation library or component kit.
- Motion is CSS transitions only and respects `prefers-reduced-motion`.
- Responsive 320px–2560px, no horizontal scroll; touch targets >= 44x44px on touch layouts.
- WCAG 2.2 AA: 4.5:1 body text, 3:1 large text and UI components; focus ring 2px outline + 2px offset.
- Breakpoints: desktop >= 1024px (fixed 280px sidebar, content max 1100px, 48px gutters); below 1024px a 56px top
  bar + full-height drawer, 16px side gutters (decision C2).
- `docs/*.pdf`, `assets-inbox/`, `.env.local`, `.env.cli`, `.vercel/`, `tests/fixtures/client-denylist.txt` are
  never committed.
- No client names, regions, URLs or staff names in any committed file or commit message.
- Never run `vercel login`; Vercel auth is the token in `.env.cli`. Auth failure means stop and ask Vincent.
- Commits: identity `Vincent Jerico Alcuran <vincentjericoalcuran@gmail.com>`, trailer
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **No JavaScript on mobile:** the menu button must still open the drawer and every nav link must be reachable
   (invoker commands are native). Test pinned in Task 6.
2. **320px with the full name in the top bar:** no horizontal overflow on any placeholder route. Test pinned in
   Task 6.
3. **First paint in light-OS browsers:** no flash of the dark theme and no hydration warning in the console.
   Test pinned in Task 5.
4. **Resizing from mobile to desktop while the drawer is open:** the drawer closes and the page is not left inert.
   Test pinned in Task 6.
5. **`NEXT_PUBLIC_SITE_URL` with a trailing slash or surrounding whitespace:** normalised to origin without a
   trailing slash, so canonicals never contain `//`. Test pinned in Task 3.

---

## Phase 0 — Pre-flight

### Task 1: Repository bootstrap

**Files:**
- Create: `.gitignore`
- Modify: `docs/01-PORTFOLIO-DATA.md` (Section 5: remove region text from the Industry lines, per D5 — the repo is
  public, so keeping them "for the record" would publish them)

- [ ] **Step 1:** Write `.gitignore` with: `docs/*.pdf`, `assets-inbox/`, `.DS_Store`, `node_modules/`, `.next/`,
  `out/`, `coverage/`, `.env*.local`, `.env.cli`, `.vercel/`, `playwright-report/`, `test-results/`,
  `tests/fixtures/client-denylist.txt`, `*.tsbuildinfo`, `next-env.d.ts`, `public/cv/`.
- [ ] **Step 2:** Edit data file Section 5: Industry lines lose their regions; replace the "regions below stay here"
  rule with "Do not show the client's region (D5)."
- [ ] **Step 3:** `git init -b main`, then repo-local `git config user.name "Vincent Jerico Alcuran"` and
  `git config user.email "vincentjericoalcuran@gmail.com"`.
- [ ] **Step 4:** `git add -A && git status --short` — Expected: only `.gitignore` and `docs/*.md` (incl.
  `docs/superpowers/plans/…`). No `.pdf`, nothing from `assets-inbox/`.
- [ ] **Step 5:** Grep the staged tree for the removed region words; Expected: no match.
- [ ] **Step 6:** Commit `chore: initial docs and gitignore`.
- [ ] **Step 7:** `gh repo create VincentJerico/portfolio --public --source . --push`, then confirm with
  `gh repo view VincentJerico/portfolio --json visibility,url`.

**Phase 0 DoD:** tooling versions printed; repo URL; table of present/missing assets (02-ASSETS-CHECKLIST) and
unresolved data-file items. Stop for Vincent's go-ahead.

---

## Phase 1 — Scaffold and foundations

### Task 2: Scaffold and static tooling

**Files:**
- Create (scaffold): `package.json`, `src/app/*`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`,
  `eslint.config.mjs`
- Create: `.prettierrc`, `.prettierignore`, `.editorconfig`, `.node-version`, `CLAUDE.md`, `AGENTS.md`
  (one line: "See CLAUDE.md")

- [ ] **Step 1:** `fnm use 22` (write `.node-version` = `22` first), then
  `pnpm create next-app@latest . --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-pnpm --yes`.
  If it refuses the non-empty folder, scaffold into the scratchpad and move the files in (never overwrite `docs/`).
- [ ] **Step 2:** `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`.
- [ ] **Step 3:** Add `prettier`, `eslint-config-prettier`, `eslint-plugin-playwright`; flat config applies the
  Playwright plugin to `tests/e2e/**`. `.prettierrc`: `{ "singleQuote": true, "printWidth": 100 }`.
- [ ] **Step 4:** Scripts: `lint` (`eslint . --max-warnings=0`), `format` (`prettier --write .`), `format:check`,
  `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `test:e2e` (`playwright test`), `build`, `start`.
  `engines.node` = `>=22 <23`.
- [ ] **Step 5:** `CLAUDE.md`: data integrity (data file is the only source; hidden when not VERIFIED), no emojis,
  client confidentiality, run `lint format:check typecheck test build` before claiming done, plus the Vercel block
  from the `supabase-vercel-cli-auth` skill (personal account, never `vercel login`, auth failure = stop and ask).
- [ ] **Step 6:** Run `pnpm lint && pnpm format:check && pnpm typecheck && pnpm build`. Expected: all exit 0.
- [ ] **Step 7:** Commit `chore: scaffold Next.js 16 with strict TypeScript and tooling`.

### Task 3: Environment validation

**Files:**
- Create: `src/lib/env.ts`, `vitest.config.ts`, `.env.example`
- Test: `tests/unit/env.test.ts`

**Interfaces:**
- Produces: `parseEnv(source: Record<string, string | undefined>): Env` where
  `Env = { NEXT_PUBLIC_SITE_URL: string }` (origin, no trailing slash); `env: Env` (parsed from
  `{ NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL }` so Next inlines it); `siteUrl(path?: string): string`.

- [ ] **Step 1: Write failing tests**

```ts
it('throws naming the variable when missing', () =>
  expect(() => parseEnv({})).toThrow(/NEXT_PUBLIC_SITE_URL/));
it('throws on a non-URL', () =>
  expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: 'not a url' })).toThrow(/NEXT_PUBLIC_SITE_URL/));
it('normalises trailing slash and whitespace', () =>
  expect(parseEnv({ NEXT_PUBLIC_SITE_URL: ' https://example.dev/ ' }).NEXT_PUBLIC_SITE_URL).toBe('https://example.dev'));
it('builds absolute URLs without double slashes', () =>
  expect(siteUrl('/projects', 'https://example.dev')).toBe('https://example.dev/projects'));
```

(`siteUrl(path = '/', base = env.NEXT_PUBLIC_SITE_URL)`.)

- [ ] **Step 2:** `pnpm test tests/unit/env.test.ts` — Expected: FAIL (module not found).
- [ ] **Step 3:** Implement with `z.object({ NEXT_PUBLIC_SITE_URL: z.string().trim().pipe(z.url()) })`; on failure
  throw `Error('Invalid environment: NEXT_PUBLIC_SITE_URL …')` with Zod's message.
- [ ] **Step 4:** Import `@/lib/env` in `next.config.ts` so `pnpm build` fails without it. Verify:
  `NEXT_PUBLIC_SITE_URL= pnpm build` fails with the variable name; with `.env.local` set to
  `http://localhost:3000` it passes. `.env.example` documents all Section 11 variables (values empty).
- [ ] **Step 5:** Tests pass; commit `feat: validate NEXT_PUBLIC_SITE_URL at build time`.

### Task 4: Design tokens with enforced contrast

**Files:**
- Create: `src/styles/tokens.css`, `src/lib/contrast.ts`, `scripts/contrast-report.ts`
- Modify: `src/app/globals.css` (import tokens, Tailwind v4 `@theme inline` mapping), `src/app/layout.tsx` (fonts)
- Test: `tests/unit/contrast.test.ts`, `tests/unit/tokens.test.ts`

**Interfaces:**
- Produces: `contrastRatio(a: string, b: string): number` (WCAG relative luminance, hex in);
  `parseTokens(css: string): { dark: Record<string, string>; light: Record<string, string> }`;
  `TOKEN_PAIRS: { fg: string; bg: string; min: 4.5 | 3; use: string }[]`; CSS vars `--bg --surface --surface-2
  --border --text --text-muted --accent --pass --warn --fail --focus-ring`; Tailwind colours `bg`, `surface`,
  `surface-2`, `line`, `ink`, `ink-muted`, `accent`, `pass`, `warn`, `fail`; font vars `--font-sans`, `--font-mono`,
  `--font-display`.

- [ ] **Step 1: Failing tests.** `contrastRatio('#000000', '#FFFFFF')` ≈ 21 (`toBeCloseTo(21, 1)`);
  `contrastRatio('#777777', '#FFFFFF')` ≈ 4.48. `tokens.test.ts` reads `src/styles/tokens.css`, and for each theme
  and each of `TOKEN_PAIRS` asserts `contrastRatio >= min`. Pairs: `text`, `text-muted`, `accent`, `pass`, `warn`,
  `fail` on each of `bg`, `surface`, `surface-2` at 4.5; `focus-ring` on `bg` and `surface` at 3.
- [ ] **Step 2:** Run — Expected: FAIL (missing modules).
- [ ] **Step 3:** `tokens.css`: `:root` holds the dark values (dark is the no-JS default), `.light` the light
  values, exactly as spec 4.1. Implement `contrast.ts` and `parseTokens` (regex over the two blocks).
- [ ] **Step 4:** Run tests. If a spec value fails, adjust only that value to the nearest passing shade and record
  old → new in `docs/04-DECISIONS.md`. Re-run until PASS.
- [ ] **Step 5:** Fonts with `next/font/google`: IBM Plex Sans (400, 600), IBM Plex Mono (500), Instrument Serif
  (400), `display: 'swap'`, exposed as the three font vars. Base typography per spec 4.1 table in `globals.css`.
- [ ] **Step 6:** `scripts/contrast-report.ts` prints a markdown table (theme, pair, ratio, min, PASS/FAIL) for the
  DoD. Run with `pnpm tsx scripts/contrast-report.ts`.
- [ ] **Step 7:** Commit `feat: design tokens with contrast-checked pairs for both themes`.

### Task 5: Theming

**Files:**
- Create: `src/components/ui/ThemeToggle.tsx`, `src/components/providers/ThemeProvider.tsx`,
  `playwright.config.ts`
- Modify: `src/app/layout.tsx`
- Test: `tests/e2e/theme.spec.ts`

**Interfaces:**
- Produces: `<ThemeToggle />` — a `<button aria-pressed={isDark}>` with visible text "Dark theme" and a lucide icon;
  `ThemeProvider` wraps `next-themes` with `attribute="class"`, `value={{ light: 'light', dark: 'dark' }}`,
  `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`. (Decision C11: "system respected" means
  OS preference wins; dark is the CSS/no-JS default.)

- [ ] **Step 1:** Playwright config: `webServer` = `pnpm build && pnpm start` on port 3000 (reuse locally),
  projects `chromium` and `mobile-chrome` (Pixel 7) for now; WebKit and retries come in Phase 5.
- [ ] **Step 2: Failing tests** in `theme.spec.ts`:
  - with `colorScheme: 'light'`, `<html>` has class `light` before any interaction, and the console has no errors
  - with `colorScheme: 'dark'`, `<html>` has class `dark`
  - clicking the toggle flips the class and `aria-pressed`; after `page.reload()` the choice persists
  - with JS disabled, computed `--bg` on `<html>` is `#0B0F14` (dark default)
- [ ] **Step 3:** Run — Expected: FAIL.
- [ ] **Step 4:** Implement; `<html lang="en" suppressHydrationWarning>`.
- [ ] **Step 5:** Run — Expected: PASS. Commit `feat: theme provider and accessible theme toggle`.

### Task 6: Layout shell, placeholder routes, 404

**Files:**
- Create: `src/lib/nav.ts`, `src/components/layout/{SkipLink,Sidebar,MobileTopBar,Drawer,NavList}.tsx`,
  `src/app/{projects,work,skills,about,resume,quality,contact}/page.tsx`,
  `src/app/projects/[slug]/page.tsx`, `src/app/work/[slug]/page.tsx`, `src/app/not-found.tsx`,
  `public/icon.svg` (VJ monogram)
- Copy: `assets-inbox/profile/vincent-portrait.jpg` → `public/images/profile/vincent-portrait.jpg`
- Test: `tests/e2e/shell.spec.ts`, `tests/unit/nav.test.ts`

**Interfaces:**
- Produces: `NAV_ITEMS: readonly NavItem[]` with
  `NavItem = { href: string; label: string; spec: string }` in order Overview `/`, Projects `/projects`,
  Client Work `/work`, Skills `/skills`, About `/about`, Resume `/resume`, Quality `/quality`, Contact `/contact`;
  `isActive(pathname: string, href: string): boolean` (`/` exact, others prefix). `<NavList pathname />` renders
  `<ul>` of links with `aria-current="page"` and a non-colour indicator (left bar + bold). Drawer element id
  `site-drawer`; menu button has `commandfor="site-drawer" command="show-modal"`, `aria-controls="site-drawer"`,
  `aria-expanded`. `[slug]` routes export `generateStaticParams` returning `[]` for now and
  `dynamicParams = false`, so every slug 404s until Phase 2.

- [ ] **Step 1: Unit test** `isActive`: `('/', '/')` true; `('/projects/x', '/')` false;
  `('/projects/x', '/projects')` true; `('/projectsx', '/projects')` false.
- [ ] **Step 2: Failing E2E tests** in `shell.spec.ts`:
  - each of the 8 routes: status 200, exactly one `h1`, one `main`; first Tab focuses "Skip to content"; Enter
    moves focus into `main`
  - desktop (1280): sidebar `nav` visible, active link has `aria-current="page"`; menu button hidden
  - mobile (375): menu button `aria-expanded="false"`; Enter opens drawer → `true`, focus inside drawer; Tab cycles
    stay inside the dialog; Esc closes → `false` and focus is on the menu button; close button and link click do the
    same (link click also navigates)
  - every interactive shell element shows a visible focus indicator (outline width > 0 when focused)
  - Review Focus 1: JS disabled at 375: clicking the menu button opens the drawer and nav links are visible
  - Review Focus 2: at 320 on every route, `scrollWidth <= innerWidth`
  - Review Focus 4: open the drawer at 375, resize to 1280: dialog not `open`, no element under `body` is `inert`
  - `/does-not-exist` returns 404 with links to Overview and Projects; `/projects/anything` returns 404
- [ ] **Step 3:** Run — Expected: FAIL.
- [ ] **Step 4:** Implement. Sidebar (desktop): header block (avatar 48px, `object-position: 50% 35%`, alt
  "Vincent Jerico Alcuran"; full name; role line "Software QA/QC Engineer · path to SDET"), `NavList`,
  `ThemeToggle`, links GitHub and Email with icon + visible text (LinkedIn omitted: TODO). Test-explorer styling
  and the quality chip arrive in Phase 3b. MobileTopBar: 56px, monogram, name (truncates with ellipsis), menu
  button 44x44. Drawer: `<dialog>` full height, close button, same `NavList`; a client effect syncs
  `aria-expanded` on `toggle`, closes on pathname change, and closes when `matchMedia('(min-width:1024px)')`
  matches. Transitions disabled under `prefers-reduced-motion`. Placeholder pages: `<h1>` = nav label; `metadata`
  title = label.
- [ ] **Step 5:** Run unit + E2E — Expected: PASS. Commit `feat: sidebar, mobile drawer, routes and 404`.

### Task 7: Vercel CLI token setup and CI

**Files:**
- Create: `.env.cli.example`, `vercel.json`, `.github/workflows/ci.yml`
- Modify: `package.json` (devDependency `dotenv-cli`, `vercel`; scripts below)

- [ ] **Step 1:** `.env.cli.example` with empty `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Scripts:
  `vercel:link`: `dotenv -e .env.cli -- sh -c 'vercel link --yes --token "$VERCEL_TOKEN"'`;
  `deploy:preview`: `… vercel deploy --token "$VERCEL_TOKEN"`; `deploy`: `… vercel deploy --prod --token
  "$VERCEL_TOKEN"`. (Wrap in `sh -c` so `$VERCEL_TOKEN` expands after dotenv loads it.)
- [ ] **Step 2:** `vercel.json`: `{ "git": { "deploymentEnabled": false } }` (D1).
- [ ] **Step 3:** `ci.yml`, on push and pull_request: job `static` (checkout, pnpm/action-setup, setup-node with
  `node-version-file: .node-version` and pnpm cache, `pnpm install --frozen-lockfile`, lint, format:check,
  typecheck, test) and job `build` (needs static; `NEXT_PUBLIC_SITE_URL: http://localhost:3000`; `pnpm build`;
  upload `.next` as artifact). Pin actions to major versions; `permissions: contents: read`.
- [ ] **Step 4:** Full local gate run, commit `ci: static and build jobs; token-based Vercel CLI scripts`, push, and
  `gh run watch` until both jobs are green.
- [ ] **Step 5:** Ask Vincent to paste his personal Vercel token into `.env.cli`; verify with
  `pnpm dotenv -e .env.cli -- sh -c 'vercel whoami --token "$VERCEL_TOKEN"'` (show username only). This does not
  block the DoD report; it is listed there if still pending.

**Phase 1 DoD:** site runs locally; keyboard results of `shell.spec.ts`; screenshots of both themes; contrast table
from `scripts/contrast-report.ts`; link to the green CI run. Stop for Vincent's go-ahead.
