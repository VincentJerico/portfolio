# Phase 2: Content Layer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every fact the site may show lives in typed, Zod-validated TypeScript under `src/content/`, transcribed
verbatim from `docs/01-PORTFOLIO-DATA.md`, with tests that fail on invented placeholders, emojis, unapproved case
studies or client names.

**Architecture:** One file per collection, each exporting raw data typed with `z.input<…>`; `src/content/index.ts`
parses every collection at import and throws on invalid data, so a bad value fails `next build` and `pnpm test`.
Rendering helpers in `src/lib/content.ts` hide anything not `verified`. A recursive string walker powers the
banned-string and client-denylist guards; each guard has a self-test fixture that must make it fail.

**Tech Stack:** Zod 4, Vitest, TypeScript strict.

**Spec:** `docs/03-MASTER-PROMPT.md` Sections 2.1–2.2, 6, 7 (field usage), 12.2, 14 Phase 2; amended by
`docs/04-DECISIONS.md`. Data: `docs/01-PORTFOLIO-DATA.md`.

## Global Constraints

- Transcribe **verbatim**. Allowed edits: splitting a data-file line at its own separators (`·`, `;`, bullets),
  joining a label to its value ("Target: …"), and the data file's own stated substitutions ("Troubleshot",
  "Dean's Lister"). No new sentences, no rounding, no new totals.
- Anything `TODO` or `PRIVATE` is omitted (optional field left `undefined`), never a placeholder string.
- No client names or regions anywhere (D5). The denylist file never gets committed.
- No emojis. All dates ISO (`YYYY-MM-DD`, `YYYY-MM`) or the data file's own strings.
- `asOf` for metrics: `2026-10-24` (data file Section 2 heading).
- Spec schema is binding; extensions are listed in Task 1 and logged in `docs/04-DECISIONS.md`.

## Review Focus

1. **A string field that looks fine but was paraphrased** (e.g. a hook re-worded): expected to match the data
   file. Pinned by the Task 5 spot-check script plus the verbatim test over hooks/summaries in Task 3.
2. **Unapproved or non-verified items leaking through a code path that skips the helpers** (e.g. `/work/[slug]`
   params built from the raw array): expected to be excluded. Pinned in Task 1 (`caseStudySlugs()` built on
   `approvedCaseStudies()`).
3. **Emoji variants the regex misses** (variation selector `U+FE0F`, keycaps, flags): expected to be caught.
   Pinned in Task 1 self-test fixture.
4. **Denylist with blank lines, CRLF or mixed case:** expected to ignore blanks and match case-insensitively.
   Pinned in Task 4.
5. **A finding `sourceHref` anchor that doesn't exist in the repo's FINDINGS.md:** expected to resolve. Pinned in
   Task 3 by a test that slugs the cloned headings (anchors recorded from the repos at the commits below).

---

### Task 1: Schema, helpers and integrity guards

**Files:** Create `src/content/schema.ts`, `src/lib/content.ts`, `src/lib/strings.ts`,
`tests/unit/content-helpers.test.ts`, `tests/unit/strings.test.ts`, `tests/fixtures/planted-content.ts`.

**Interfaces (produces):**
- `schema.ts` exactly as spec Section 6, plus these extensions (each logged in decisions as C14–C19):
  `Profile.languages: z.array(z.string()).default([])` (D7); `Profile.siteUrl` removed — the env module is the
  single source (`getEnv()`); `Project.year: z.string().regex(/^\d{4}$/).optional()` (C3);
  `decisions[].body: z.string().optional()` (data bullets without a "title: body" split);
  `CaseStudy.currentlyTesting: z.boolean().default(false)` (data 5.3 "show as Currently testing");
  `QaArea = z.string()` collection for data 5.4 (`src/content/method.ts`).
- Types: `export type Profile = z.output<typeof Profile>` etc. for every schema.
- `content.ts`: `visible<T extends { status: Status }>(items: readonly T[]): T[]`;
  `approvedCaseStudies(items?: readonly CaseStudy[]): CaseStudy[]` (default: parsed content);
  `caseStudySlugs(): string[]`; `projectBySlug(slug: string): Project | undefined`;
  `projectsInOrder(): Project[]`.
- `strings.ts`: `collectStrings(value: unknown, path?: string): { path: string; value: string }[]` (walks objects
  and arrays); `BANNED: RegExp[]` = `/\bTODO\b/`, `/lorem/i`, `/\bCONFIRM\b/`, `/\bAPPROVAL\b/`,
  `/\p{Extended_Pictographic}|\u{FE0F}|\u{20E3}|\p{Regional_Indicator}/u`;
  `findBanned(value: unknown): { path: string; value: string; rule: string }[]`;
  `parseDenylist(text: string): string[]` (trim, drop blanks and `#` comments, CRLF-safe);
  `findDenied(value: unknown, deny: string[]): { path: string; term: string }[]` (case-insensitive substring).

- [ ] **Step 1:** Write failing tests: `visible` keeps only `verified` from a 4-status fixture;
  `approvedCaseStudies` drops `approved: false` and drops `approved: true, status: 'approval'`;
  `findBanned` on the planted fixture reports TODO, lorem, CONFIRM, APPROVAL, a plain emoji, `U+2764 U+FE0F`,
  a keycap `1⃣` and a flag `🇵🇭` (each by path); `findBanned({ ok: 'Software QA/QC Engineer · SDET — 12 s' })` is
  `[]`; `parseDenylist('  Acme \r\n\n# c\nBeta Co\n')` → `['Acme', 'Beta Co']`;
  `findDenied({ a: ['x', 'made by ACME'] }, ['acme'])` → `[{ path: 'a[1]', term: 'acme' }]`.
- [ ] **Step 2:** Run `pnpm test` — Expected: FAIL (modules missing).
- [ ] **Step 3:** Implement schema, helpers, strings.
- [ ] **Step 4:** Run — Expected: PASS. Commit `feat(content): schema, visibility helpers and string guards`.

### Task 2: Profile, experience, education, certifications, skills, timeline, method, case studies

**Files:** Create `src/content/{profile,metrics,experience,education,certifications,skills,timeline,method,
case-studies}.ts`, `src/content/index.ts`; Test `tests/unit/content.test.ts`. Modify: delete
`src/lib/identity.ts`; shell components read `profile`; `src/lib/nav.ts` gains `navItems(): NavItem[]` that drops
Client Work when `approvedCaseStudies()` is empty.

**Interfaces (produces):** `index.ts` exports parsed `profile`, `metrics`, `projects`, `experience`,
`caseStudies`, `skills`, `certifications`, `timeline`, `education`, `qaAreas`, and `allContent` (object of all, for
the guards).

Field sources (all verbatim):
- **profile**: data §1 + Positioning. `role` "Software QA/QC Engineer", `company` "BossLabs.AI", `headline`,
  `oneLiner` (joined on one line with its `·` separators), `intro`, `tagline` (Proof-first tagline), `goal` "SDET",
  `nextDirections` ["Cybersecurity", "Cloud Engineering"], `location` "Cavite, Philippines", `email`, `github`,
  `photo`, `languages` ["English", "Tagalog"], `cvPdf` "/cv/Vincent-Jerico-Alcuran-CV.pdf". Omitted: `linkedin`
  (TODO), `openToWork` (not shown). `displayName` "Vincent Jerico".
- **metrics**: the 10 rows of §2, ids `public-repos, ci-repos, automated-tests, manual-cases, wcag-failures,
  owasp-findings, login-latency, crud-throughput, seeded-bugs, browsers`. `value` is the table's value; where the
  value cell holds a parenthetical, the parenthetical moves to `context` (e.g. value "108", context
  "91 Playwright UI + 17 Playwright API"). `login-latency`: value "12 s p95" (spec 6 example), context
  "a 2 ms read pushed to 12 s at p95 (60 logins/s)". `browsers`: value "4", context
  "Chromium, Firefox, WebKit, mobile Chrome" (count of items rendered on the same tile — spec 2.1). Sources per
  C6.
- **experience**: §4.1–4.3, `kind` job / internship / scholarship; BossLabs `hasCaseStudies: true`, start
  `2026-09-03`, bullets = the Responsibilities cell; internship start `2026-02` end `2026-05`, location
  "Tanza, Cavite"; scholarship start `2025-01` end `2025-11`.
- **education**: §7. `graduated` `2026-08`, `gpa` "1.80 (Philippine scale, 1.00 highest)", `honors`
  ["Dean's Lister"], `capstoneSlug` "legatalink".
- **certifications**: §8 rows; dates `2026-07`, `2025-04`, `2025-01/2025-04`. No `credentialUrl` (TODO).
- **skills**: §6 rows; `learning: true` for the Learning row. Evidence labels map to hrefs: repo names →
  `/projects/<slug>`, "taskflow" → `/projects/taskflow-under-test`, "LegataLink" → `/projects/legatalink`,
  "client work" → `/work`, "CV" → `/resume`, "internship" and "coursework" → `/about`, "Fortinet cert" →
  `/about#certifications`, "repos" and "profile README" → the GitHub profile URL.
- **timeline**: §9 rows, `date` = the data file's Date cell verbatim (`2025-01 to 2025-11`, `Next`).
- **method**: §5.4, the 12 areas.
- **case studies**: §5.1–5.3, `approved: true`, `status: 'verified'`, industry without region (D5),
  `activities` = "Vincent's work" bullets, `outcomes` and `method` `[]`, C `currentlyTesting: true`.

- [ ] **Step 1: Failing tests** in `content.test.ts`: `allContent` parses; `findBanned(allContent)` is `[]`;
  `profile.linkedin` and `profile.openToWork` are undefined; `metrics` has 10 items with unique ids and every
  `asOf` = `2026-10-24`; case-study region terms are checked by the private denylist (Task 4);
  `qaAreas.length === 12`; every skill evidence href is a URL or starts with `/`; `navItems()` includes Client Work
  while case studies are approved.
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Transcribe; wire shell to `profile`; replace `NAV_ITEMS` use with `navItems()`.
- [ ] **Step 4:** `pnpm test`, `pnpm test:e2e` — Expected: PASS (shell output unchanged). Commit
  `feat(content): profile, experience, skills, timeline and case studies`.

### Task 3: Projects and evidence images

**Files:** Create `src/content/projects.ts`; copy images to `public/images/projects/<slug>/`; Test
`tests/unit/projects.test.ts`.

Per project (data §3.1–3.8, display order 1–8): `summary`, `hook`, `stack` (split on `·`), `target`, dates,
`commits`, `repo`, `ciBadge`/`ciUrl` (C5, not LegataLink), `category` enum (C4). Mapping of the remaining
data lines:
- `context`: Target/Scope guard/Type/Client/Full title/Features lines, as "Label: value".
- `approach`: CI line, Patterns, Build milestones, the CV-IT line (LegataLink), test-type summary sentence.
- `decisions`: Engineering decisions bullets; split at the first ": " into title/body, else title only.
- `limits`: Limits / Caveat lines.
- `findings`: §3.1 (7), §3.2 (8), §3.3 (3). `reference` = WCAG/OWASP column; `trackedBy` where the data has it;
  D-1 `ticketStatus` "Report only", `note` = the §3.2 D-1 note. `sourceHref` = FINDINGS/BUGS-FOUND URL + GitHub
  anchor of the matching heading (accessibility-testing `f-1--cart-is-not-reachable-by-keyboard` style;
  performance `perf-001-login-traffic-stalls-every-other-request`). Ticket body fields (`steps`, `expected`,
  `actual`) wait for Phase 3b.
- `extraTables`: performance "Test types" (Type | Profile, split from the data line), api "Documented API
  quirks" (Case | Actual | Expected), taskflow "Seed-and-catch results" (verbatim table), journey "Area status"
  (verbatim) and "Bug reports" (ID | Report).
- `evidence` (alt from the repos' own alt/caption text where present):
  accessibility `menu-focus-obscured.png` 1280x720, `login-button-unfocused.png` and `login-button-focused.png`
  292x49 (caption from FINDINGS F-2: same bytes, same pixels); performance `breakpoint-dashboard.png` 1280x900;
  taskflow `screenshot.png` 1120x940; LegataLink `home-hero.png` 3024x1736 with the spec 14 alt text.
  `evidenceIndex` links F-7 → 0, F-2 → 2.
- LegataLink: `team: true`, `role` = the three CV-QA lines, `year` "2026", `liveUrl`, no `repo`.

- [ ] **Step 1: Failing tests**: 8 projects, orders 1–8 unique, slugs match data §3 slugs; each `hook` and
  `summary` appears verbatim in the data file (normalising line wraps); finding counts 7/8/3/0…; severity counts
  for accessibility = 1 critical, 3 serious, 3 moderate; every `sourceHref` anchor equals the slug of a heading in
  the cloned FINDINGS/BUGS-FOUND file (fixture `tests/fixtures/finding-anchors.json`, generated by
  `scripts/finding-anchors.ts` from the clones and committed); every evidence `src` exists under `public/` with
  matching width/height (read PNG header); LegataLink has no `repo`.
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Copy images, write the anchors script and fixture, transcribe projects.
- [ ] **Step 4:** Run — Expected: PASS. Commit `feat(content): eight projects with findings and evidence`.

### Task 4: Client denylist guard

**Files:** Create `tests/unit/denylist.test.ts`, `tests/fixtures/client-denylist.txt` (git-ignored); Modify
`.github/workflows/ci.yml` (write the `CLIENT_DENYLIST` secret to the fixture before unit tests).

- [ ] **Step 1: Failing tests**: loads the denylist from the file or `process.env.CLIENT_DENYLIST`; fails with
  "client denylist missing" when neither exists; the list is non-empty; `findDenied(allContent, list)` is `[]`;
  self-test: `findDenied(plantedContent, ['Planted Client Co'])` finds the planted case-study name.
- [ ] **Step 2:** Run with no file — Expected: FAIL "client denylist missing".
- [ ] **Step 3:** Create the file with postal code and street from the CV (read locally, never printed) plus
  client names once Vincent supplies them; set the repo secret with `gh secret set CLIENT_DENYLIST < file`; add
  the CI step.
- [ ] **Step 4:** Run — Expected: PASS. Commit `test(content): client denylist guard with self-test`.

### Task 5: DoD artefacts

**Files:** Create `scripts/content-report.ts` (prints the hidden-fields table and 10 random verbatim spot-checks:
each picks a leaf string from `allContent`, searches the data file with line wraps normalised, prints
`path | value | found at line N`).

- [ ] **Step 1:** Run `pnpm tsx scripts/content-report.ts`; Expected: every spot-check found (or explained as a
  documented split/join), hidden table matches the Phase 2 DoD.
- [ ] **Step 2:** Commit `chore(content): content report for the Phase 2 DoD`.
