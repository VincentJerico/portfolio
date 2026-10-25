import type { z } from 'zod';
import type { Project } from './schema';

// docs/01-PORTFOLIO-DATA.md Section 3, display order 1-8. Data lines map to fields as follows:
// Target / Scope guard / Type / Client / Features -> context; CI / Patterns / milestones -> approach;
// Engineering decisions -> decisions (split at the first ": "); Limits / Caveat -> limits.
// Ticket bodies (steps, actual, impact, recommendation, trackedBy) quote each repo's docs/FINDINGS.md;
// tests/unit/tickets.test.ts checks every string against a copy in tests/fixtures/findings/.

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
        steps: [
          'Log in as `standard_user`, add any item, and press Tab repeatedly. Focus never lands on the cart icon.',
        ],
        actual:
          'The cart is `<a class="shopping_cart_link" role="button" aria-label="Cart, empty">` with no `href` and no `tabindex`, so it never gets keyboard focus. Tab order after login: Open Menu → Sort → 6 × (product image, product name, Add to cart) → X, Facebook, LinkedIn → wraps to the top. The cart is skipped.',
        impact:
          'A keyboard-only user can fill a cart but can never open it, so they can\'t check out. Screen reader users still hear "Cart, empty, button" when reading the page, so they are told about a button they can\'t Tab to.',
        recommendation:
          'The cart navigates, so make it a real link: `<a href="/cart.html" aria-label="Cart, 1 item">`. Drop `role="button"`.',
        trackedBy: 'F-1 · the cart is not reachable by keyboard',
        ticketStatus: 'Pinned by test',
        sourceHref: a11y('f-1--cart-is-not-reachable-by-keyboard'),
      },
      {
        id: 'F-2',
        title: 'No visible focus indicator anywhere',
        reference: '2.4.7 Focus Visible (AA)',
        severity: 'serious',
        evidenceIndex: 1,
        actual:
          'Every control computes `outline-style: none` with no `box-shadow`, border or background change on focus. `:focus-visible` matches, but nothing is drawn. Element screenshots taken before and after keyboard focus are pixel-identical for the Login button, Open Menu, the sort select, product links, Add to cart and the footer links.',
        impact: "Sighted keyboard users can't see where they are on the page.",
        recommendation:
          'Add a global `:focus-visible { outline: 3px solid #132322; outline-offset: 2px; }`. The indicator needs at least 3:1 contrast against adjacent colors (SC 1.4.11).',
        trackedBy: 'F-2 · the login button shows no visible focus indicator',
        ticketStatus: 'Pinned by test',
        sourceHref: a11y('f-2--no-visible-focus-indicator-anywhere'),
      },
      {
        id: 'F-3',
        title: "Menu toggle doesn't expose open/closed state",
        reference: '4.1.2 Name, Role, Value (A)',
        severity: 'serious',
        actual:
          '`<button id="react-burger-menu-btn">Open Menu</button>` has no `aria-expanded` or `aria-controls`, and its name stays "Open Menu" while the menu is open. The "Dynamic Catalog" item inside the menu does use `aria-expanded` and `aria-controls` correctly, so the pattern is already in the codebase.',
        impact:
          "Screen reader users aren't told whether the menu opened, or which content it controls.",
        recommendation: '`aria-expanded={isOpen}` and `aria-controls="<menu id>"` on the toggle.',
        trackedBy: 'F-3 · the menu button does not expose its expanded state',
        ticketStatus: 'Pinned by test',
        sourceHref: a11y('f-3--menu-toggle-hides-its-state'),
      },
      {
        id: 'F-7',
        title: 'Focus lands on links hidden behind the open menu',
        reference: '2.4.11 Focus Not Obscured (AA)',
        severity: 'serious',
        evidenceIndex: 0,
        actual:
          "Focus is not contained in the open menu. After the last item and the Close button, Tab moves into the page underneath. On Tab 7, focus lands on the first product's image link (x 111–261). The 300 px menu panel covers that link completely: `elementFromPoint` at its four corners and centre returns the menu every time.",
        impact:
          "A sighted keyboard user loses track of focus completely, which is worse than F-2 because there is nothing to see even with a focus style. They can also activate a control they can't see.",
        recommendation:
          'Treat the open menu as a modal: make the rest of the page `inert` (or trap focus), and add `aria-modal="true"`. Alternatively, close the menu when focus leaves it.',
        trackedBy: 'F-7 · Tab moves focus onto a link hidden behind the open menu',
        ticketStatus: 'Pinned by test',
        sourceHref: a11y('f-7--focus-moves-behind-the-open-menu'),
      },
      {
        id: 'F-4',
        title: 'Closing the menu drops focus to `<body>`',
        reference: '2.4.3 Focus Order (A)',
        severity: 'moderate',
        actual:
          'Escape closes the menu (good), but focus ends on `<body>`. Timeline after Escape: `0 ms → Open Menu button`, `50 ms → BODY`, and it stays on `BODY`. Closing with the Close Menu button behaves the same way. Something blurs the toggle right after the library restores focus to it.',
        impact:
          'A keyboard user is sent back to the top of the page and has to Tab through from the start. Screen readers may announce nothing at all.',
        recommendation:
          'After the close transition ends, focus the toggle and make sure nothing blurs it afterwards.',
        trackedBy: 'F-4 · closing the menu with Escape drops focus to <body>',
        ticketStatus: 'Pinned by test',
        sourceHref: a11y('f-4--closing-the-menu-loses-focus'),
      },
      {
        id: 'F-5',
        title: 'Page titles are `<span>`s; pages have no headings',
        reference: '1.3.1 Info & Relationships (A)',
        severity: 'moderate',
        actual:
          'The visual page titles "Products", "Your Cart" and "Checkout: Your Information" are `<span class="title">`, and the "Swag Labs" logo is a `<div>`. The inventory, cart and checkout pages have zero heading elements. The login page has only two `<h4>`s, with no `h1`–`h3`.',
        impact:
          "Screen reader users navigate by headings (the H key, the rotor). Here they get nothing, so they can't jump to content or learn the page structure.",
        recommendation:
          '`<h1 class="title">Products</h1>` (and the same on every page). On login, add an `h1` and change the credential boxes to `h2`.',
        trackedBy: 'F-5 · the page title "Products" is not a heading',
        ticketStatus: 'Pinned by test',
        sourceHref: a11y('f-5--page-titles-are-not-headings'),
      },
      {
        id: 'F-6',
        title: 'Placeholder is the only visible label',
        reference: '3.3.2 Labels or Instructions (A)',
        severity: 'moderate',
        actual:
          'Username, Password, First Name, Last Name and Zip/Postal Code have a `placeholder` and an `aria-label` but no `<label>`. The accessible name exists, so axe passes. The visible label disappears as soon as the user types.',
        impact:
          'Users with memory or cognitive disabilities, and anyone who gets interrupted, lose track of what a filled field is for. Placeholder text is also usually low-contrast.',
        recommendation:
          'Add a visible `<label for="user-name">Username</label>` for every field and keep the placeholder for examples only.',
        trackedBy: 'F-6 · login fields have placeholders but no visible labels',
        ticketStatus: 'Pinned by test',
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
        actual:
          "No response sets `Content-Security-Policy`, on the home page, the product search API or a product record. ZAP's rule 10038 reports the same thing.",
        impact:
          'A CSP limits where scripts can load from. Without one, any XSS bug can run arbitrary script, and S-6 means that script can read the session token.',
        recommendation:
          "Start with a report-only policy, such as `Content-Security-Policy-Report-Only: default-src 'self'`, review the reports, then enforce it.",
        ticketStatus: 'Pinned by test',
        sourceHref: sec('s-1--no-content-security-policy'),
      },
      {
        id: 'S-2',
        title: 'No `Referrer-Policy` header',
        reference: 'A05 Security Misconfiguration',
        severity: 'low',
        trackedBy: 'tests/juice-shop.headers.spec.ts',
        actual: 'No `Referrer-Policy` header, so the browser falls back to its default.',
        impact:
          'Full URLs, including query strings, can leak to third-party sites in the `Referer` header.',
        recommendation: '`Referrer-Policy: strict-origin-when-cross-origin`.',
        ticketStatus: 'Pinned by test',
        sourceHref: sec('s-2--no-referrer-policy'),
      },
      {
        id: 'S-3',
        title: 'Deprecated `Feature-Policy` only, no `Permissions-Policy`',
        reference: 'A05 Security Misconfiguration',
        severity: 'low',
        trackedBy: 'tests/juice-shop.headers.spec.ts',
        actual:
          "The app sends `Feature-Policy: payment 'self'`. Browsers replaced that header with `Permissions-Policy`, and ZAP's rule 10063 flags its absence.",
        recommendation: 'Send the same intent as `Permissions-Policy: payment=(self)`.',
        ticketStatus: 'Pinned by test',
        sourceHref: sec('s-3--feature-policy-instead-of-permissions-policy'),
      },
      {
        id: 'S-4',
        title: '`Access-Control-Allow-Origin: *` on every response',
        reference: 'A05 Security Misconfiguration',
        severity: 'medium',
        trackedBy: 'tests/juice-shop.headers.spec.ts',
        actual:
          "Every response, API responses included, sends `Access-Control-Allow-Origin: *`. ZAP's rule 10098 flags the same thing.",
        impact:
          "Any website a user visits can read these responses from their browser. The wildcard doesn't send cookies, so this mostly exposes data that doesn't need a login, but it removes a layer of protection the API doesn't need to give up.",
        recommendation:
          "Allow only the app's own origin, or omit the header where cross-origin access isn't needed.",
        ticketStatus: 'Pinned by test',
        sourceHref: sec('s-4--wildcard-cors'),
      },
      {
        id: 'S-5',
        title: 'Unknown API route returns a 500 page with a stack trace',
        reference: 'A05 Security Misconfiguration',
        severity: 'low',
        trackedBy: 'tests/juice-shop.headers.spec.ts',
        actual:
          '`GET /api/DoesNotExist` returns a 500 page that includes a stack trace with internal paths such as `/juice-shop/node_modules/express/lib/router/layer.js:95`.',
        impact:
          'It tells an attacker the framework, its layout on disk and the libraries in use. An unknown route should be a 404, not a server error.',
        recommendation:
          'Return 404 for unknown routes and use a production error handler that never renders stack traces.',
        ticketStatus: 'Pinned by test',
        sourceHref: sec('s-5--stack-trace-on-an-unknown-api-route'),
      },
      {
        id: 'S-6',
        title: 'The login `token` cookie is set without `HttpOnly`',
        reference: 'A07 Identification and Auth Failures',
        severity: 'medium',
        trackedBy: 'tests/juice-shop.session.spec.ts',
        actual:
          "After logging in through the login page with a throwaway local account, the browser holds a `token` cookie with `HttpOnly` off. `SameSite=Lax` is fine. `Secure` doesn't apply, because the local app is served over plain HTTP.",
        impact:
          'Any script running on the page can read the session token. Combined with an XSS bug, that means session theft.',
        recommendation:
          "Set the session cookie from the server with `HttpOnly`, `SameSite=Lax` and, over HTTPS, `Secure`. The page shouldn't need to read the token itself.",
        ticketStatus: 'Pinned by test',
        sourceHref: sec('s-6--session-token-cookie-readable-by-scripts'),
      },
      {
        id: 'S-7',
        title: 'Order history without a login returns a 500 with a stack trace',
        reference: 'A05 Security Misconfiguration',
        severity: 'low',
        trackedBy: 'tests/juice-shop.session.spec.ts',
        actual:
          "`GET /rest/order-history` without a token returns a 500 page with a stack trace. The page title also echoes the requester's IP address.",
        impact:
          'Same information leak as S-5. A missing login should get a plain 401, like the basket, users, cards and addresses endpoints already return.',
        recommendation: 'Check authentication before the handler runs and return 401.',
        ticketStatus: 'Pinned by test',
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
        actual:
          'Trivy found 130 unique high or critical CVEs in the image (46 critical, 84 high). Most are in Node.js packages. The most affected are `vm2` (45), `multer` (10), `libssl3` (9), `tar` (9) and `handlebars` (7). `vm2` is a sandboxing library that is no longer maintained.',
        recommendation:
          'For a real app, replace `vm2` (it has no fixed versions), then upgrade the remaining packages and the base image.',
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
        steps: ['`k6 run -e LOGIN_RATE=60 experiments/auth-contention.js`'],
        actual:
          'Readers call `GET /api/tasks` at a steady 40 requests per second for 60 seconds. Between 20s and 40s, a second group of users signs in. The readers never touch the login endpoint, yet their latency follows the login rate',
        impact:
          'A login burst (Monday morning, everyone signing in again after a deploy) slows the whole API, not just login.',
        recommendation:
          "Use the async `crypto.scrypt` (promise or callback). It runs on libuv's thread pool, so hashes stop blocking requests and can run in parallel.",
        sourceHref: perf('perf-001-login-traffic-stalls-every-other-request'),
      },
      {
        id: 'PERF-002',
        title: '`GET /api/tasks` has no pagination: 1.24 MB per board load at 10,000 tasks.',
        severity: 'low',
        steps: ['`k6 run experiments/list-growth.js`'],
        actual: '`GET /api/tasks` returns every task the user owns, every time.',
        impact:
          'The payload is the risk: 1.24 MB per board load is about a full second of download on a 10 Mbps mobile connection, before the browser renders 10,000 rows.',
        recommendation:
          'add `limit` and `offset` (or a cursor) with a sensible default, and let the client filter by `status`. Keep this experiment as a regression check.',
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
