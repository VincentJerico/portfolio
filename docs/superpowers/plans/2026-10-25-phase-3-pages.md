# Phase 3: Pages and Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every route in spec Section 7 renders real content from `src/content/`, fully responsive and keyboard
operable, with the resume printable and the CV PDF generated from it.

**Architecture:** Server components read parsed content through `src/lib/content.ts` helpers; client components
exist only where state is needed (projects filter, image dialog, copy button) and receive plain props. Pure
formatting lives in `src/lib/format.ts` with unit tests. Pages follow the spec's three looks: control panel
(metric strip, cards, tables, chips), clean minimal (hero, about, resume), editorial (project and case-study
pages). The signature features (test explorer, in-page runner, Bug Hunt, defect-ticket bodies, hero runner
block) are Phase 3b; this phase leaves room for them but does not fake them.

**Tech Stack:** Next.js 16 App Router (static), Tailwind v4 tokens, lucide-react, Playwright.

**Spec:** `docs/03-MASTER-PROMPT.md` Sections 4, 7, 8, 12.3 (overflow widths, keyboard guards), 14 Phase 3;
amended by `docs/04-DECISIONS.md`. UI guidance: ui-ux-pro-max (chip overflow "+n", explicit no-results state,
tables scroll in their own region, visible focus in dialogs, optimized images).

## Global Constraints

- Render only through helpers (`visible`, `approvedCaseStudies`, `projectsInOrder`, `projectBySlug`); optional
  fields that are `undefined` render nothing (no empty labels, no dangling separators).
- GPA appears only on `/resume`. No count "13" for QA areas. No client names, regions, logos or images on
  `/work`.
- Inline code in content (backtick spans) renders as `<code>`, never as literal backticks.
- Exactly one `<h1>` per page; headings never skip a level.
- Touch targets >= 44x44px; focus ring from tokens; motion CSS-only and off under reduced motion.
- No horizontal page scroll at 320, 375, 768, 1024, 1440, 2560 px; wide tables scroll inside a
  `role="region"` with `aria-label` and `tabindex="0"`.
- Static generation for every route (no `searchParams` in server components).
- New copy is limited to UI labels and section headings; facts come only from content.

## Review Focus

1. **Projects filter without JavaScript, and an unknown `?category=` value:** without JS all 8 cards show and the
   filter bar is absent; an unknown category shows all and marks "All" pressed. Pinned in Task 3.
2. **Image dialog opened by keyboard, then closed by clicking the backdrop:** focus returns to the thumbnail
   that opened it. Pinned in Task 3.
3. **Copy button where the Clipboard API is unavailable or rejects:** the button announces a failure and leaves
   the address selectable, never a false "Copied". Pinned in Task 4.
4. **Resume printed or saved as PDF:** no sidebar, top bar, theme toggle or skip link; black on white; at most 2
   A4 pages; URLs printed after external links. Pinned in Task 5.
5. **Severity counts on a report page versus the tickets actually rendered:** always equal (spec 12.3 D).
   Pinned in Task 3.

---

### Task 1: Formatting helpers and UI primitives

**Files:** Create `src/lib/format.ts`, `src/lib/labels.ts`, `src/components/ui/{StatusChip,SeverityChip,
Button,ExternalLink,CopyButton,CiBadge,Card,MetricTile,InlineCode,Chips}.tsx`; Test
`tests/unit/format.test.ts`.

**Interfaces (produces):**
- `formatMonth('2026-08')` → `'August 2026'`; `formatShortMonth('2025-01')` → `'Jan 2025'`;
  `formatDay('2026-09-03')` → `'3 Sep 2026'`; `formatPeriod(start, end?)` → `'3 Sep 2026 – Present'`,
  `'Feb 2026 – May 2026'`; `formatTimelineDate('2025-01 to 2025-11')` → `'Jan 2025 – Nov 2025'`, `'2026'` →
  `'2026'`, `'Next'` → `'Next'`, `'2026-09-04'` → `'4 Sep 2026'`; `formatCertDate('2025-01/2025-04')` →
  `'Jan – Apr 2025'`, `'2026-07'` → `'Jul 2026'`; `formatProjectPeriod(project)` → `'28 Sep – 20 Oct 2026'`,
  same-day `'24 Oct 2026'`, year-only `'2026'`.
- `splitInlineCode(text)` → `{ code: boolean; text: string }[]`.
- `labels.ts`: `categoryLabel(category)` (C4 wording), `SEVERITY_ORDER`, `severityCounts(findings)` →
  `{ severity, count }[]` in order, zero counts omitted.
- Components: `<SeverityChip severity>` (label + icon + colour token, never colour alone), `<StatusChip
  status="pass|warn|fail|info|running|not-run">`, `<Button href|onClick variant="primary|secondary|ghost">`,
  `<ExternalLink href>` (same tab by default), `<CopyButton value label>` (client; `aria-live="polite"` status
  "Copied to clipboard" / "Copy failed — select the address instead"), `<CiBadge repo>` (plain `<img>` with
  width/height and alt "CI status for {repo}"), `<Chips items max={4}>` (shows "+n" as a disclosure button that
  reveals the rest), `<MetricTile metric>`, `<InlineCode text>`.

- [ ] **Step 1:** Failing unit tests for every `format.ts` example above, `splitInlineCode('Waits on
  `getAnimations()` instead')`, `severityCounts` order and zero-omission, `categoryLabel('api')` →
  `'API / Contract'`.
- [ ] **Step 2:** Run — Expected: FAIL. **Step 3:** Implement. **Step 4:** PASS; commit
  `feat(ui): formatting helpers and UI primitives`.

### Task 2: Overview page (spec 7.1)

**Files:** Modify `src/app/page.tsx`; Create `src/components/content/{ProjectCard,CaseStudyCard,Timeline,
SkillMatrix,QaAreaGrid}.tsx`; Test `tests/e2e/overview.spec.ts`.

Sections, in order (h1 = full name):
1. Hero: mono kicker `{role} · {company}`, `<h1>` full name (display serif), headline, intro; actions "View
   projects" (primary → `/projects`), "Download CV" (→ `profile.cvPdf`, `download` attribute), "Email me"
   (mailto). Portrait (max 240px, native size cap, `object-position: 50% 35%`) in a card captioned in mono
   `fixture · vincent-portrait.jpg · 510×680` (true file facts). Space for the 3b runner block.
2. Run summary strip (h2 "Run summary"): mono header "{n} checks · as of {formatDay(asOf)}" (n = metrics
   rendered), `MetricTile` grid; then links "Run tests on this page" and "Try Bug Hunt" are **omitted until
   3b** (no dead controls).
3. Featured projects (h2): `ProjectCard` grid 1/2/3 columns — mono `SUITE 0{order} · {category label}`, name,
   summary, hook in bold, `Chips` (max 4), `CiBadge`, links "Read the report" and "Repo".
4. Client work teaser (only if approved case studies): role card + up to 3 `CaseStudyCard`.
5. How I test (h2): `QaAreaGrid` of the 12 areas, link to `/about#method`.
6. Skills snapshot: groups as chip rows; learning chips outlined with a "learning" label.
7. Timeline: latest 6 dated events, newest first, link to `/about#timeline`.
8. Contact CTA: one sentence (the tagline), email button, `CopyButton`.

- [ ] **Step 1: Failing E2E**: h1 is the full name; three hero actions with exact names; 10 metric tiles each
  with a "source" link whose href matches content; featured grid shows the 6 featured projects in order; each
  card links to `/projects/{slug}`; the How I test grid has 12 items; the timeline shows 6 items and the
  first is "Published performance-testing (k6)"; no element contains "LinkedIn".
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS; commit `feat(pages): overview`.

### Task 3: Projects index and test-report pages (spec 7.2, 7.3)

**Files:** Modify `src/app/projects/page.tsx`, `src/app/projects/[slug]/page.tsx`; Create
`src/components/content/{ProjectFilter,FindingsTable,DefectTicket,RunSummaryPanel,ResultCallout,DecisionList,
DataTable,EvidenceGallery,ImageDialog}.tsx`; Test `tests/e2e/projects.spec.ts`.

- `/projects`: h1 "Projects"; `ProjectFilter` (client) renders the bar only after hydration: "All" + one
  button per category present, `aria-pressed`, synced to `?category=` via `history.replaceState`, count in an
  `aria-live="polite"` status ("Showing 2 of 8 projects"); zero matches shows a "No projects in this
  category" message with an "Show all" button. Server renders all cards (no-JS shows all). Reads the query
  with `useSearchParams` inside `<Suspense>` so the route stays static.
- `/projects/[slug]`: `generateStaticParams` from `projectsInOrder()`, `dynamicParams = false`; order per 7.3:
  breadcrumb, mono "TEST REPORT", h1 name, summary; `RunSummaryPanel` (target, period, commits, tools, severity
  chips from `severityCounts`, Repo/Live links, `CiBadge`, "Team project" when `team`); `ResultCallout` (hook);
  Context; Approach; Findings (index table then one `<details>` `DefectTicket` per finding: id, title,
  severity, reference, note, tracked-by, status, evidence thumbnail, source link — body fields arrive in 3b);
  Engineering decisions; extra tables via `DataTable` (caption = title, scroll region); Evidence gallery
  (thumbnail buttons open `ImageDialog`: native modal `<dialog>`, focus wrap, Esc and backdrop close, focus
  returns to the opener, caption shown); Limits ("Limits and next steps"); prev/next by order. LegataLink role
  lines render under "My part" when `team`.
- `generateMetadata` per project: title = name, description = summary.

- [ ] **Step 1: Failing E2E**: all 8 report URLs return 200 with one h1 = name; unknown slug 404; filter: pressing
  "Security" shows 1 card, URL has `?category=security`, status text "Showing 1 of 8 projects", "All" restores
  8; `/projects?category=nope` shows 8 with "All" pressed; JS disabled: 8 cards, no filter buttons;
  accessibility report: severity chip counts equal rendered tickets per severity; evidence: Enter on first
  thumbnail opens dialog with focus inside, Tab stays inside, Esc closes and refocuses the thumbnail;
  backdrop click closes and refocuses; LegataLink page shows "Team project" and no Repo link; no literal
  backtick in any rendered report text.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS; commit `feat(pages): projects index and test
  reports`.

### Task 4: Work, skills, about, contact (spec 7.4–7.6, 7.9)

**Files:** Modify the four page files and `src/app/work/[slug]/page.tsx`; Create
`src/components/content/{RoleCard,CareerPath}.tsx`; Test `tests/e2e/sections.spec.ts`.

- `/work`: role card (company, description, title, `formatPeriod`, responsibilities), confidentiality note
  "Client names, data and screenshots are withheld." (D5), case-study cards; C shows a "Currently testing"
  `StatusChip` (running) and no outcomes.
- `/work/[slug]`: params from `caseStudySlugs()`; title, industry, system, period, "What I did", outcomes and
  method only when non-empty. No images.
- `/skills`: `SkillMatrix` (group, skills, evidence links); Learning in its own labelled group.
- `/about`: bio (intro, background, tagline paragraphs), `CareerPath` stepper (IT Support Intern → Software
  QA/QC Engineer → SDET → Cybersecurity / Cloud Engineering; first two done, rest "next"; horizontal ≥ 768px,
  vertical below; an ordered list with visually hidden status text), education (no GPA), earlier experience,
  `#certifications`, languages, capstone card → `/projects/legatalink`, `#method`, `#timeline` (full).
- `/contact`: email as text, mailto button, `CopyButton`, GitHub link.

- [ ] **Step 1: Failing E2E**: `/work` has 3 case-study links and the confidentiality note; `/work/retail-
  operations-platform` shows "Currently testing"; `/work/unknown` 404; `/skills` has 14 groups and a "Learning"
  group; `/about` has anchors `#certifications`, `#method`, `#timeline`, the stepper exposes "done" for the
  first two steps, and no "1.80"; `/contact` copy button: with clipboard permission the status reads "Copied to
  clipboard" and the clipboard holds the email; with `navigator.clipboard.writeText` rejecting, it reads "Copy
  failed — select the address instead".
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS; commit `feat(pages): work, skills, about,
  contact`.

### Task 5: Resume, print stylesheet and generated CV PDF (spec 7.7)

**Files:** Modify `src/app/resume/page.tsx`, `src/app/globals.css` (print layer); Create
`scripts/build-cv-pdf.ts`; Modify `package.json` (`cv` script), `playwright.config.ts` (webServer runs
`pnpm cv` after build), `.github/workflows/ci.yml` (build job installs Chromium, runs `pnpm cv`, uploads
`public/cv/` with `.next/`); Test `tests/e2e/resume.spec.ts`.

- `/resume`: header (name, role at company, location, email, GitHub), summary (background + tagline),
  experience (BossLabs, internship, scholarship), selected projects (each: name — summary, 7 QA repos then
  LegataLink), skills (group: skills), education with GPA and scale note, certifications, languages;
  "Download PDF" button.
- Print layer: hide `[data-print-hide]` (sidebar, top bar, skip link, toggles, download button), force black on
  white tokens, single column, `a[href^="http"]::after { content: " (" attr(href) ")" }`, page margins 14mm,
  avoid breaks inside entries.
- `build-cv-pdf.ts`: start `next start -p 3211`, wait for it, open `/resume` in Chromium with print media,
  `page.pdf({ format: 'A4', printBackground: false })` to `public/cv/Vincent-Jerico-Alcuran-CV.pdf`, stop the
  server, exit non-zero on any failure.

- [ ] **Step 1: Failing E2E**: GPA "1.80 (Philippine scale, 1.00 highest)" visible on `/resume`; print media hides
  the sidebar, top bar and skip link and computed body colour is black on white; `GET /cv/Vincent-Jerico-
  Alcuran-CV.pdf` is 200 `application/pdf` with 1–2 pages (count `/Type /Page` objects).
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS; commit `feat(pages): resume, print stylesheet and
  generated CV PDF`.

### Task 6: Responsive and integrity pass

**Files:** Create `tests/e2e/integrity.spec.ts`.

- [ ] **Step 1: Failing/guard E2E** over every route (8 nav + 8 reports + 3 case studies + 404): no horizontal
  overflow at 320/375/768/1024/1440/2560; heading levels never skip; no console errors; rendered HTML has no
  banned strings (`findBanned`) and no denylisted terms (`findDenied`, list loaded like the unit test).
- [ ] **Step 2:** Fix whatever fails. **Step 3:** Screenshots of `/`, `/projects`, one report, `/about`,
  `/resume` at 375 and 1440 in both themes for the DoD. Commit `test(pages): responsive and rendered-HTML
  integrity`.
