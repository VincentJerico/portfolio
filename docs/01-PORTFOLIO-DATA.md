# Portfolio Data — Source of Truth

Owner: Vincent Jerico Alcuran
Compiled: 2026-10-24 · Revision 2 (CV, job details, LegataLink and approvals added)
Status: Ready to build. Remaining gaps are optional and listed in Section 10.

This file holds every fact the portfolio site is allowed to show. The site must not invent, round up or
embellish anything that is not in here. Each section lists its source so any number can be re-checked.

Legend:

- `VERIFIED` — from a public repo, README, findings report, git history, Vincent's CV, or Vincent directly
- `TODO` — still missing; the field stays hidden on the site until filled
- `PRIVATE` — known, but must never be published

Sources used:

- GitHub profile and 8 public repos under `VincentJerico` (fetched and cloned 2026-10-24)
- CV, two versions (both 1 page, same title "VincentJericoAlcuran_uCV"):
  - CV-QA: targets "Software QA Engineer / QA Tester" roles
  - CV-IT: targets "IT Support, Systems Administrator, Cloud, or Cybersecurity" roles
- Vincent's answers on 2026-10-24
- LegataLink home page screenshot supplied by Vincent
- BossLabs project records (client names withheld)

---

## 1. Identity

| Field | Value | Status / Source |
| --- | --- | --- |
| Full name | Vincent Jerico Alcuran | VERIFIED — CV, GitHub |
| Display name | Vincent Jerico | VERIFIED — LICENSE files, findings reports |
| Current role | Software QA/QC Engineer at BossLabs.AI | VERIFIED — Vincent, 2026-10-24 |
| Role start | 2026-09-03 | VERIFIED — Vincent |
| Career goal | SDET (Software Development Engineer in Test) | VERIFIED — GitHub bio, profile README |
| Next directions | Cybersecurity, Cloud Engineering | VERIFIED — profile README; CV-IT targets Cloud and Cybersecurity roles |
| Location (public) | Cavite, Philippines | VERIFIED — GitHub profile. CV shows Tanza, Cavite; use town only if Vincent asks |
| Email (public) | vincentjericoalcuran@gmail.com | VERIFIED — CV, profile README |
| Phone | PRIVATE — on the CV, never on the site or the public PDF | — |
| Street/postal code | PRIVATE | — |
| GitHub | https://github.com/VincentJerico | VERIFIED |
| GitHub member since | 2022-08-01 | VERIFIED — GitHub API |
| LinkedIn | TODO — coming later (Vincent is recovering his account) | — |
| Photo | `assets-inbox/profile/vincent-portrait.jpg` — 510x680 (3:4), cropped from a mirror selfie, flipped to true orientation, phone and its case photos cropped out, metadata stripped | VERIFIED — supplied 2026-10-24. Replaceable later with a straight-on headshot |
| Spoken languages | English, Tagalog | VERIFIED — Vincent, 2026-10-24 |
| Custom domain | TODO — launch on the Vercel URL first | — |
| Open to work | Not shown (he is employed); "Contact" is enough | Default, Vincent can change |

Note on title: GitHub bio and profile README say "QA Engineer". The site uses "Software QA/QC Engineer". Update
the GitHub bio to match (Section 9).

### Positioning (copy)

Headline:
> Software QA/QC Engineer on the path to SDET.

One-liner:
> Software QA/QC Engineer at BossLabs.AI · Playwright, API, accessibility, security and performance testing ·
> on the path to SDET

Intro paragraph (adapted from profile README):
> I'm a Software QA/QC Engineer at BossLabs.AI, where I test client business platforms before they ship. On
> GitHub I build a public QA automation portfolio: one repo per testing skill, each with its own CI, real targets
> and written findings. I'm working toward an SDET role, with Cybersecurity and Cloud Engineering next.

Background line (from CV, both versions):
> BS Information Technology graduate (Cavite State University, 2026) with hands-on experience in software
> troubleshooting, data validation, SQL/database work and web application development.

Proof-first tagline:
> Every suite runs in CI. Every finding has evidence and a test that tracks it.

---

## 2. Headline numbers (as of 2026-10-24)

Only these numbers may appear in hero stats, metric strips, the hero runner block or meta descriptions.

| Metric | Value | Source |
| --- | --- | --- |
| Public QA project repos | 7 | GitHub API (8 repos minus the profile README repo) |
| Repos with a GitHub Actions CI pipeline | 7 of 7 | `.github/workflows/ci.yml` in each |
| Automated tests in qa-engineering-journey | 108 (91 Playwright UI + 17 Playwright API) | repo README |
| Manual test cases written and executed | 91 (47 SauceDemo + 44 The Internet) | repo README |
| WCAG 2.2 failures found by keyboard audit where axe-core WCAG rules reported 0 | 7 | accessibility-testing README + FINDINGS |
| Security findings mapped to OWASP Top 10 (2021) | 8 (S-1 to S-7, D-1) | security-testing docs/FINDINGS.md |
| Worst latency found under login load | a 2 ms read pushed to 12 s at p95 (60 logins/s) | performance-testing PERF-001 |
| Peak task-CRUD throughput with zero errors | over 7,000 requests/s | performance-testing OBS-001 |
| Seeded bugs caught by TaskFlow's suite | 4 of 4 (+1 real stored XSS found in a later audit) | taskflow-under-test docs/BUGS-FOUND.md |
| Browsers covered by framework CI | Chromium, Firefox, WebKit, mobile Chrome | playwright-framework-template README |

Do NOT claim "all CI green" as static text. Show live GitHub Actions badges instead.

---

## 3. Projects (public, open source)

All QA repos: owner `VincentJerico`, MIT license, Node 22 in CI. Dates are first to latest commit from full git
history.

Display order: 1 accessibility, 2 security, 3 performance, 4 api, 5 framework template, 6 taskflow, 7 journey
(hub), 8 LegataLink (capstone).

### 3.1 accessibility-testing

- Slug: `accessibility-testing`
- Repo: https://github.com/VincentJerico/accessibility-testing
- Findings source: https://github.com/VincentJerico/accessibility-testing/blob/main/docs/FINDINGS.md
- Dates: 2026-09-28 to 2026-10-20 · 17 commits
- Category: Accessibility
- Stack: Playwright · TypeScript · @axe-core/playwright (^4.14) · WCAG 2.2 AA
- Target: SauceDemo (plus W3C's deliberately broken demo for scanner validation)
- Summary: Automated and keyboard accessibility testing of SauceDemo against WCAG 2.2 AA, with a written audit.
- Hook: axe-core's WCAG rules reported 0 violations on every SauceDemo page. The keyboard and manual audit found
  7 WCAG failures, including one that stops a keyboard-only user from checking out.
- Findings:

| ID | Issue | WCAG | Severity |
| --- | --- | --- | --- |
| F-1 | Cart is not reachable by keyboard, which blocks checkout | 2.1.1 Keyboard (A) | Critical |
| F-2 | No visible focus indicator anywhere | 2.4.7 Focus Visible (AA) | Serious |
| F-3 | Menu toggle doesn't expose open/closed state | 4.1.2 Name, Role, Value (A) | Serious |
| F-7 | Focus lands on links hidden behind the open menu | 2.4.11 Focus Not Obscured (AA) | Serious |
| F-4 | Closing the menu drops focus to `<body>` | 2.4.3 Focus Order (A) | Moderate |
| F-5 | Page titles are `<span>`s; pages have no headings | 1.3.1 Info & Relationships (A) | Moderate |
| F-6 | Placeholder is the only visible label | 3.3.2 Labels or Instructions (A) | Moderate |

- Engineering decisions:
  - Scanner self-test: the gate must reject planted defects by rule name, so a green run can't be a vacuous pass
  - Scanner validation against W3C's deliberately broken demo site
  - Custom `isFocusEntirelyObscured()` check for SC 2.4.11, which has no axe rule
  - Known-issue tests pin each defect and go red when it is fixed
  - Waits on `getAnimations()` instead of timeouts, so no timing flakes
  - No axe rule disabled; Chromium only for deterministic keyboard behaviour
- Limits: not a conformance claim; no screen reader pass, zoom/reflow or mobile testing
- Evidence images in repo: `docs/evidence/menu-focus-obscured.png`, `login-button-focused.png`,
  `login-button-unfocused.png`
- CI: lint · format · typecheck, then suite in Chromium; every push/PR and weekly

### 3.2 security-testing

- Slug: `security-testing`
- Repo: https://github.com/VincentJerico/security-testing
- Findings source: https://github.com/VincentJerico/security-testing/blob/main/docs/FINDINGS.md
- Dates: 2026-10-05 to 2026-10-20 · 14 commits · findings report dated 2026-10-20
- Category: Security
- Stack: Playwright · TypeScript · OWASP ZAP 2.17.0 · Trivy 0.76.0 · Docker · npm audit
- Target: OWASP Juice Shop v18.0.0, run locally in Docker on `localhost:3000`
- Summary: Defensive security checks a QA team can run in CI, with findings mapped to the OWASP Top 10 (2021).
- Hook: 8 findings mapped to the OWASP Top 10, and every check has a self-test that proves it can fail.
- Scope guard: localhost only; `src/target.ts` refuses any other host, and a test proves it
- Findings:

| ID | Finding | OWASP 2021 | Severity | Tracked by |
| --- | --- | --- | --- | --- |
| S-1 | No `Content-Security-Policy` header | A05 Security Misconfiguration | Medium | `tests/juice-shop.headers.spec.ts` |
| S-2 | No `Referrer-Policy` header | A05 Security Misconfiguration | Low | `tests/juice-shop.headers.spec.ts` |
| S-3 | Deprecated `Feature-Policy` only, no `Permissions-Policy` | A05 Security Misconfiguration | Low | `tests/juice-shop.headers.spec.ts` |
| S-4 | `Access-Control-Allow-Origin: *` on every response | A05 Security Misconfiguration | Medium | `tests/juice-shop.headers.spec.ts` |
| S-5 | Unknown API route returns a 500 page with a stack trace | A05 Security Misconfiguration | Low | `tests/juice-shop.headers.spec.ts` |
| S-6 | The login `token` cookie is set without `HttpOnly` | A07 Identification and Auth Failures | Medium | `tests/juice-shop.session.spec.ts` |
| S-7 | Order history without a login returns a 500 with a stack trace | A05 Security Misconfiguration | Low | `tests/juice-shop.session.spec.ts` |
| D-1 | 130 unique high or critical CVEs in the app's dependencies | A06 Vulnerable and Outdated Components | High | `scripts/dependency-scan.sh` (report only) |

- Engineering decisions:
  - ZAP baseline: every rule passing today is set to FAIL, so a new issue breaks CI; the 8 known issues are WARN
  - Every check has a self-test that proves it can fail
  - Trivy first scans a fixture lockfile with a known lodash CVE and fails unless Trivy reports it
  - Own dependencies gated with `npm audit --audit-level=high`
- Note: D-1 (130) is "at the time of writing" (2026-10-20); Trivy's database changes daily. Always show the date.

### 3.3 performance-testing

- Slug: `performance-testing`
- Repo: https://github.com/VincentJerico/performance-testing
- Findings source: https://github.com/VincentJerico/performance-testing/blob/main/docs/FINDINGS.md
- Dates: published 2026-10-24 · 1 commit
- Category: Performance
- Stack: k6 v2.3.0 · JavaScript · GitHub Actions · Node 22
- Target: TaskFlow (Vincent's own app, 3.6), checked out at a pinned commit
- Summary: k6 performance suites for TaskFlow. Smoke and load tests gate every push on per-endpoint p95 latency
  budgets; stress, spike, soak, breakpoint and two root-cause experiments run nightly.
- Hook: 60 logins per second pushed an unrelated 2 ms read to 12 seconds at p95.
- Findings:

| ID | Finding | Severity |
| --- | --- | --- |
| PERF-001 | 60 logins per second pushed an unrelated 2 ms read to 12 seconds at p95. Password hashing (`scryptSync`) blocks Node's only thread. | High |
| PERF-002 | `GET /api/tasks` has no pagination: 1.24 MB per board load at 10,000 tasks. | Low |
| OBS-001 | Task CRUD held over 7,000 requests/s with no errors. Capacity depends on the traffic mix, not one number. | Info |

- Test types: Smoke (1 user, 5 journeys, every push) · Load (20 users, 60 s, every push) · Stress (50/100/150 users,
  nightly) · Spike (5 to 200 users in 5 s, nightly) · Soak (15 users, 30 min, memory sampled, nightly) ·
  Breakpoint (arrival-rate ramp until SLO breaks, nightly)
- Engineering decisions:
  - SLOs are the gate: k6 exits 99 when a threshold is crossed, failing CI
  - `selftest/gate-must-fail.sh` runs smoke with impossible budgets and expects exit 99: "a gate that can't fail
    isn't a gate"
  - Content checks on every response, not just status codes
  - Root-cause experiments (`auth-contention.js`, `list-growth.js`) isolate slowdowns
- Evidence image in repo: `docs/breakpoint-dashboard.png` (request rate climbing past 10,000/s)
- Caveat: k6 and TaskFlow share one CI runner; treat absolute capacity numbers as rough

### 3.4 api-testing-framework

- Slug: `api-testing-framework`
- Repo: https://github.com/VincentJerico/api-testing-framework
- Dates: 2026-09-28 to 2026-10-20 · 16 commits
- Category: API / Contract
- Stack: Playwright request API · TypeScript · Zod 4 · Faker
- Target: public Restful-Booker API
- Summary: A reusable, typed API test framework with typed clients, Zod contract checks, auth fixtures, data
  factories and cleanup that fails the test if anything is left behind.
- Hook: When the API drifts from its contract, the custom matcher points at every broken field.
- Engineering decisions:
  - Custom `toMatchSchema` matcher with field-level errors
  - Token fetched once per worker via fixture
  - `BookingClient.cleanup()` deletes everything a test created; a leftover fails the test
  - Tags: `@smoke` `@contract` `@negative`
  - CI: lint · format · typecheck gate before the live API is touched; weekly scheduled run to catch contract drift
  - Matcher takes `APIResponse`, not `any`, to keep assertions type-safe (caught by the typecheck gate)
- Documented API quirks (actual vs expected): `GET /ping` 201 vs 200 · bad credentials 200 + reason vs 401 ·
  successful DELETE 201 vs 200/204 · malformed POST 500 vs 400

### 3.5 playwright-framework-template

- Slug: `playwright-framework-template`
- Repo: https://github.com/VincentJerico/playwright-framework-template
- Dates: 2026-09-22 to 2026-10-20 · 25 commits
- Category: UI Automation / Framework
- Stack: Playwright · TypeScript · Faker · ESLint · Prettier · GitHub Actions
- Target: SauceDemo
- Summary: A reusable Playwright + TypeScript starter with custom fixtures, page objects, per-environment config,
  saved login state, data factories and cross-browser CI.
- Hook: Retries capture a trace, but a test that only passes on retry still fails the run, so flakiness gets
  fixed instead of hidden.
- Patterns: custom fixtures · Page Object Model · multi-env config (`TEST_ENV` / `BASE_URL`) · auth reuse via setup
  project · Faker data factories · `@smoke` tagging · lint/format/typecheck gates
- CI: matrix on Chromium, Firefox, WebKit, mobile Chrome with an HTML report per browser; separate `api` job;
  `failOnFlakyTests`

### 3.6 taskflow-under-test

- Slug: `taskflow-under-test`
- Repo: https://github.com/VincentJerico/taskflow-under-test
- Bugs source: https://github.com/VincentJerico/taskflow-under-test/blob/main/docs/BUGS-FOUND.md
- Dates: 2026-09-18 to 2026-10-20 · 42 commits
- Category: Full-stack testing (own app)
- Stack: Node · Express · SQLite (better-sqlite3) · Vitest · Supertest · Playwright · GitHub Actions
- Summary: A small task manager built to be tested end to end: unit, API and E2E suites, plus planted bugs the
  suite has to catch.
- Hook: 4 bugs planted on purpose, 4 caught, plus a real stored XSS found in a later audit.
- Build milestones (counts are what each milestone added at the time): 1 scaffold + green CI · 2 app: auth, task
  CRUD, business rules, access control · 3 27 validator unit cases (EP + BVA, impossible dates) · 4 28 API cases
  (auth, CRUD, 400/401/404, 403 for another user's task) · 5 Playwright E2E journeys · 6 4 seeded bugs, each caught
  · 7 test strategy + docs
- Seed-and-catch results:

| # | Seeded bug | Type | Caught by |
| --- | --- | --- | --- |
| 1 | Title validation removed | Missing input validation | 6 unit tests |
| 2 | Ownership check removed | Broken access control | 1 API test |
| 3 | Create returns 200 | Wrong status code | 2 API tests |
| 4 | Calendar check removed | Weak date validation | 5 unit tests |
| + | Stored XSS in task titles | Found by a later test audit (real, not seeded) | — |

- Evidence image in repo: `docs/screenshot.png`
- Live demo: none yet (Render blueprint included). Hidden until deployed.

### 3.7 qa-engineering-journey (hub)

- Slug: `qa-engineering-journey`
- Repo: https://github.com/VincentJerico/qa-engineering-journey
- Dates: 2026-09-17 to 2026-10-20 · 62 commits
- Category: Portfolio hub (all disciplines)
- Stack: Playwright · TypeScript · Postman · k6 · SQLite · Node · GitHub Actions
- Summary: QA learning and portfolio repo covering 9 areas (manual testing, test design, API, automation, SQL,
  performance, security, AI testing and CI/CD), each run against a live target.
- Hook: 91 manual cases, then 108 automated tests that each map back to a manual case ID.
- Area status:

| Area | What's inside |
| --- | --- |
| Manual testing | 2 plans, 91 cases, 2 execution reports, 2 bug reports, 2 checklists |
| API testing | Plan, 17 scenarios, API reference, Postman collection, execution report (Restful-Booker) |
| Automation | 91 UI + 17 API Playwright tests, each mapped to a manual case ID, in CI |
| CI/CD | GitHub Actions: sanity, UI, API, AI evals, SQL checks, k6 compile |
| Test design | Worked examples of EP, BVA, decision tables, state transition |
| SQL testing | SQLite sample DB, 8 data-validation checks, analytics queries, execution report |
| Performance | k6 smoke/load/stress vs Restful-Booker, execution report |
| Security | OWASP-oriented checklist, 15 checks, live execution report |
| AI testing | Runnable LLM eval harness: 6 evals (classification, extraction, safety, schema) |

- Bug reports: BUG-001 SauceDemo `problem_user` shows identical product images · BUG-002 empty cart checks out as a
  $0 order

### 3.8 LegataLink (capstone)

- Slug: `legatalink`
- Full title: LegataLink: A Web-Based Reservation System for Legata Familia Resort
- Type: Capstone academic project, BS Information Technology, Cavite State University — Trece Martires City Campus
- Year: 2026
- Client: Legata Familia Resort, Tanza, Cavite (a real family resort; naming it is fine, it's an academic project
  shown on the CV)
- Live site: https://legatalink.free.nf/ (VERIFIED — CV and Vincent). Free host runs a browser check, so automated
  link checkers get blocked; exclude it from link checks.
- Repository: https://github.com/KyleReginaldo/legatalink — private (requires login as of 2026-10-24) and owned by a
  teammate's account. Do not link it on the site unless it is made public.
- Stack: Laravel · PHP · MySQL · Leaflet (map) · HTML/CSS · JavaScript
- Summary: A web-based reservation system for a family resort: rooms, cottages and pavilions, an interactive resort
  map, gallery and online booking.
- Vincent's work (CV-QA, VERIFIED):
  - Developed and tested the reservation system using Laravel, PHP, MySQL and Leaflet
  - Performed functional testing of authentication, RBAC, room management, reservations and database workflows
  - Used SQL to validate records, identify issues and troubleshoot application behaviour
- Also on CV-IT (VERIFIED): implemented authentication, RBAC, relational database design and secure booking
  workflows; integrated a resort map to improve navigation and user experience
- Hook: Built and tested a live resort reservation system: functional testing of authentication, roles, rooms and
  reservations, with SQL to validate the records behind them.
- Features visible on the live site (from screenshot, VERIFIED): Home, Rooms, Resort Map, Gallery, Book Now,
  Sign In; hero "Where Every Stay Becomes a Story."; "Rooms, cottages & pavilions nestled in nature. Perfect for
  families, celebrations & unforgettable escapes."; chat button
- Evidence: `assets-inbox/legatalink/home-hero.png` (supplied, 3024x1736). More screens wanted (Section 10).
- Team: repo is on a teammate's account, so this was a team project. Show as "Capstone (team project)". Vincent's
  role is described only by the CV lines above.

---

## 4. Experience

### 4.1 BossLabs.AI — Software QA/QC Engineer

| Field | Value | Status |
| --- | --- | --- |
| Company | BossLabs.AI | VERIFIED |
| Company description | Builds custom business platforms for Filipino companies, shipped in weeks | VERIFIED (company mission) |
| Title | Software QA/QC Engineer | VERIFIED |
| Start | 2026-09-03 (Present) | VERIFIED |
| Responsibilities | Test client business platforms before they ship: functional and black-box QA, data-layer checks, UAT with clients, end-to-end testing, defect reporting and re-testing, UI/UX review | VERIFIED — Vincent's stated duties + case studies below |

### 4.2 Rural Health Unit & Barangay Health Centers, Tanza, Cavite — IT Support Intern

- Title: IT Support Intern – Technical Support & Health Data Management
- Dates: February 2026 – May 2026
- Bullets (CV-QA, VERIFIED):
  - Troubleshot and validated hardware, software, printers and Windows workstations; performed software
    installation, updates, malware scanning and preventive maintenance
  - Analysed reported technical issues, reproduced problems when possible, and applied corrective actions
  - Managed and validated electronic health records using Microsoft Office and SQL-based systems, checking data
    accuracy, completeness and consistency
  - Supported users with technical issues while maintaining confidentiality and data accuracy
- Note: the CV spells "Troubleshooted"; the site uses "Troubleshot".

### 4.3 Google Developer Groups (GDG), Polytechnic University of the Philippines – Manila — DataCamp Scholar

- Dates: January 2025 – November 2025
- Bullets (CV-QA, VERIFIED):
  - Completed training in SQL, Data Engineering, Cloud Computing, Data Visualization, Machine Learning and Data
    Science
  - Developed practical SQL and data analysis skills through hands-on querying, validation and data management

---

## 5. Client work at BossLabs.AI (anonymized)

Approved by Vincent on 2026-10-24 to publish **anonymously**. Rules for the site:

- No client names, brands, logos, URLs, staff names, screenshots, data, internal figures or internal documents
- Describe the industry and system type only; share Vincent's activities and outcomes
- Never quote platform size figures (page counts, table counts, roles) from client handovers
- Do not show the client's region (decided 2026-10-24, `docs/04-DECISIONS.md` D5). Regions are removed from this
  file too, because the repository is public

### 5.1 Case study A — Warehouse and operations platform (WMS/ERP)

- Slug: `warehouse-operations-platform`
- Industry: Office-furniture distribution
- System: Phone- and tablet-first, barcode-driven operations platform covering sales, payments, warehouse,
  dispatch, delivery, purchasing, inventory control, accounting and HR
- Period: September 2026 – present
- Vincent's work:
  - Ran user acceptance testing and delivered a UAT results report (17 Sep 2026) that drove the team's fix round
    on 21 Sep 2026
  - Leads scenario-by-scenario UAT re-test sessions with the client's team (October 2026)
- Status: approved, anonymous

### 5.2 Case study B — Project accounting and procurement platform

- Slug: `project-accounting-platform`
- Industry: Multi-company group (printing, trading, construction) working on government and private projects
- System: Project-based accounting, procurement (purchase request to quotation to purchase order) and finance web
  app
- Period: September 2026
- Vincent's work:
  - Black-box functional QA of the deployed build (4 Sep 2026): 8 bugs reported, ranked by fix priority
  - Highest-severity bug: project data failed to load right after login because of a server/token clock issue;
    a page reload hid it, which is why it's easy to miss
  - Built a 48-check data-layer QA tracker covering reference data, code formats, data migration, field rules,
    commercial calculations, rollups, access rules and the audit trail, ordered highest risk first
- Status: approved, anonymous

### 5.3 Case study C — Fine-jewelry retail operations platform (in progress)

- Slug: `retail-operations-platform`
- Industry: Fine-jewelry retail
- System: Pricing engine, catalogue/configurator, orders and production, branch inventory and point of sale
- Period: October 2026 – present
- Vincent's work: QA of the staging build
- Status: approved, anonymous; show as "Currently testing" with no outcomes until there are some

### 5.4 QA method used on client builds

Vincent tests every build against these areas: Functionality · UI/UX · Data Integrity · Permissions & Security ·
Workflow/Business Logic · Performance · Reliability & Error Handling · Compatibility & Responsiveness ·
Integration · Reports & Outputs · Regression · User Acceptance / Client Requirements.

(His checklist is described as 13 areas; 12 are on record. Show these 12 until the 13th is supplied, and do not
say "13".)

---

## 6. Skills

Only tools actually used in the repos, client work or listed on the CV.

| Group | Skills | Evidence |
| --- | --- | --- |
| Testing | Manual and exploratory testing · functional testing · regression testing · test planning · test case development · test design (EP, BVA, decision tables, state transition) · bug reporting · UAT · UI/UX validation | qa-engineering-journey, client work, CV |
| UI automation | Playwright · Page Object Model · fixtures · cross-browser (Chromium, Firefox, WebKit) | playwright-framework-template |
| API testing | Playwright request API · Postman · REST · contract/schema testing (Zod) · Supertest | api-testing-framework, taskflow |
| Unit testing | Vitest · coverage (v8) | taskflow-under-test |
| Accessibility | WCAG 2.2 AA · axe-core · keyboard audits · ARIA | accessibility-testing |
| Security testing | OWASP Top 10 · OWASP ZAP · Trivy · npm audit · security headers · session/cookie checks · access control | security-testing, taskflow |
| Performance | k6 · SLO thresholds · load/stress/spike/soak/breakpoint · root-cause experiments | performance-testing |
| Data and databases | SQL · MySQL · SQLite · database testing · data validation · relational database design | qa-engineering-journey, LegataLink, internship, CV |
| AI testing | LLM eval harness (classification, extraction, safety, schema) | qa-engineering-journey |
| Languages and web | TypeScript · JavaScript (Node 22) · PHP · Laravel · HTML/CSS · Bash | repos, LegataLink, CV |
| CI/CD and tooling | GitHub Actions · Docker · Git · GitHub · ESLint · Prettier · Dependabot · VS Code · XAMPP | repos, CV |
| IT and systems | Windows 10/11 · Linux (basic) · TCP/IP · LAN/WAN · OSI · system troubleshooting · Active Directory (basic) · hardware/software installation | internship, CV |
| Security foundations | Information assurance · network security · access control · data protection | CV-IT, coursework, Fortinet cert |
| Learning | AWS · Cloud Engineering · Cybersecurity | profile README (mark "learning") |

Show "learning" items visually distinct from proven skills. No percentage bars or ratings.

---

## 7. Education

| Field | Value |
| --- | --- |
| Degree | Bachelor of Science in Information Technology |
| School | Cavite State University — Trece Martires City Campus |
| Graduated | August 2026 (VERIFIED — Vincent) |
| GPA | 1.80 (Philippine scale, 1.00 highest) — show only on the resume page, with the scale note |
| Honors | Dean's Lister (CV wording: "intermittent Dean's Lister"; site shows "Dean's Lister") |
| Relevant coursework | Software Engineering · Database Management · Web Systems & Technologies · Information Assurance & Security · Systems Administration · Computer Networks |
| Capstone | LegataLink (3.8) |

---

## 8. Certifications

| Certification | Issuer | Date |
| --- | --- | --- |
| Introduction to the Threat Landscape 3.0 | Fortinet | July 2026 |
| Introduction to SQL | DataCamp | April 2025 |
| Understanding Data Engineering | DataCamp | Jan–Apr 2025 |
| Understanding Cloud Computing | DataCamp | Jan–Apr 2025 |
| Understanding Data Topics | DataCamp | Jan–Apr 2025 |
| Understanding Data Visualization | DataCamp | Jan–Apr 2025 |
| Understanding Machine Learning | DataCamp | Jan–Apr 2025 |
| Understanding Data Science | DataCamp | Jan–Apr 2025 |

Credential URLs: TODO (optional). If supplied, link each one.

---

## 9. Timeline

| Date | Event | Kind |
| --- | --- | --- |
| 2025-01 to 2025-11 | DataCamp Scholar, GDG PUP Manila | education |
| 2025-04 | DataCamp: Introduction to SQL | milestone |
| 2026-02 to 2026-05 | IT Support Intern, Rural Health Unit & Barangay Health Centers, Tanza | work |
| 2026 | Capstone: LegataLink reservation system for Legata Familia Resort | project |
| 2026-07 | Fortinet: Introduction to the Threat Landscape 3.0 | milestone |
| 2026-08 | Graduated BS Information Technology, Cavite State University | education |
| 2026-09-03 | Joined BossLabs.AI as Software QA/QC Engineer | work |
| 2026-09-04 | Functional QA of a project-accounting platform: 8 bugs reported | work |
| 2026-09-17 | Started qa-engineering-journey | project |
| 2026-09-17 | Delivered UAT results for a warehouse/operations platform | work |
| 2026-09-18 | Started taskflow-under-test | project |
| 2026-09-22 | Started playwright-framework-template | project |
| 2026-09-28 | Started api-testing-framework and accessibility-testing | project |
| 2026-10-05 | Started security-testing | project |
| 2026-10-20 | Security findings report: 8 findings mapped to OWASP Top 10 | milestone |
| 2026-10-24 | Published performance-testing (k6) | project |
| Next | SDET · Cybersecurity · Cloud Engineering (AWS) | next |

---

## 10. Remaining gaps (none block the build; each field stays hidden until filled)

1. LinkedIn URL (coming once Vincent recovers his account)
2. Optional: a straight-on headshot with a plain background to replace the current photo
3. More LegataLink screens: rooms, resort map, booking flow, admin (no real guest data)
4. Whether LegataLink's repo can be made public (otherwise, no repo link)
5. Credential URLs for certifications
6. The 13th QA checklist area
7. Domain name and GitHub repo name for the site (defaults: Vercel URL, `VincentJerico/portfolio`)
8. ~~Spoken languages~~ — resolved 2026-10-24: English, Tagalog (Section 1)

## 11. CV handling

- Neither existing CV mentions the BossLabs role or the QA automation portfolio, and both include a phone number.
- So the site does **not** serve either PDF. Instead, `/resume` is built from this data, and the downloadable PDF
  is generated from `/resume` at build time (spec Section 7.7), so it is always current and never includes the
  phone number or postal code.
- Keep the original CVs private.

## 12. GitHub fixes to make (found while compiling)

1. Profile README says "6 public QA repos" — there are 7.
2. Profile README `now.txt` still says "Next repo: performance-testing" — it is published.
3. performance-testing is missing from the profile README's Projects list and CI Status table.
4. performance-testing has no topics. Suggested: `k6`, `performance-testing`, `load-testing`, `slo`, `qa`, `sdet`,
   `github-actions`.
5. GitHub bio says "QA Engineer"; change to "Software QA/QC Engineer" to match the site.
6. taskflow-under-test README has a commented-out live demo line — deploy it or remove the comment.
7. GitHub profile website field is empty — set it once the portfolio is live.
