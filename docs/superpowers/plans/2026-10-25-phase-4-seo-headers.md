# Phase 4: SEO, Metadata, Headers, Analytics — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every route has correct metadata, a canonical URL and a generated Open Graph image; the site ships a
sitemap, robots file and JSON-LD; every response carries the spec 10 security headers; Vercel Analytics and
Speed Insights run on Vercel only.

**Spec:** `docs/03-MASTER-PROMPT.md` Sections 9, 10, 14 Phase 4; amended by `docs/04-DECISIONS.md`.

## Global Constraints

- `metadataBase` and canonicals come from `getEnv().NEXT_PUBLIC_SITE_URL`; title template
  `%s · Vincent Jerico Alcuran`, default `Vincent Jerico Alcuran · Software QA/QC Engineer on the path to SDET`.
- OG images: dark control-panel style, name + page title + one metric or hook; no emojis, no client info.
- Sitemap lists only public routes (approved case studies only); robots allows all and links the sitemap.
- Headers exactly as spec 10 unless a value demonstrably breaks the site (then adjust and log the decision).
- Analytics render only when built on Vercel (`VERCEL=1`), so CI and local runs never request missing scripts.
- No console errors on any route (the integrity sweep enforces it).

## Review Focus

1. **A case study whose `approved` flips to false:** its URL disappears from the sitemap and its OG image is not
   generated. Pinned in Task 1 (unit test on `sitemapEntries`).
2. **`upgrade-insecure-requests` and HSTS on `http://localhost`:** local and CI runs must keep working (no
   upgraded same-origin requests). Pinned by the full E2E suite under the new headers (Task 3).
3. **CI badges and fonts under the CSP:** badge images from github.com load; fonts are self-hosted. Pinned in
   Task 3 (no CSP violation reports in the console).
4. **OG image text overflow for long titles** (e.g. `playwright-framework-template`): text wraps inside the card.
   Pinned in Task 2 by rendering every OG image and checking 1200x630 PNGs.
5. **The in-page runner's header check:** turns PASS once headers ship. Pinned in Task 3.

---

### Task 1: Metadata, canonicals, sitemap, robots, JSON-LD

- `src/lib/seo.ts`: `pageMetadata({ title, description, path })` → `Metadata` with `alternates.canonical`,
  `openGraph` (type, url, siteName, locale `en`), `twitter: { card: 'summary_large_image' }`.
- Root layout: `metadataBase`, default description `profile.oneLiner`, OG defaults.
- Every page uses `pageMetadata` (reports: summary; case studies: system; others: oneLiner or page intro).
- `src/app/sitemap.ts` via `sitemapEntries()` (all nav pages, reports, approved case studies), `src/app/robots.ts`.
- `src/components/seo/JsonLd.tsx`; `/`: `Person` (name, jobTitle, worksFor Organization BossLabs.AI, url,
  sameAs GitHub, alumniOf CollegeOrUniversity, knowsLanguage). Reports: `SoftwareSourceCode` with
  `codeRepository` when public, else `CreativeWork`.
- Tests: unit `sitemapEntries` (count, approved-only, absolute URLs); E2E each route has one canonical equal to
  site URL + path, a description, `og:image`; `/` JSON-LD parses with `@type: Person`; reports have
  `SoftwareSourceCode`/`CreativeWork`; `/sitemap.xml` and `/robots.txt` served.

### Task 2: Open Graph images

- `src/lib/og.tsx`: `renderOgImage({ kicker, title, line })` with IBM Plex Mono / Instrument Serif loaded from
  `@fontsource` WOFF files; tokens from the dark theme.
- `opengraph-image.tsx` for `/`, each top-level page, `/projects/[slug]` (`generateStaticParams`),
  `/work/[slug]`; alt text set per image.
- Tests: E2E requests every route's `og:image` URL → 200 `image/png`, 1200x630 (PNG header).

### Task 3: Security headers

- `next.config.ts` `headers()` for `/:path*` with the spec 10 table; CSP `script-src` keeps `'unsafe-inline'`
  (Next's inline RSC payload and the theme script; nonces would make every page dynamic) — logged.
- Tests (Phase 5 extends them): request API on `/` and a report page asserts each header value, no
  `Access-Control-Allow-Origin: *`; full E2E stays green; runner header check passes.

### Task 4: Vercel Analytics and Speed Insights

- `<Analytics />` and `<SpeedInsights />` in the root layout only when `process.env.VERCEL === '1'` at build.
- CSP hosts verified against the installed packages' script URLs.
- Test: built HTML (non-Vercel build) has no `/_vercel/` script tags; no console errors.
