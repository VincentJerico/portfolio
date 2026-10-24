# spec.md — Vincent Jerico Alcuran · Portfolio Website

Version: 1.1 · 2026-10-24 (CV, job details, LegataLink, approvals)
Owner: Vincent Jerico Alcuran (github.com/VincentJerico)
Executor: Claude Code
Data source of truth: `docs/01-PORTFOLIO-DATA.md`
Assets checklist: `docs/02-ASSETS-CHECKLIST.md`

---

## 0. How to run this

Open a terminal in the `Portfolio` folder and start Claude Code, then paste:

```
Read docs/03-MASTER-PROMPT.md (the spec) and docs/01-PORTFOLIO-DATA.md (the content source of truth) in full.
Use the superpowers skills (brainstorming -> writing-plans -> executing-plans, test-driven-development,
verification-before-completion) and the ui-ux-pro-max skill for all UI work.
Before writing code, ask me about anything in the spec that is ambiguous or that conflicts with the data file.
Then execute the phases in order. Stop at the end of each phase, show me the Definition of Done results,
and wait for my go-ahead before starting the next phase.
```

Pre-flight reminder (do this before Phase 1, manually, in this repo only):
confirm the **Vercel CLI** is set up with **token-based login** for this project (use the
`supabase-vercel-cli-auth` skill). This project has no database, so Supabase CLI is not needed here.

---

## 1. Goal

Build a fast, accessible, personal portfolio site that gets Vincent interviews for **QA Automation / SDET** roles.

The site has one job: prove, with evidence, that Vincent finds real defects and builds test systems that can't
lie. Every claim links to a repo, a findings report, or a test.

### Audience (in priority order)

1. Technical recruiters screening QA/SDET candidates (30-second scan: role, proof numbers, CV, contact)
2. QA leads / engineering managers (5-minute read: case studies, engineering decisions, findings tables)
3. Future freelance or BossLabs-adjacent clients (what he tests, how he works)

### Success criteria

- A recruiter can find role, headline proof, CV download and email within 10 seconds on a phone
- Every project page answers: what was tested, what was found, how it's enforced in CI, what the limits are
- The site itself passes the same quality gates Vincent applies to other software (Section 12), and says so on
  a public `/quality` page

---

## 2. Non-negotiables

1. **Data integrity.** All text, numbers, dates and links come from `docs/01-PORTFOLIO-DATA.md` (and, for
   finding details, the public `docs/FINDINGS.md` files it points to). Do not invent, round, aggregate or
   embellish. Do not create new totals by adding verified numbers together. Counting items that are rendered on
   the same page (e.g. "3 serious" from a findings list) is allowed. If a value is marked `TODO` or `PRIVATE`
   in the data file, the field is **hidden** in the UI until resolved — never render the word "TODO", placeholder
   text, or lorem ipsum. The only deliberate exception is Bug Hunt mode (Section 4.4), which is opt-in, off by
   default, clearly bannered, and never active for crawlers, OG images or Lighthouse.
2. **Client confidentiality.** Client case studies (Section 5 of the data file) render only when their
   `approved` flag is `true` (all three are approved, anonymously). No client names, logos, URLs, staff names or screenshots anywhere, including
   metadata, alt text, OG images and commit messages.
3. **No emojis** anywhere in the product (UI, copy, metadata, OG images).
4. **Sidebar navigation** on desktop (no top nav bar). On mobile the sidebar becomes a drawer opened from a
   compact top bar.
5. **Fully responsive** from 320px to 2560px wide. No horizontal scroll at any width. Touch targets at least
   44x44px on touch layouts (and never below WCAG 2.2 SC 2.5.8 minimum of 24x24px).
6. **WCAG 2.2 AA.** Zero axe-core violations (WCAG tags) in both themes, plus keyboard checks. The site must not
   repeat any defect Vincent documented in SauceDemo (see Section 12.3).
7. **Performance.** Lighthouse (mobile) Performance >= 95, Accessibility = 100, Best Practices >= 95, SEO = 100 on
   every route.
8. **No database, no CMS, no auth.** Content is typed TypeScript in the repo, validated with Zod at build time.
9. **Tested like a product.** Lint, format, typecheck, unit, E2E, accessibility, Lighthouse and security-header
   checks all gate CI. A gate must be shown to fail (self-test), mirroring Vincent's own repos.
10. **Unique, not templated.** The site must not look like a generic developer portfolio (big hero + card grid +
    skill bars). Its identity comes from the signature concept in Section 4.4. If a layout choice could appear
    on any portfolio template, push it toward the test-runner concept instead.

---

## 3. Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Runtime | Node 22 LTS | Match Vincent's repos (`.node-version` = 22) |
| Package manager | pnpm | |
| Framework | Next.js 16 (App Router), latest stable at scaffold time | All routes statically generated |
| Language | TypeScript, `strict: true`, `noUncheckedIndexedAccess: true` | |
| Styling | Tailwind CSS v4 + CSS variables for design tokens | |
| Theming | `next-themes` (class strategy), dark default, system respected | |
| Fonts | `next/font/google`: IBM Plex Sans, IBM Plex Mono, Instrument Serif | Self-hosted by Next, `display: swap` |
| Icons | `lucide-react` | Icons only, never emojis |
| Content validation | Zod 4 | Build fails on invalid content |
| OG images | `next/og` (`ImageResponse`) | Generated per route |
| Analytics | `@vercel/analytics` + `@vercel/speed-insights` | Cookieless; no consent banner needed |
| Unit tests | Vitest | Content schema + utilities |
| E2E + a11y | Playwright + `@axe-core/playwright` | Same tools as his repos |
| Lighthouse | `@lhci/cli` | Budgets enforced in CI |
| Link check | `lycheeverse/lychee-action` | Weekly + on PR |
| Lint/format | ESLint (flat config, `eslint-config-next`, `eslint-plugin-playwright`) + Prettier | |
| Hosting | Vercel | Preview deploy per PR, production on `main` |
| CI | GitHub Actions | |

Do not add a database, CMS, auth, state library, CSS-in-JS, animation library or component kit unless asked.
Motion uses CSS transitions only and respects `prefers-reduced-motion`.

---

## 4. Design direction — three looks, one system

Vincent chose all three directions. Blend them by job:

| Look | Where it lives | What it contributes |
| --- | --- | --- |
| **Control panel** (test-report / CI dashboard) | Sidebar, metric strip, project cards, findings tables, status chips, `/quality` | Mono labels, pass/fail/warn states, run-summary framing, terminal accents. Matches his GitHub README. |
| **Clean minimal** | Home hero, About, Resume, overall spacing | Generous whitespace, strong type hierarchy, restraint. Recruiter-friendly. |
| **Editorial case study** | `/projects/[slug]` and `/work/[slug]` | Serif display headings, long-form reading measure, large evidence images with captions, pull-quote "result" callouts. |

### 4.1 Tokens

Define as CSS variables in `src/styles/tokens.css`; map into Tailwind v4 `@theme`. Verify every text/background
pair meets WCAG AA (4.5:1 body, 3:1 large text and UI components). Adjust values if a check fails; do not
weaken the requirement.

Dark theme (default, "control panel"):

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0B0F14` | Page |
| `--surface` | `#11161D` | Cards, sidebar |
| `--surface-2` | `#161C24` | Table headers, code |
| `--border` | `#232B36` | Hairlines |
| `--text` | `#E6EDF3` | Body |
| `--text-muted` | `#9AA4AF` | Secondary |
| `--accent` | `#58A6FF` | Links, focus, primary actions (same blue as his GitHub README) |
| `--pass` | `#3FB950` | Pass / done |
| `--warn` | `#D29922` | Warn / moderate |
| `--fail` | `#F85149` | Fail / critical |
| `--focus-ring` | `#58A6FF` | 2px outline + 2px offset |

Light theme ("clean"):

| Token | Value |
| --- | --- |
| `--bg` | `#FAFAF7` |
| `--surface` | `#FFFFFF` |
| `--surface-2` | `#F2F2EE` |
| `--border` | `#E3E3DE` |
| `--text` | `#111418` |
| `--text-muted` | `#555D66` |
| `--accent` | `#0B5FD8` |
| `--pass` | `#1A7F37` |
| `--warn` | `#9A6700` |
| `--fail` | `#CF222E` |
| `--focus-ring` | `#0B5FD8` |

Typography:

| Role | Font | Size (mobile / desktop) |
| --- | --- | --- |
| Display (hero name, case study title) | Instrument Serif 400 | 40 / 64px, line-height 1.05 |
| H2 | IBM Plex Sans 600 | 24 / 30px |
| H3 | IBM Plex Sans 600 | 18 / 20px |
| Body | IBM Plex Sans 400 | 16 / 17px, line-height 1.6, measure 68ch max |
| Labels, chips, metrics, table data, code | IBM Plex Mono 500 | 12–14px, uppercase tracking 0.04em for labels |

Spacing: 4px base scale. Radius: 6px (cards), 4px (chips), 999px (status dots). Shadows: none in dark; one
subtle shadow level in light.

### 4.2 Status and severity language

Never rely on colour alone. Every status chip has a text label and an icon.

| State | Label | Colour token |
| --- | --- | --- |
| Pass / Done | `PASS` / `DONE` | `--pass` |
| Warning / Moderate / Medium | `WARN` / `MODERATE` / `MEDIUM` | `--warn` |
| Fail / Critical / Serious / High | `FAIL` / `CRITICAL` / `SERIOUS` / `HIGH` | `--fail` |
| Low / Info | `LOW` / `INFO` | `--text-muted` |
| In progress | `RUNNING` | `--accent` |

### 4.3 Layout shell

Desktop (>= 1024px): fixed left sidebar 280px wide, content column max 1100px with 48px gutters.
Tablet (640–1023px): collapsible sidebar (icon rail 72px, expands on demand) or drawer — pick whichever passes
the keyboard tests more cleanly; document the choice.
Mobile (< 640px): 56px top bar (monogram, name, menu button) + full-height drawer; 16px side gutters.

Sidebar contents, top to bottom:

1. Monogram `VJ` + full name + role line ("Software QA/QC Engineer · path to SDET")
2. Availability line, only if `profile.openToWork` is set (e.g. status dot + "Open to QA/SDET roles")
3. Nav: Overview · Projects · Client Work · Skills · About · Resume · Quality · Contact
   (Client Work hidden if no case study is approved)
4. Theme toggle (labelled button, `aria-pressed`)
5. Links: GitHub, LinkedIn (if set), Email — icon + visible text label
6. Footer chip: "Site checks: PASS" linking to `/quality` (value from CI-generated `quality.json`, Section 12.6)

Active nav item uses `aria-current="page"` plus a visible indicator that is not colour-only.

### 4.4 Signature concept — "The Site Under Test"

The portfolio is presented as a system under test, and Vincent is the person who tested it. Four signature
features carry this. They are what make the site unique; build them with the same care as the core pages.

#### A. Sidebar as test explorer

The sidebar (4.3) is styled like a test runner's explorer (think Playwright UI mode / an IDE test tree):

- Header block: `portfolio.spec` with a run summary line, e.g. "9 passed · 0 failed · last run 2026-10-24"
  — values come from `quality.json` (real CI results, Section 12.6), never hard-coded.
- Each nav item is a row: status dot (PASS/FAIL from that route's E2E + axe results in `quality.json`), the page
  name, and a muted mono "spec file" label (`overview.spec`, `projects/`, `work.spec`...) plus that route's real
  E2E duration (e.g. `1.2s`).
- `Projects` is an expandable folder (disclosure button with `aria-expanded`) listing each project as a child
  spec.
- Accessibility: it is still a `<nav>` with nested lists of links. The accessible name of each link is the page
  name ("Overview"); the spec-file label and duration are `aria-hidden` decoration, so visible label and
  accessible name match (SC 2.5.3). Status is also exposed as text (visually hidden "passing").
- If `quality.json` is missing (first build), status dots render as neutral "not run" — never fake a PASS.

#### B. Run the suite on this page

A "Run tests on this page" button (in the sidebar footer and on `/quality`) runs real checks against the page the
visitor is currently viewing, in their browser, and streams results like a test runner.

- Panel: a dialog or bottom sheet styled as runner output (mono, one line per check, PASS/FAIL/WARN chip, time
  per check, summary at the end: "6 passed, 0 failed in 1.8s"). Results are announced via `aria-live="polite"`
  (summary only, not every line). Focus moves to the panel and returns to the trigger on close.
- Checks (all genuine, no scripted outcomes):
  1. Accessibility: `axe-core` scan of the current DOM with tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`;
     lists violations by rule and impact if any
  2. Document structure: exactly one `<h1>`, no skipped heading levels, `<main>` landmark, `lang` set
  3. Images: every `<img>` has an `alt` attribute
  4. Links: every same-origin link on the page resolves (HEAD request, status < 400), external links listed
     but not requested
  5. Security headers: `fetch(location.href, { method: 'HEAD' })` and check the headers from Section 10
  6. Performance: navigation timing (TTFB, DOMContentLoaded, load) and LCP / CLS from `PerformanceObserver`,
     compared to the budgets in 12.5
- `axe-core` and the runner are loaded with a dynamic `import()` on click only, so they never count against the
  initial JS budget.
- Copy under the summary, in Vincent's voice: automated checks catch only part of what matters — then link to
  Bug Hunt mode ("The suite passed. There are still bugs a scanner can't see. Want to find them?"). This
  mirrors his real finding: axe reported 0 on SauceDemo, his keyboard audit found 7.
- If a check genuinely fails in production, the panel shows the failure honestly. That is a bug for Vincent to
  fix, not something to hide.

#### C. Bug Hunt mode

An opt-in game that shows Vincent's QA mindset and bug-report writing.

- Toggle: "Bug Hunt" switch in the sidebar (and `?bughunt=1`). Off by default. Persist per viewer in
  `localStorage` wrapped in try/catch; the site works fully without storage.
- When on: a banner states "Bug Hunt mode: 5 bugs are planted on this site. Find them." with a "Turn off" button,
  and the sidebar shows a counter "Bugs found 0/5".
- Five planted bugs, defined in `src/content/bug-hunt.ts`, spread across at least three routes. They must be
  harmless and must **not** create accessibility violations, broken navigation or misleading data outside the
  mode. Suggested set (Vincent may replace them):
  1. Typo in a section heading (e.g. a missing letter in "Accessibility")
  2. A metric whose parts don't add up to its displayed total (e.g. "91 UI + 17 API = 109")
  3. A timeline event dated in the future
  4. A card that is misaligned by a few pixels from the grid
  5. A button whose label says one thing and whose icon says another (e.g. "Download CV" with an external-link
     icon)
- Finding bugs, accessible to mouse, touch and keyboard: in hunt mode, many elements (headings, metrics, cards,
  timeline rows, buttons) become inspectable via an "Inspect" affordance, not just the buggy ones, so planted
  bugs aren't given away by focus order. Inspecting a clean element says "No defect here." Inspecting a planted
  bug opens a **defect ticket** written by Vincent: ID (`HUNT-01`...), title, severity, steps to reproduce,
  expected, actual, and the test that would catch it.
- A "Hints" list in the sidebar names the page each unfound bug is on.
- Finding all 5 shows a completion card: "5 of 5 found." with a short line from Vincent and an email CTA.
- Turning the mode off restores all true values immediately. Bug Hunt is never on for crawlers, OG images,
  Lighthouse, the print stylesheet or the `/resume` page.

#### D. Projects as test reports

Each `/projects/[slug]` page reads like an execution report, not a blog post (detailed in 7.3):

- A run-summary header (target, period, tools, findings by severity as counts of the listed findings, CI badge)
- Findings rendered as defect tickets (ID, title, severity, standard reference, steps to reproduce, expected vs
  actual, evidence image if any, "tracked by" test file, status such as "Pinned by test")
- Ticket details (repro steps, expected/actual, tracked-by file) are taken from each repo's public
  `docs/FINDINGS.md` and `docs/BUGS-FOUND.md`, quoted or closely paraphrased, with a link to the source section.
  Where a source gives no repro steps, omit that field rather than writing new ones.

The editorial look (serif headings, generous reading measure, large evidence with captions) still applies to the
narrative parts: context, approach, decisions and limits.

---

## 5. Routes / information architecture

| Route | Purpose | Data |
| --- | --- | --- |
| `/` | Overview: hero, proof metrics, featured projects, client work teaser, skills, timeline, contact CTA | all |
| `/projects` | All public projects, filterable by category | `projects` |
| `/projects/[slug]` | Editorial case study for one repo | `projects[slug]` |
| `/work` | BossLabs role + anonymized client case studies | `experience`, `caseStudies` (approved only) |
| `/work/[slug]` | One anonymized client case study | `caseStudies[slug]` |
| `/skills` | Skills matrix with evidence links | `skills` |
| `/about` | Bio, education, LegataLink, career path, QA method | `profile`, `education`, `projects.legatalink` |
| `/resume` | HTML resume (print-optimised) + PDF download | all |
| `/quality` | How this site is tested; latest CI results | `quality.json` |
| `/contact` | Email (mailto + copy button), GitHub, LinkedIn | `profile` |
| `/sitemap.xml`, `/robots.txt` | SEO | generated |
| `/opengraph-image` (per route) | Social cards | generated |
| 404 | Custom not-found with links back | — |

On the home page, sidebar nav items for sections that also exist as pages link to the pages (not anchors), so
every nav target is a real URL.

---

## 6. Content model (the "schema")

Location: `src/content/`. One file per collection. Types are inferred from Zod schemas in
`src/content/schema.ts`. Transcribe values **verbatim** from `docs/01-PORTFOLIO-DATA.md`.

```ts
// src/content/schema.ts
import { z } from 'zod';

export const Status = z.enum(['verified', 'confirm', 'todo', 'approval']);
// Only 'verified' values render. Anything else is hidden by the <Field> helper.

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const yearMonth = z.string().regex(/^\d{4}(-\d{2})?$/);

export const Link = z.object({ label: z.string(), href: z.url() });

export const Profile = z.object({
  fullName: z.string(),            // "Vincent Jerico Alcuran"
  displayName: z.string(),         // "Vincent Jerico"
  role: z.string(),                // "Software QA/QC Engineer"
  company: z.string(),             // "BossLabs.AI"
  headline: z.string(),            // "Software QA/QC Engineer on the path to SDET."
  oneLiner: z.string(),
  intro: z.string(),
  tagline: z.string(),
  goal: z.string(),                // "SDET"
  nextDirections: z.array(z.string()),
  location: z.string(),            // "Cavite, Philippines"
  email: z.email(),
  github: z.url(),
  linkedin: z.url().optional(),
  photo: z.string().optional(),    // "/images/profile/vincent-portrait.jpg"
  openToWork: z.string().optional(),
  cvPdf: z.string(),               // "/cv/Vincent-Jerico-Alcuran-CV.pdf" (generated, 7.7)
  siteUrl: z.url(),
});

export const Metric = z.object({
  id: z.string(),
  value: z.string(),               // display string, e.g. "108", "7 of 7", "12 s p95"
  label: z.string(),
  context: z.string().optional(),  // short qualifier shown under the label
  source: z.object({ label: z.string(), href: z.url() }),
  asOf: isoDate,
});

export const Severity = z.enum(['critical', 'serious', 'high', 'medium', 'moderate', 'low', 'info']);

export const Finding = z.object({
  id: z.string(),                  // "F-1", "S-6", "PERF-001"
  title: z.string(),
  reference: z.string().optional(),// "2.1.1 Keyboard (A)", "A05 Security Misconfiguration"
  severity: Severity,
  note: z.string().optional(),
  // Defect-ticket fields (signature feature D). Taken from the repo's FINDINGS.md / BUGS-FOUND.md only.
  steps: z.array(z.string()).optional(),
  expected: z.string().optional(),
  actual: z.string().optional(),
  trackedBy: z.string().optional(),     // "tests/juice-shop.headers.spec.ts"
  ticketStatus: z.string().optional(),  // "Pinned by test", "Report only"
  evidenceIndex: z.number().int().optional(), // index into project.evidence
  sourceHref: z.url(),                  // link to the exact FINDINGS.md section
});

// Bug Hunt mode (signature feature C)
export const PlantedBug = z.object({
  id: z.string(),                  // "HUNT-01"
  route: z.string(),               // "/", "/about", ...
  targetId: z.string(),            // stable data-hunt-id on the element
  hint: z.string(),                // "Somewhere on the Overview page"
  title: z.string(),
  severity: Severity,
  steps: z.array(z.string()),
  expected: z.string(),
  actual: z.string(),
  wouldBeCaughtBy: z.string(),     // e.g. "visual regression snapshot", "unit test on the totals helper"
});

export const Image = z.object({
  src: z.string(),                 // local path under /public/images/...
  alt: z.string().min(20),         // meaningful alt text required
  caption: z.string().optional(),
  width: z.number(),
  height: z.number(),
});

export const ProjectCategory = z.enum([
  'accessibility', 'security', 'performance', 'api', 'ui-automation', 'full-stack-testing', 'hub', 'capstone',
]);

export const Project = z.object({
  slug: z.string(),
  name: z.string(),
  category: ProjectCategory,
  featured: z.boolean(),
  order: z.number().int(),
  summary: z.string(),             // one sentence, card + meta description
  hook: z.string(),                // the headline result, shown as the editorial pull-quote
  repo: z.url().optional(),        // omit for private repos (e.g. LegataLink)
  liveUrl: z.url().optional(),
  team: z.boolean().default(false),// true = team project; show "Team project" in the run summary
  role: z.array(z.string()).default([]), // Vincent's own contribution, verbatim from CV when team: true
  ciBadge: z.url().optional(),     // GitHub Actions badge SVG
  ciUrl: z.url().optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  commits: z.number().int().optional(),
  target: z.string().optional(),   // "SauceDemo", "OWASP Juice Shop v18.0.0 (local Docker)"
  stack: z.array(z.string()),
  context: z.array(z.string()),    // paragraphs
  approach: z.array(z.string()),   // paragraphs or bullets
  findings: z.array(Finding).default([]),
  decisions: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
  limits: z.array(z.string()).default([]),
  evidence: z.array(Image).default([]),
  extraTables: z.array(z.object({
    title: z.string(), columns: z.array(z.string()), rows: z.array(z.array(z.string())),
  })).default([]),
  status: Status,
});

export const Experience = z.object({
  slug: z.string(),
  company: z.string(),             // "BossLabs.AI", "Rural Health Unit & Barangay Health Centers", ...
  companyDescription: z.string().optional(),
  location: z.string().optional(),
  title: z.string(),               // "Software QA/QC Engineer"
  start: yearMonth.or(isoDate),    // "2026-09-03", "2026-02"
  end: yearMonth.optional(),       // undefined = Present
  kind: z.enum(['job', 'internship', 'scholarship']),
  bullets: z.array(z.string()),
  hasCaseStudies: z.boolean().default(false), // true only for BossLabs
  status: Status,
});

export const Certification = z.object({
  name: z.string(),
  issuer: z.string(),              // "Fortinet", "DataCamp"
  date: z.string(),                // "2026-07", "2025-04", "2025-01/2025-04"
  credentialUrl: z.url().optional(),
});

export const CaseStudy = z.object({
  slug: z.string(),
  title: z.string(),               // anonymized, e.g. "Warehouse and operations platform"
  industry: z.string(),
  system: z.string(),
  period: z.string().optional(),
  activities: z.array(z.string()),
  outcomes: z.array(z.string()).default([]),
  method: z.array(z.string()).default([]),
  approved: z.boolean(),           // must be true to render anywhere
  status: Status,
});

export const SkillGroup = z.object({
  group: z.string(),
  skills: z.array(z.string()),
  evidence: z.array(z.object({ label: z.string(), href: z.string() })),
  learning: z.boolean().default(false),
});

export const TimelineEvent = z.object({
  date: z.string(),                // ISO date, year-month, year, or "Next"
  title: z.string(),
  kind: z.enum(['education', 'work', 'project', 'milestone', 'next']),
  href: z.string().optional(),
  status: Status,
});

export const Education = z.object({
  degree: z.string(),              // "Bachelor of Science in Information Technology"
  school: z.string(),              // "Cavite State University — Trece Martires City Campus"
  graduated: yearMonth,            // "2026-08"
  gpa: z.string().optional(),      // "1.80 (Philippine scale, 1.00 highest)" — resume page only
  honors: z.array(z.string()).default([]),     // ["Dean's Lister"]
  coursework: z.array(z.string()).default([]),
  capstoneSlug: z.string().optional(),         // "legatalink"
  status: Status,
});
```

Content files:

```
src/content/
├── schema.ts
├── profile.ts        # Profile
├── metrics.ts        # Metric[]  (data file Section 2 only)
├── projects.ts       # Project[] (data file Section 3)
├── experience.ts     # Experience[] (data file Section 4: BossLabs, internship, DataCamp scholarship)
├── case-studies.ts   # CaseStudy[] (data file Section 5), approved: true, anonymous (approved 2026-10-24)
├── skills.ts         # SkillGroup[] (data file Section 6)
├── certifications.ts # Certification[] (data file Section 8)
├── timeline.ts       # TimelineEvent[] (data file Section 9)
├── education.ts      # Education[]
├── bug-hunt.ts       # PlantedBug[] — exactly 5, on at least 3 routes
└── index.ts          # parses everything with Zod at import; throws on invalid data
```

Rendering rule helpers (`src/lib/content.ts`):

- `visible<T extends { status: Status }>(items)` returns only `status === 'verified'`
- `approvedCaseStudies()` returns only `approved && status === 'verified'`
- Optional fields that are `undefined` render nothing (no empty labels, no dangling separators)

---

## 7. Page specifications

### 7.1 `/` Overview

1. **Hero** (clean minimal + runner): display name in Instrument Serif, headline, intro paragraph, three actions:
   "View projects" (primary), "Download CV" (the generated PDF, 7.7), "Email me" (mailto). Beside it (below on
   mobile), a short runner-output block that types in once on first load (static under reduced motion):
   a command line such as `$ npx playwright test --project=vincent` followed by 4–6 result lines built only
   from verified metrics (e.g. `PASS  accessibility-testing  7 WCAG failures found where axe reported 0`).
   The block is `aria-hidden` with the same facts available as normal text in the metrics strip below.
   Photo: `public/images/profile/vincent-portrait.jpg` (copy from `assets-inbox/profile/`, 510x680, 3:4), shown
   small inside the hero (max 240px wide) and as the sidebar avatar (rounded, `object-position: 50% 35%`). Never
   full-width; never upscaled past its native size. Alt text: "Vincent Jerico Alcuran".
2. **Run summary strip** (control panel): metrics from `metrics.ts` styled as a test-run summary. Each metric
   shows value, label, context and a source link (small mono "source" link). Caption: "As of {asOf}".
   Under it, one line linking to signature features B and C: "Run tests on this page" and "Try Bug Hunt".
3. **Featured projects** grid: cards styled as "suites" — mono category chip, name, one-line summary, the hook in
   bold, stack chips (max 4 + "+n"), live CI badge, links to case study and repo. 1 column mobile, 2 tablet,
   3 desktop.
4. **Client work teaser** (only if any approved case study): role card + up to 3 anonymized cards.
5. **How I test**: the client QA checklist areas (data file 5.4) as a compact grid, linking to `/about#method`.
6. **Skills snapshot**: groups as rows of chips; "learning" chips visually distinct (outlined + label "learning").
7. **Timeline** (latest 6 events) linking to `/about#timeline`.
8. **Contact CTA**: one sentence + email button + copy-to-clipboard.

### 7.2 `/projects`

- Filter bar (buttons with `aria-pressed`, keyboard operable, synced to `?category=` query param, works with
  JS disabled by showing all).
- Card grid as on home, all projects, ordered by `order`.
- Result count announced via `aria-live="polite"` when filters change.

### 7.3 `/projects/[slug]` test report (signature feature D)

Order:

1. Breadcrumb (Projects / name)
2. Report label in mono ("TEST REPORT"), title (serif display), summary
3. **Run summary panel** (control panel): target · period · commits · tools · findings by severity (counts of the
   listed findings, as severity chips) · links (Repo, Live if any) · live CI badge
4. **Result callout** (pull-quote) with the `hook`
5. Context
6. Approach
7. **Findings as defect tickets**, if any: a compact index table first (ID · issue · reference · severity chip),
   then one ticket per finding (ID, title, severity, reference, steps to reproduce, expected, actual, evidence,
   tracked-by test file, status, source link). Tickets are collapsible (`<details>`/disclosure). Tables scroll
   horizontally inside their own container on mobile (`role="region"`, `aria-label`, `tabindex="0"`), never the
   page.
8. Engineering decisions (title + body cards)
9. Extra tables (e.g. test types, seed-and-catch results, area status)
10. Evidence gallery (`next/image`, captions, click to open full-size in an accessible dialog with focus trap,
    Esc to close and focus return)
11. Limits / what I'd do next
12. Prev / next project links

### 7.4 `/work` and `/work/[slug]`

- Role card: company, description, title, dates (hidden until provided), responsibilities.
- Confidentiality note: "Client names, data and screenshots are withheld. Details shared with BossLabs.AI
  approval."
- Case study page: title, industry, system, period, what Vincent did, outcomes, method. No images.
- If no case study is approved: `/work` shows the role card only; `/work/[slug]` returns 404.

### 7.5 `/skills`

Matrix: group, skills, evidence links to the repos/sections that prove them. Learning items in their own
labelled group. No percentage bars, star ratings or "years of experience" numbers.

### 7.6 `/about`

- Bio (2–3 short paragraphs from data file; no invented personal details)
- Career path: IT Support Intern -> Software QA/QC Engineer -> SDET -> Cybersecurity / Cloud Engineering (simple
  horizontal stepper, vertical on mobile; first two marked done, the rest "next")
- Education: degree, school, graduated August 2026, Dean's Lister, relevant coursework
- Earlier experience: IT Support internship and DataCamp scholarship (GDG PUP Manila), brief
- Certifications list
- Capstone: LegataLink card linking to `/projects/legatalink`
- `#method`: the client QA checklist areas
- `#timeline`: full timeline

### 7.7 `/resume`

- HTML resume built from content: summary, experience (BossLabs first, then internship, then scholarship),
  selected projects (the 7 QA repos in one line each + LegataLink), skills, education (with GPA and scale note),
  certifications
- "Download PDF" button for `/cv/Vincent-Jerico-Alcuran-CV.pdf`
- The PDF is **generated from `/resume` at build time**, not uploaded: a script
  (`scripts/build-cv-pdf.ts`) starts the production server, opens `/resume` in Playwright Chromium with print
  media, and calls `page.pdf()` (A4, print backgrounds off) into `public/cv/`. Run it in CI after `build` and before
  deploy, and locally with `pnpm cv`. This keeps the PDF in sync with the site.
- Vincent's existing CV PDFs are never served: they include his phone number and omit the BossLabs role.
- Print stylesheet: single column, black on white, no sidebar, no Bug Hunt, URLs printed after links, fits on 2
  A4 pages

### 7.8 `/quality`

Public proof the site is tested. Renders `src/generated/quality.json` (written by CI, committed by a bot or
fetched at build — see 12.6):

- Last run date, commit SHA (short), overall status
- Table: Gate · Tool · Result · Details (lint, format, typecheck, unit, E2E, axe per route x theme, Lighthouse
  scores per route, security headers, link check)
- A short explanation of each gate and its self-test, in Vincent's voice ("A gate that can't fail isn't a gate")
- Link to the GitHub Actions run

### 7.9 `/contact`

- Email address as text + mailto button + "Copy email" button with a visible and announced confirmation
- GitHub and LinkedIn links
- No contact form in v1 (see Phase 7)

### 7.10 404

Short message, links to Overview and Projects, search-free.

---

## 8. Components

`src/components/`:

- `layout/Sidebar.tsx`, `layout/MobileTopBar.tsx`, `layout/Drawer.tsx`, `layout/SkipLink.tsx`
- `ui/StatusChip.tsx`, `ui/SeverityChip.tsx`, `ui/MetricTile.tsx`, `ui/Card.tsx`, `ui/Button.tsx`,
  `ui/CopyButton.tsx`, `ui/ThemeToggle.tsx`, `ui/CiBadge.tsx`, `ui/ExternalLink.tsx` (adds visually hidden
  "opens in new tab" only when `target=_blank` is used; prefer same-tab)
- `content/ProjectCard.tsx`, `content/FindingsTable.tsx`, `content/DataTable.tsx`,
  `content/DecisionList.tsx`, `content/EvidenceGallery.tsx`, `content/ImageDialog.tsx`,
  `content/Timeline.tsx`, `content/SkillMatrix.tsx`, `content/CaseStudyCard.tsx`, `content/ResultCallout.tsx`
- `seo/JsonLd.tsx`
- Signature features: `explorer/TestExplorerNav.tsx` (A), `runner/RunSuiteButton.tsx` +
  `runner/RunnerPanel.tsx` + `runner/checks/*.ts` (B, dynamically imported), `bughunt/BugHuntProvider.tsx` +
  `bughunt/BugHuntToggle.tsx` + `bughunt/Inspectable.tsx` + `bughunt/DefectTicket.tsx` +
  `bughunt/HuntBanner.tsx` (C), `content/DefectTicket.tsx` + `content/RunSummaryPanel.tsx` (D),
  `content/RunnerHeroBlock.tsx`

All interactive components: semantic HTML first (`<button>`, `<a>`, `<dialog>` or equivalent), visible focus,
keyboard operable, state exposed via ARIA (`aria-expanded`, `aria-pressed`, `aria-current`, `aria-controls`).

CI badges: plain `<img>` with explicit `width`/`height` and alt like "CI status for accessibility-testing".
Do not route SVG badges through `next/image`.

---

## 9. SEO and metadata

- `metadata` per route: title template `"%s · Vincent Jerico Alcuran"`, default title
  `"Vincent Jerico Alcuran · Software QA/QC Engineer on the path to SDET"`, description from `profile.oneLiner` or the
  project summary.
- Canonical URLs from `NEXT_PUBLIC_SITE_URL`.
- OG + Twitter images generated with `next/og`: dark control-panel style, name, page title, one metric or hook.
  No emojis, no client info.
- `sitemap.ts` (all public routes; excludes unapproved case studies), `robots.ts` (allow all, link sitemap).
- JSON-LD `Person` on `/` (name, jobTitle, worksFor, url, sameAs GitHub/LinkedIn, alumniOf when year verified)
  and `CreativeWork`/`SoftwareSourceCode` on project pages with `codeRepository`.
- `lang="en"` on `<html>`.
- Favicon + apple-touch-icon from the `VJ` monogram (SVG source in `public/`).

---

## 10. Security headers

Set in `next.config.ts` `headers()` for all routes. These are tested in CI (12.4), the same way his
security-testing repo checks Juice Shop.

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' data: https://github.com https://img.shields.io https://avatars.githubusercontent.com; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' mailto:; object-src 'none'; upgrade-insecure-requests` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Cross-Origin-Opener-Policy` | `same-origin` |

Adjust CSP only as needed for what's actually used (verify analytics endpoints against current Vercel docs at
build time); if `'unsafe-inline'` for scripts can be replaced with nonces without breaking static generation,
do it and document the decision. No `Access-Control-Allow-Origin: *`. Error pages never show stack traces in
production.

---

## 11. Environment variables

`.env.example` (committed) and `.env.local` (git-ignored):

| Variable | Required | Scope | Example / notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Build + runtime | `https://vincentjerico.dev` (or the Vercel URL until a domain is bought) |
| `VERCEL_TOKEN` | Local CLI / CI deploy only | `.env.cli` (git-ignored), never app code | Personal Vercel account token (not a team/work scope), created at vercel.com/account/tokens. Loaded by `dotenv -e .env.cli` in the npm scripts. Never commit, never echo. |
| `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | Yes, once linked | `.env.cli` locally; CI secrets if deploying from Actions | From `.vercel/project.json` after `pnpm vercel:link` |
| `LHCI_GITHUB_APP_TOKEN` | Optional | CI secret | Lighthouse CI status checks on PRs |
| `RESEND_API_KEY` | Phase 7 only | Server | Contact form email delivery |
| `CONTACT_TO_EMAIL` | Phase 7 only | Server | `vincentjericoalcuran@gmail.com` |

Build must fail with a clear message if `NEXT_PUBLIC_SITE_URL` is missing or not a valid URL (validate with
Zod in `src/lib/env.ts`).

---

## 12. Quality gates (the SDET showcase)

### 12.1 Static gates

- `pnpm lint` (ESLint, zero warnings allowed in CI: `--max-warnings=0`)
- `pnpm format:check` (Prettier)
- `pnpm typecheck` (`tsc --noEmit`)
- `pnpm build`

### 12.2 Unit (Vitest)

- Every content file parses with its Zod schema
- `visible()` hides non-verified items; `approvedCaseStudies()` hides unapproved ones
- No content string contains: `TODO`, `lorem`, `CONFIRM`, `APPROVAL`, or any emoji (regex over all
  rendered string fields)
- Guard list: no string in content or rendered HTML contains any client name from a private deny-list file
  (`tests/fixtures/client-denylist.txt`, git-ignored; CI reads it from a repository secret)
- **Self-test**: a fixture with a planted TODO, emoji and unapproved case study must make each check fail

### 12.3 E2E + accessibility (Playwright, Chromium + WebKit + mobile Chrome)

Per route, in both themes:

- Page loads with 200, has exactly one `<h1>`, a `<main>` landmark, a skip link that moves focus to `<main>`
- axe-core scan with tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa` returns 0 violations; attach axe JSON to
  the report (reuse the `expectNoViolations()` pattern from his accessibility-testing repo)
- No horizontal overflow at 320, 375, 768, 1024, 1440, 2560 px (`document.documentElement.scrollWidth <=
  innerWidth`)
- No console errors

Keyboard and focus regression tests, written to prevent the exact defects Vincent documented in SauceDemo:

| Guard | Prevents (his finding) |
| --- | --- |
| Every nav link, button, filter, theme toggle, CV link and copy button is reachable by Tab and activates with Enter/Space | F-1 Keyboard (2.1.1) |
| Focused element always shows a visible focus indicator (computed outline/box-shadow differs from unfocused) | F-2 Focus Visible (2.4.7) |
| Mobile menu button exposes `aria-expanded` true/false matching drawer state | F-3 Name, Role, Value (4.1.2) |
| Closing the drawer (Esc, close button, link click) returns focus to the menu button, never `<body>` | F-4 Focus Order (2.4.3) |
| Every page has a real heading structure (h1 then h2s, no skipped levels) | F-5 Info & Relationships (1.3.1) |
| Any input has a visible `<label>` (no placeholder-only labels) | F-6 Labels or Instructions (3.3.2) |
| While the drawer or image dialog is open, focus is trapped inside and no focused element is obscured (port `isFocusEntirelyObscured()`) | F-7 Focus Not Obscured (2.4.11) |

Plus: theme toggle persists across reload; `prefers-reduced-motion` disables transitions; all internal links
resolve (crawl from `/`); `/work/[slug]` for an unapproved case study returns 404; CV download returns a PDF whose extracted text contains the name and email and does **not** contain
any phone number pattern (`/(\+63|0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}/`) or the postal code.

Signature feature tests:

- **Test explorer (A):** nav is a `<nav>` with nested lists; Projects folder toggles `aria-expanded`; every row's
  accessible name equals its visible page name; with `quality.json` absent, dots show "not run", never PASS.
- **Run the suite (B):** clicking the button loads the runner (assert the axe chunk is not requested before
  the click), runs all 6 checks and reports a summary on every route; focus moves into the panel and back to the
  trigger on close; summary is announced in an `aria-live` region. Self-test: run the runner on the self-test
  page and assert it reports the planted failures (proves the in-browser checks can fail).
- **Bug Hunt (C):** off by default and absent on first load, for crawlers (no JS), on `/resume` and in print;
  `?bughunt=1` turns it on; all 5 planted bugs can be found by keyboard alone; clean elements report "No defect
  here"; counter reaches 5/5 and shows the completion card; turning it off restores every true value (assert the
  DOM text of each planted element matches its verified value); axe reports 0 violations with Bug Hunt on;
  works with `localStorage` blocked.
- **Test reports (D):** each finding with `sourceHref` links to a section that exists (link check); severity
  counts in the run summary equal the number of rendered tickets per severity.

**Self-test**: a test page (only built when `NODE_ENV=test` / `E2E_SELFTEST=1`) with a planted contrast failure
and a focus trap bug must make the a11y suite fail, proving the gate isn't vacuous.

### 12.4 Security header checks (Playwright request API)

For `/` and one project page: each header in Section 10 is present with the expected value; no
`Access-Control-Allow-Origin: *`; requesting a non-existent route returns the custom 404 with no stack trace.
Self-test: a helper fed a non-compliant header set must report each defect.

### 12.5 Lighthouse CI

`lighthouserc.json` runs against `pnpm start` for `/`, `/projects`, one `/projects/[slug]`, `/about`,
`/resume`, mobile preset, 3 runs, median. Assertions: performance >= 0.95, accessibility = 1, best-practices
>= 0.95, seo = 1. Also budgets: total JS on `/` <= 120 KB gzipped, LCP <= 2.0 s, CLS <= 0.05, TBT <= 150 ms
(simulated mobile).

### 12.6 CI pipeline (`.github/workflows/ci.yml`)

Jobs on every push and PR:

1. `static` — install, lint, format check, typecheck, unit tests
2. `build` — `pnpm build` (needs static), uploads `.next` artifact
3. `e2e` — matrix: chromium, webkit, mobile-chrome; runs against `pnpm start`; uploads HTML report
4. `lighthouse` — LHCI against the build
5. `links` — lychee on built HTML (also weekly on schedule). Exclude `legatalink.free.nf` in `lychee.toml`: its
   free host serves a browser check to bots, so it fails automated checks while working for people. Note the
   exclusion and the reason on `/quality`.
6. `quality-report` — on `main` only: aggregates job results into `src/generated/quality.json`
   (gate, tool, result, details, run URL, commit, date, plus per-route E2E + axe status and duration for the
   test-explorer sidebar) and commits it with a bot commit `chore(quality): update
   report [skip ci]`, so `/quality` shows the latest real results on the next deploy

Retries: `retries: 2` in CI for traces, with `failOnFlakyTests: true` (same policy as his framework template).

Dependabot for npm and GitHub Actions, weekly.

---

## 13. Project structure

```
Portfolio/
├── docs/
│   ├── 01-PORTFOLIO-DATA.md
│   ├── 02-ASSETS-CHECKLIST.md
│   └── 03-MASTER-PROMPT.md
├── public/
│   ├── images/projects/<slug>/...      # evidence images copied from his repos
│   ├── images/profile/                 # headshot
│   ├── cv/Vincent-Jerico-Alcuran-CV.pdf
│   └── icon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx  page.tsx  not-found.tsx  globals.css
│   │   ├── projects/page.tsx  projects/[slug]/page.tsx
│   │   ├── work/page.tsx  work/[slug]/page.tsx
│   │   ├── skills/page.tsx  about/page.tsx  resume/page.tsx  quality/page.tsx  contact/page.tsx
│   │   ├── opengraph-image.tsx  sitemap.ts  robots.ts
│   ├── components/  (Section 8)
│   ├── content/     (Section 6)
│   ├── generated/quality.json
│   ├── lib/  content.ts  env.ts  format.ts
│   └── styles/tokens.css
├── tests/
│   ├── unit/  e2e/  a11y/  security/  selftest/  fixtures/
├── .github/workflows/ci.yml  .github/dependabot.yml
├── lighthouserc.json  playwright.config.ts  vitest.config.ts
├── eslint.config.mjs  .prettierrc  .editorconfig  .node-version  .env.example
├── AGENTS.md / CLAUDE.md     # short operating rules: data integrity, no emojis, run gates before done
├── README.md                 # what it is, stack, how to run, quality gates, CI badge
└── LICENSE                   # MIT for code; state that content and images are all rights reserved
```

Note: `create-next-app` accepts a folder that already contains `docs/`. Scaffold in place.

---

## 14. Phased checklist

Each phase ends with its Definition of Done shown to Vincent. Do not start the next phase without his go-ahead.

### Phase 0 — Pre-flight

- [ ] Confirm Node 22 and pnpm installed (`node -v`, `pnpm -v`)
- [ ] Confirm `gh auth status` shows the **VincentJerico** account as active (not a work account), and set this
      repo's git identity locally: `git config user.name` / `git config user.email` (an email on the VincentJerico
      GitHub account), so commits are attributed to his personal profile
- [ ] Confirm the Vercel CLI is installed (`vercel --version`). Never run `vercel login`; auth is token-based per
      repo (set up in Phase 1, after scaffolding, following the `supabase-vercel-cli-auth` skill)
- [ ] Before the first commit, add to `.gitignore`: `docs/*.pdf` (Vincent's private CVs, which contain his phone
      number) and `assets-inbox/` (raw supplied images; the build copies what it needs into `public/`). Verify with
      `git status` that no PDF from `docs/` is staged
- [ ] `git init`, create public GitHub repo `VincentJerico/portfolio` (ask Vincent for the repo name first)
- [ ] Read `docs/02-ASSETS-CHECKLIST.md`; list which assets are present and which are missing
- [ ] Ask Vincent for any remaining gaps in data file Section 10 he can answer now

DoD: tooling versions printed; repo created; list of missing assets and unresolved items shown.

### Phase 1 — Scaffold and foundations

- [ ] `pnpm create next-app@latest .` with TypeScript, ESLint, Tailwind, App Router, `src/` dir, import alias `@/*`
- [ ] Token-based Vercel CLI setup per the `supabase-vercel-cli-auth` skill (Vercel only, no Supabase):
      `.env.cli.example` with empty `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`; add `.env.cli` and `.vercel/`
      to `.gitignore`; add `dotenv-cli` as a devDependency and scripts `vercel:link`
      (`dotenv -e .env.cli -- vercel link --yes --token $VERCEL_TOKEN`), `deploy:preview`
      (`dotenv -e .env.cli -- vercel deploy --token $VERCEL_TOKEN`) and `deploy`
      (`dotenv -e .env.cli -- vercel deploy --prod --token $VERCEL_TOKEN`); add the skill's CLAUDE.md block (account:
      Vincent's personal Vercel account; auth failure means stop and ask, never `vercel login`). Then ask Vincent
      to paste his token into `.env.cli` and verify with `pnpm dotenv -e .env.cli -- vercel whoami --token
      $VERCEL_TOKEN` (check for his username, never print the token)
- [ ] Strict TS config; Prettier; ESLint flat config incl. `eslint-plugin-playwright`; `.editorconfig`;
      `.node-version` = 22
- [ ] Tokens (`tokens.css`) for both themes; Tailwind v4 `@theme` mapping; fonts via `next/font`
- [ ] `next-themes` with dark default, no flash of wrong theme
- [ ] Layout shell: Sidebar (desktop), MobileTopBar + Drawer (mobile), SkipLink, `<main>` landmark
- [ ] Placeholder routes for every page in Section 5 (each with a real `<h1>`)
- [ ] Custom 404
- [ ] `src/lib/env.ts` validation
- [ ] CI with `static` and `build` jobs green

DoD: site runs locally; sidebar/drawer keyboard-operable; both themes render; contrast of all token pairs
verified and listed; CI green.

### Phase 2 — Content layer

- [ ] `schema.ts` exactly as Section 6 (extend only if needed, and document why)
- [ ] Transcribe all content verbatim from `docs/01-PORTFOLIO-DATA.md`; set `status` from the data file's
      markers; all three case studies `approved: true` (anonymous)
- [ ] Copy `assets-inbox/legatalink/home-hero.png` to `public/images/projects/legatalink/` (alt text: the
      LegataLink home page with the "Where Every Stay Becomes a Story." hero over the resort's pool slides)
- [ ] Copy evidence images from his public repos into `public/images/projects/<slug>/` with real dimensions and
      descriptive alt text (accessibility-testing x3, performance-testing x1, taskflow-under-test x1)
- [ ] `src/lib/content.ts` helpers
- [ ] Unit tests from 12.2 including self-tests

DoD: `pnpm test` green; a printed table of every content field marked non-verified (what's hidden and why);
zero invented values (spot-check 10 random values against the data file and show the comparison).

### Phase 3 — Pages and components

- [ ] Build every page per Section 7 and components per Section 8 (use ui-ux-pro-max for layout and visual
      polish; keep to the tokens)
- [ ] Projects filter with query-param sync and `aria-live` count
- [ ] Evidence gallery + accessible image dialog
- [ ] Resume page + print stylesheet
- [ ] Contact copy button with announced confirmation
- [ ] Responsive pass at 320, 375, 768, 1024, 1440, 2560

DoD: screenshots of `/`, `/projects`, one project page, `/about`, `/resume` at 375 and 1440 in both themes;
manual keyboard walk-through notes; no hidden-field leaks.

### Phase 3b — Signature features (Section 4.4)

- [ ] A: Test explorer sidebar, reading `quality.json` (use a committed sample marked `"sample": true` that renders
      as "not run" until CI writes real data)
- [ ] D: Test-report project pages; transcribe ticket fields from each repo's `docs/FINDINGS.md` /
      `docs/BUGS-FOUND.md` with `sourceHref` per finding
- [ ] B: Run-the-suite runner with all 6 checks, dynamically imported
- [ ] C: Bug Hunt mode — build the 5 suggested planted bugs (approved by Vincent 2026-10-24) with their defect
      tickets
- [ ] Hero runner block

DoD: a short screen recording or screenshot sequence of each feature on mobile and desktop; runner output from 3
routes pasted; Bug Hunt played to 5/5 using keyboard only; initial JS on `/` still within budget.

### Phase 4 — SEO, metadata, headers, analytics

- [ ] Metadata per route, canonical URLs
- [ ] OG images per route via `next/og`
- [ ] `sitemap.ts`, `robots.ts`, JSON-LD
- [ ] Security headers (Section 10)
- [ ] Vercel Analytics + Speed Insights

DoD: OG images previewed for 3 routes; headers verified with `curl -I` against `pnpm start`; sitemap excludes
unapproved routes.

### Phase 5 — Quality gates

- [ ] Playwright config (chromium, webkit, mobile-chrome; retries 2; `failOnFlakyTests`)
- [ ] E2E, a11y and keyboard tests from 12.3, security-header tests from 12.4, with self-tests
- [ ] Lighthouse CI config and budgets (12.5)
- [ ] lychee link check
- [ ] Full CI pipeline (12.6) including `quality.json` generation
- [ ] `/quality` page wired to `quality.json`
- [ ] Dependabot

DoD: CI fully green on a PR; each self-test shown failing as expected (paste the failing output);
Lighthouse scores table for each audited route.

### Phase 6 — Deploy

- [ ] `pnpm vercel:link` (token auth via `.env.cli`), set `NEXT_PUBLIC_SITE_URL` in Vercel for Preview and Production
- [ ] Preview deploy from a PR; run Lighthouse against the preview URL
- [ ] Production deploy from `main`
- [ ] Custom domain (if Vincent bought one), HTTPS, `www` redirect
- [ ] Update `NEXT_PUBLIC_SITE_URL` to final domain; re-deploy
- [ ] Remind Vincent to: set GitHub profile website field, add the portfolio link to the profile README and
      LinkedIn, and fix the GitHub inconsistencies in data file Section 12

DoD: production URL loads; `/quality` shows the latest run; Lighthouse on production meets budgets.

### Phase 7 — Optional enhancements (only on request)

- Contact form via Resend server action (honeypot field, server-side Zod validation, rate limit per IP,
  visible labels, success/error states announced, no stored messages)
- Command palette (Cmd/Ctrl+K) for navigation, fully keyboard accessible
- `/notes` for short QA write-ups (MDX)
- Live GitHub data at build time (last commit date, topics) with daily revalidation

---

## 15. Global Definition of Done

The site is done when all of these are true:

- [ ] Every rendered fact traces to a `VERIFIED` entry in `docs/01-PORTFOLIO-DATA.md`
- [ ] No `TODO`, placeholder, lorem ipsum or emoji anywhere in the built HTML
- [ ] No client-identifying information anywhere (built HTML, metadata, images, OG images, sitemap)
- [ ] Sidebar navigation on desktop, drawer on mobile, both fully keyboard operable
- [ ] No horizontal scroll from 320px to 2560px
- [ ] axe-core: 0 WCAG violations on every route, both themes
- [ ] Keyboard regression guards (12.3) pass
- [ ] Lighthouse budgets met on every audited route (mobile)
- [ ] Security headers present and tested
- [ ] All four signature features work on mobile and desktop, by mouse, touch and keyboard, and pass their tests
- [ ] Bug Hunt is off by default and never alters what crawlers, Lighthouse, OG images, print or `/resume` see
- [ ] All CI jobs green on `main`; every gate's self-test proven to fail
- [ ] `/quality` shows real, current results
- [ ] README explains the project, how to run it, and the gates
- [ ] Deployed to production on Vercel with the correct `NEXT_PUBLIC_SITE_URL`

---

## 16. Decisions made and remaining gaps

Resolved on 2026-10-24:

- Title: Software QA/QC Engineer at BossLabs.AI, since 2026-09-03
- Graduated: August 2026, BS Information Technology, Cavite State University — Trece Martires City Campus
- LegataLink: live at https://legatalink.free.nf/; repo is private on a teammate's account, so no repo link
- CV: received (two versions); used as a data source only, never served (phone number)
- Bug Hunt: the 5 suggested planted bugs are approved
- Client case studies: approved to publish anonymously

Remaining gaps (none block the build; each field stays hidden until filled) — see data file Section 10:
LinkedIn URL, headshot, more LegataLink screens, certification credential URLs, the 13th QA checklist area,
domain and repo name, spoken languages.
