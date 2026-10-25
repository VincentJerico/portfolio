import type { z } from 'zod';
import type { Project } from './schema';

// docs/01-PORTFOLIO-DATA.md Section 3, display order 1-8. Data lines map to fields as follows:
// Target / Scope guard / Type / Client / Features -> context; CI / Patterns / milestones -> approach;
// Engineering decisions -> decisions (split at the first ": "); Limits / Caveat -> limits.
// Ticket bodies (steps, expected, actual) are added from each repo's FINDINGS.md in Phase 3b.

const GH = 'https://github.com/VincentJerico';
const ci = (repo: string) => ({
  repo: `${GH}/${repo}`,
  ciBadge: `${GH}/${repo}/actions/workflows/ci.yml/badge.svg`,
  ciUrl: `${GH}/${repo}/actions/workflows/ci.yml`,
});
const source = (repo: string, file: string) => (anchor: string) =>
  `${GH}/${repo}/blob/main/docs/${file}#${anchor}`;

const a11y = source('accessibility-testing', 'FINDINGS.md');
const sec = source('security-testing', 'FINDINGS.md');
const perf = source('performance-testing', 'FINDINGS.md');

export const projects: z.input<typeof Project>[] = [
  {
    slug: 'accessibility-testing',
    name: 'accessibility-testing',
    category: 'accessibility',
    featured: true,
    order: 1,
    summary:
      'Automated and keyboard accessibility testing of SauceDemo against WCAG 2.2 AA, with a written audit.',
    hook: "axe-core's WCAG rules reported 0 violations on every SauceDemo page. The keyboard and manual audit found 7 WCAG failures, including one that stops a keyboard-only user from checking out.",
    ...ci('accessibility-testing'),
    startDate: '2026-09-28',
    endDate: '2026-10-20',
    commits: 17,
    target: "SauceDemo (plus W3C's deliberately broken demo for scanner validation)",
    stack: ['Playwright', 'TypeScript', '@axe-core/playwright (^4.14)', 'WCAG 2.2 AA'],
    context: ["Target: SauceDemo (plus W3C's deliberately broken demo for scanner validation)"],
    approach: ['CI: lint · format · typecheck, then suite in Chromium; every push/PR and weekly'],
    findings: [
      {
        id: 'F-1',
        title: 'Cart is not reachable by keyboard, which blocks checkout',
        reference: '2.1.1 Keyboard (A)',
        severity: 'critical',
        sourceHref: a11y('f-1--cart-is-not-reachable-by-keyboard'),
      },
      {
        id: 'F-2',
        title: 'No visible focus indicator anywhere',
        reference: '2.4.7 Focus Visible (AA)',
        severity: 'serious',
        evidenceIndex: 1,
        sourceHref: a11y('f-2--no-visible-focus-indicator-anywhere'),
      },
      {
        id: 'F-3',
        title: "Menu toggle doesn't expose open/closed state",
        reference: '4.1.2 Name, Role, Value (A)',
        severity: 'serious',
        sourceHref: a11y('f-3--menu-toggle-hides-its-state'),
      },
      {
        id: 'F-7',
        title: 'Focus lands on links hidden behind the open menu',
        reference: '2.4.11 Focus Not Obscured (AA)',
        severity: 'serious',
        evidenceIndex: 0,
        sourceHref: a11y('f-7--focus-moves-behind-the-open-menu'),
      },
      {
        id: 'F-4',
        title: 'Closing the menu drops focus to `<body>`',
        reference: '2.4.3 Focus Order (A)',
        severity: 'moderate',
        sourceHref: a11y('f-4--closing-the-menu-loses-focus'),
      },
      {
        id: 'F-5',
        title: 'Page titles are `<span>`s; pages have no headings',
        reference: '1.3.1 Info & Relationships (A)',
        severity: 'moderate',
        sourceHref: a11y('f-5--page-titles-are-not-headings'),
      },
      {
        id: 'F-6',
        title: 'Placeholder is the only visible label',
        reference: '3.3.2 Labels or Instructions (A)',
        severity: 'moderate',
        sourceHref: a11y('f-6--placeholder-is-the-only-visible-label'),
      },
    ],
    decisions: [
      {
        title: 'Scanner self-test',
        body: "the gate must reject planted defects by rule name, so a green run can't be a vacuous pass",
      },
      { title: "Scanner validation against W3C's deliberately broken demo site" },
      { title: 'Custom `isFocusEntirelyObscured()` check for SC 2.4.11, which has no axe rule' },
      { title: 'Known-issue tests pin each defect and go red when it is fixed' },
      { title: 'Waits on `getAnimations()` instead of timeouts, so no timing flakes' },
      { title: 'No axe rule disabled; Chromium only for deterministic keyboard behaviour' },
    ],
    limits: ['not a conformance claim; no screen reader pass, zoom/reflow or mobile testing'],
    evidence: [
      {
        src: '/images/projects/accessibility-testing/menu-focus-obscured.png',
        alt: "SauceDemo with the side menu open. Keyboard focus is on the first product's image link, which the menu panel completely covers, so no focus is visible anywhere on screen.",
        caption:
          'F-7: keyboard focus is on the Backpack image link, completely under the open menu.',
        width: 1280,
        height: 720,
      },
      {
        src: '/images/projects/accessibility-testing/login-button-unfocused.png',
        alt: 'SauceDemo Login button before keyboard focus: a green button with a dark Login label.',
        caption: 'F-2: login-button-unfocused.png',
        width: 292,
        height: 49,
      },
      {
        src: '/images/projects/accessibility-testing/login-button-focused.png',
        alt: 'The same Login button after keyboard focus, identical to the unfocused screenshot.',
        caption: 'F-2: login-button-focused.png. Same bytes, same pixels.',
        width: 292,
        height: 49,
      },
    ],
    status: 'verified',
  },
  {
    slug: 'security-testing',
    name: 'security-testing',
    category: 'security',
    featured: true,
    order: 2,
    summary:
      'Defensive security checks a QA team can run in CI, with findings mapped to the OWASP Top 10 (2021).',
    hook: '8 findings mapped to the OWASP Top 10, and every check has a self-test that proves it can fail.',
    ...ci('security-testing'),
    startDate: '2026-10-05',
    endDate: '2026-10-20',
    commits: 14,
    target: 'OWASP Juice Shop v18.0.0, run locally in Docker on `localhost:3000`',
    stack: ['Playwright', 'TypeScript', 'OWASP ZAP 2.17.0', 'Trivy 0.76.0', 'Docker', 'npm audit'],
    context: [
      'Target: OWASP Juice Shop v18.0.0, run locally in Docker on `localhost:3000`',
      'Scope guard: localhost only; `src/target.ts` refuses any other host, and a test proves it',
      'Findings report dated 2026-10-20',
    ],
    approach: [],
    findings: [
      {
        id: 'S-1',
        title: 'No `Content-Security-Policy` header',
        reference: 'A05 Security Misconfiguration',
        severity: 'medium',
        trackedBy: 'tests/juice-shop.headers.spec.ts',
        sourceHref: sec('s-1--no-content-security-policy'),
      },
      {
        id: 'S-2',
        title: 'No `Referrer-Policy` header',
        reference: 'A05 Security Misconfiguration',
        severity: 'low',
        trackedBy: 'tests/juice-shop.headers.spec.ts',
        sourceHref: sec('s-2--no-referrer-policy'),
      },
      {
        id: 'S-3',
        title: 'Deprecated `Feature-Policy` only, no `Permissions-Policy`',
        reference: 'A05 Security Misconfiguration',
        severity: 'low',
        trackedBy: 'tests/juice-shop.headers.spec.ts',
        sourceHref: sec('s-3--feature-policy-instead-of-permissions-policy'),
      },
      {
        id: 'S-4',
        title: '`Access-Control-Allow-Origin: *` on every response',
        reference: 'A05 Security Misconfiguration',
        severity: 'medium',
        trackedBy: 'tests/juice-shop.headers.spec.ts',
        sourceHref: sec('s-4--wildcard-cors'),
      },
      {
        id: 'S-5',
        title: 'Unknown API route returns a 500 page with a stack trace',
        reference: 'A05 Security Misconfiguration',
        severity: 'low',
        trackedBy: 'tests/juice-shop.headers.spec.ts',
        sourceHref: sec('s-5--stack-trace-on-an-unknown-api-route'),
      },
      {
        id: 'S-6',
        title: 'The login `token` cookie is set without `HttpOnly`',
        reference: 'A07 Identification and Auth Failures',
        severity: 'medium',
        trackedBy: 'tests/juice-shop.session.spec.ts',
        sourceHref: sec('s-6--session-token-cookie-readable-by-scripts'),
      },
      {
        id: 'S-7',
        title: 'Order history without a login returns a 500 with a stack trace',
        reference: 'A05 Security Misconfiguration',
        severity: 'low',
        trackedBy: 'tests/juice-shop.session.spec.ts',
        sourceHref: sec('s-7--order-history-fails-with-a-stack-trace-instead-of-a-401'),
      },
      {
        id: 'D-1',
        title: "130 unique high or critical CVEs in the app's dependencies",
        reference: 'A06 Vulnerable and Outdated Components',
        severity: 'high',
        note: 'D-1 (130) is "at the time of writing" (2026-10-20); Trivy\'s database changes daily.',
        trackedBy: 'scripts/dependency-scan.sh',
        ticketStatus: 'Report only',
        sourceHref: sec('d-1--vulnerable-dependencies'),
      },
    ],
    decisions: [
      {
        title: 'ZAP baseline',
        body: 'every rule passing today is set to FAIL, so a new issue breaks CI; the 8 known issues are WARN',
      },
      { title: 'Every check has a self-test that proves it can fail' },
      {
        title:
          'Trivy first scans a fixture lockfile with a known lodash CVE and fails unless Trivy reports it',
      },
      { title: 'Own dependencies gated with `npm audit --audit-level=high`' },
    ],
    status: 'verified',
  },
  {
    slug: 'performance-testing',
    name: 'performance-testing',
    category: 'performance',
    featured: true,
    order: 3,
    summary:
      'k6 performance suites for TaskFlow. Smoke and load tests gate every push on per-endpoint p95 latency budgets; stress, spike, soak, breakpoint and two root-cause experiments run nightly.',
    hook: '60 logins per second pushed an unrelated 2 ms read to 12 seconds at p95.',
    ...ci('performance-testing'),
    startDate: '2026-10-24',
    endDate: '2026-10-24',
    commits: 1,
    target: "TaskFlow (Vincent's own app), checked out at a pinned commit",
    stack: ['k6 v2.3.0', 'JavaScript', 'GitHub Actions', 'Node 22'],
    context: ["Target: TaskFlow (Vincent's own app), checked out at a pinned commit"],
    approach: [],
    findings: [
      {
        id: 'PERF-001',
        title: '60 logins per second pushed an unrelated 2 ms read to 12 seconds at p95.',
        note: "Password hashing (`scryptSync`) blocks Node's only thread.",
        severity: 'high',
        sourceHref: perf('perf-001-login-traffic-stalls-every-other-request'),
      },
      {
        id: 'PERF-002',
        title: '`GET /api/tasks` has no pagination: 1.24 MB per board load at 10,000 tasks.',
        severity: 'low',
        sourceHref: perf('perf-002-the-task-list-has-no-pagination'),
      },
      {
        id: 'OBS-001',
        title: 'Task CRUD held over 7,000 requests/s with no errors.',
        note: 'Capacity depends on the traffic mix, not one number.',
        severity: 'info',
        sourceHref: perf('obs-001-task-crud-is-fast-capacity-depends-on-the-traffic-mix'),
      },
    ],
    decisions: [
      {
        title: 'SLOs are the gate',
        body: 'k6 exits 99 when a threshold is crossed, failing CI',
      },
      {
        title:
          '`selftest/gate-must-fail.sh` runs smoke with impossible budgets and expects exit 99',
        body: '"a gate that can\'t fail isn\'t a gate"',
      },
      { title: 'Content checks on every response, not just status codes' },
      {
        title: 'Root-cause experiments (`auth-contention.js`, `list-growth.js`) isolate slowdowns',
      },
    ],
    limits: ['k6 and TaskFlow share one CI runner; treat absolute capacity numbers as rough'],
    evidence: [
      {
        src: '/images/projects/performance-testing/breakpoint-dashboard.png',
        alt: 'k6 dashboard from the breakpoint run: request rate climbing past 10,000 per second',
        width: 1280,
        height: 900,
      },
    ],
    extraTables: [
      {
        title: 'Test types',
        columns: ['Test type', 'Profile'],
        rows: [
          ['Smoke', '1 user, 5 journeys, every push'],
          ['Load', '20 users, 60 s, every push'],
          ['Stress', '50/100/150 users, nightly'],
          ['Spike', '5 to 200 users in 5 s, nightly'],
          ['Soak', '15 users, 30 min, memory sampled, nightly'],
          ['Breakpoint', 'arrival-rate ramp until SLO breaks, nightly'],
        ],
      },
    ],
    status: 'verified',
  },
  {
    slug: 'api-testing-framework',
    name: 'api-testing-framework',
    category: 'api',
    featured: true,
    order: 4,
    summary:
      'A reusable, typed API test framework with typed clients, Zod contract checks, auth fixtures, data factories and cleanup that fails the test if anything is left behind.',
    hook: 'When the API drifts from its contract, the custom matcher points at every broken field.',
    ...ci('api-testing-framework'),
    startDate: '2026-09-28',
    endDate: '2026-10-20',
    commits: 16,
    target: 'public Restful-Booker API',
    stack: ['Playwright request API', 'TypeScript', 'Zod 4', 'Faker'],
    context: ['Target: public Restful-Booker API'],
    approach: [],
    decisions: [
      { title: 'Custom `toMatchSchema` matcher with field-level errors' },
      { title: 'Token fetched once per worker via fixture' },
      {
        title:
          '`BookingClient.cleanup()` deletes everything a test created; a leftover fails the test',
      },
      { title: 'Tags', body: '`@smoke` `@contract` `@negative`' },
      {
        title: 'CI',
        body: 'lint · format · typecheck gate before the live API is touched; weekly scheduled run to catch contract drift',
      },
      {
        title:
          'Matcher takes `APIResponse`, not `any`, to keep assertions type-safe (caught by the typecheck gate)',
      },
    ],
    extraTables: [
      {
        title: 'Documented API quirks',
        columns: ['Case', 'Actual', 'Expected'],
        rows: [
          ['`GET /ping`', '201', '200'],
          ['bad credentials', '200 + reason', '401'],
          ['successful DELETE', '201', '200/204'],
          ['malformed POST', '500', '400'],
        ],
      },
    ],
    status: 'verified',
  },
  {
    slug: 'playwright-framework-template',
    name: 'playwright-framework-template',
    category: 'ui-automation',
    featured: true,
    order: 5,
    summary:
      'A reusable Playwright + TypeScript starter with custom fixtures, page objects, per-environment config, saved login state, data factories and cross-browser CI.',
    hook: 'Retries capture a trace, but a test that only passes on retry still fails the run, so flakiness gets fixed instead of hidden.',
    ...ci('playwright-framework-template'),
    startDate: '2026-09-22',
    endDate: '2026-10-20',
    commits: 25,
    target: 'SauceDemo',
    stack: ['Playwright', 'TypeScript', 'Faker', 'ESLint', 'Prettier', 'GitHub Actions'],
    context: ['Target: SauceDemo'],
    approach: [
      'Patterns: custom fixtures · Page Object Model · multi-env config (`TEST_ENV` / `BASE_URL`) · auth reuse via setup project · Faker data factories · `@smoke` tagging · lint/format/typecheck gates',
      'CI: matrix on Chromium, Firefox, WebKit, mobile Chrome with an HTML report per browser; separate `api` job; `failOnFlakyTests`',
    ],
    status: 'verified',
  },
  {
    slug: 'taskflow-under-test',
    name: 'taskflow-under-test',
    category: 'full-stack-testing',
    featured: true,
    order: 6,
    summary:
      'A small task manager built to be tested end to end: unit, API and E2E suites, plus planted bugs the suite has to catch.',
    hook: '4 bugs planted on purpose, 4 caught, plus a real stored XSS found in a later audit.',
    ...ci('taskflow-under-test'),
    startDate: '2026-09-18',
    endDate: '2026-10-20',
    commits: 42,
    stack: [
      'Node',
      'Express',
      'SQLite (better-sqlite3)',
      'Vitest',
      'Supertest',
      'Playwright',
      'GitHub Actions',
    ],
    context: [],
    approach: [
      'Build milestones (counts are what each milestone added at the time):',
      'Milestone 1: scaffold + green CI',
      'Milestone 2: app: auth, task CRUD, business rules, access control',
      'Milestone 3: 27 validator unit cases (EP + BVA, impossible dates)',
      "Milestone 4: 28 API cases (auth, CRUD, 400/401/404, 403 for another user's task)",
      'Milestone 5: Playwright E2E journeys',
      'Milestone 6: 4 seeded bugs, each caught',
      'Milestone 7: test strategy + docs',
    ],
    evidence: [
      {
        src: '/images/projects/taskflow-under-test/screenshot.png',
        alt: 'TaskFlow task list: a New task title field with an Add button, one completed task struck through and three open tasks, each with a Delete button.',
        width: 1120,
        height: 940,
      },
    ],
    extraTables: [
      {
        title: 'Seed-and-catch results',
        columns: ['#', 'Seeded bug', 'Type', 'Caught by'],
        rows: [
          ['1', 'Title validation removed', 'Missing input validation', '6 unit tests'],
          ['2', 'Ownership check removed', 'Broken access control', '1 API test'],
          ['3', 'Create returns 200', 'Wrong status code', '2 API tests'],
          ['4', 'Calendar check removed', 'Weak date validation', '5 unit tests'],
          ['+', 'Stored XSS in task titles', 'Found by a later test audit (real, not seeded)', '—'],
        ],
      },
    ],
    status: 'verified',
  },
  {
    slug: 'qa-engineering-journey',
    name: 'qa-engineering-journey',
    category: 'hub',
    featured: false,
    order: 7,
    summary:
      'QA learning and portfolio repo covering 9 areas (manual testing, test design, API, automation, SQL, performance, security, AI testing and CI/CD), each run against a live target.',
    hook: '91 manual cases, then 108 automated tests that each map back to a manual case ID.',
    ...ci('qa-engineering-journey'),
    startDate: '2026-09-17',
    endDate: '2026-10-20',
    commits: 62,
    stack: ['Playwright', 'TypeScript', 'Postman', 'k6', 'SQLite', 'Node', 'GitHub Actions'],
    context: [],
    approach: [],
    extraTables: [
      {
        title: 'Area status',
        columns: ['Area', "What's inside"],
        rows: [
          ['Manual testing', '2 plans, 91 cases, 2 execution reports, 2 bug reports, 2 checklists'],
          [
            'API testing',
            'Plan, 17 scenarios, API reference, Postman collection, execution report (Restful-Booker)',
          ],
          ['Automation', '91 UI + 17 API Playwright tests, each mapped to a manual case ID, in CI'],
          ['CI/CD', 'GitHub Actions: sanity, UI, API, AI evals, SQL checks, k6 compile'],
          ['Test design', 'Worked examples of EP, BVA, decision tables, state transition'],
          [
            'SQL testing',
            'SQLite sample DB, 8 data-validation checks, analytics queries, execution report',
          ],
          ['Performance', 'k6 smoke/load/stress vs Restful-Booker, execution report'],
          ['Security', 'OWASP-oriented checklist, 15 checks, live execution report'],
          [
            'AI testing',
            'Runnable LLM eval harness: 6 evals (classification, extraction, safety, schema)',
          ],
        ],
      },
      {
        title: 'Bug reports',
        columns: ['ID', 'Report'],
        rows: [
          ['BUG-001', 'SauceDemo `problem_user` shows identical product images'],
          ['BUG-002', 'empty cart checks out as a $0 order'],
        ],
      },
    ],
    status: 'verified',
  },
  {
    slug: 'legatalink',
    name: 'LegataLink',
    category: 'capstone',
    featured: false,
    order: 8,
    summary:
      'A web-based reservation system for a family resort: rooms, cottages and pavilions, an interactive resort map, gallery and online booking.',
    hook: 'Built and tested a live resort reservation system: functional testing of authentication, roles, rooms and reservations, with SQL to validate the records behind them.',
    liveUrl: 'https://legatalink.free.nf/',
    team: true,
    role: [
      'Developed and tested the reservation system using Laravel, PHP, MySQL and Leaflet',
      'Performed functional testing of authentication, RBAC, room management, reservations and database workflows',
      'Used SQL to validate records, identify issues and troubleshoot application behaviour',
    ],
    year: '2026',
    stack: ['Laravel', 'PHP', 'MySQL', 'Leaflet (map)', 'HTML/CSS', 'JavaScript'],
    context: [
      'LegataLink: A Web-Based Reservation System for Legata Familia Resort',
      'Type: Capstone academic project, BS Information Technology, Cavite State University — Trece Martires City Campus',
      'Client: Legata Familia Resort, Tanza, Cavite',
      'Features visible on the live site: Home, Rooms, Resort Map, Gallery, Book Now, Sign In',
    ],
    approach: [
      'implemented authentication, RBAC, relational database design and secure booking workflows; integrated a resort map to improve navigation and user experience',
    ],
    evidence: [
      {
        src: '/images/projects/legatalink/home-hero.jpg',
        alt: 'The LegataLink home page with the "Where Every Stay Becomes a Story." hero over the resort\'s pool slides',
        width: 2000,
        height: 1148,
      },
    ],
    status: 'verified',
  },
];
