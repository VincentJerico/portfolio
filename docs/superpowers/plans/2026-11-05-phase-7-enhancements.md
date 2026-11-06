# Phase 7: Optional Enhancements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Three requested extras: live GitHub data on project pages, a contact form that emails Vincent, and a
`/notes` section for his QA write-ups that stays hidden until the first note exists.

**Architecture:** GitHub data is fetched server-side at build time and on a daily ISR refresh, validated with Zod,
and simply not shown when unavailable. The contact form is a React 19 `useActionState` form posting to a Next.js
Server Action that validates with Zod, rate-limits per IP in Upstash Redis, and sends through Resend's HTTP API;
nothing is stored. Notes are MDX files loaded by dynamic import, listed in a typed registry that drives the
nav, sitemap and palette. The CI test build (`E2E_SELFTEST=1`) swaps every external service for a deterministic
stand-in, so tests never touch GitHub, Upstash or Resend.

**Tech Stack:** Next.js 16.4 App Router (`cacheComponents` off, classic ISR), React 19.3 `useActionState`, Zod 4,
`@upstash/ratelimit` + `@upstash/redis`, Resend REST API via `fetch`, `@next/mdx` + `@mdx-js/loader` +
`@mdx-js/react` + `@types/mdx`, Vitest, Playwright, axe.

**Spec:** `docs/03-MASTER-PROMPT.md` Section 14 Phase 7, Section 7.9 (`/contact`), Section 11 (env vars), amended by
`docs/04-DECISIONS.md`. Decided with Vincent on 2026-11-05: all three extras; rate limit in Upstash Redis;
messages to `vincentjericoalcuran@gmail.com`; a read-only GitHub token for the API.

## Global Constraints

- Every rendered fact comes from `docs/01-PORTFOLIO-DATA.md`, except the GitHub fields, which come live from the
  GitHub API as the spec's Phase 7 allows. Never render "TODO", placeholder text or lorem. No emojis anywhere.
- No client names, regions, logos, URLs or staff names anywhere, including note content and email subjects.
- Contact form (spec Phase 7, verbatim): "honeypot field, server-side Zod validation, rate limit per IP, visible
  labels, success/error states announced, no stored messages".
- `RESEND_API_KEY` and `CONTACT_TO_EMAIL` are server-only (spec Section 11). Never log message contents or
  addresses.
- Read the bundled Next.js guide before writing code: `node_modules/next/dist/docs/01-app/02-guides/forms.md`,
  `server-actions.md`, `incremental-static-regeneration.md`, `mdx.md`.
- `cacheComponents` stays off (existing decision); ISR uses `export const revalidate`.
- Deployed builds never set `E2E_SELFTEST`, so stand-ins never ship. The deploy script's `unset` clears only the
  CI shell; `vercel pull` loads the project environment, so the Vercel project env must never contain it.
- WCAG 2.2 AA: axe zero violations both themes; every new control keyboard operable, visible focus, works at 320 px.
- Done means: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.

## Review Focus

1. **A visitor without JavaScript submits the contact form.** It must still post and show the result (the
   server action renders the state). Pinned in Task 3 by a `javaScriptEnabled: false` test.
2. **GitHub is down, slow or rate-limited at build or refresh time.** The build must not fail and the page must
   not show a wrong or empty date; the fields are omitted. Pinned in Task 1 by unit tests for a non-200, a
   timeout and malformed JSON.
3. **A bot fills every field, including the honeypot.** It gets the normal success state (no signal to retry)
   and no email is sent. Pinned in Task 2.
4. **Production is missing a contact secret.** The form would silently disappear. Pinned in Task 3 by a
   production smoke test that requires the form on the deployed `/contact`.
5. **The first real note is added with a typo in its registry entry** (slug without a file, or a file without an
   entry). Pinned in Task 4 by a unit test pairing registry slugs with `src/content/notes/*.mdx`.

---

### Task 1: Live GitHub data on project pages

**Files:**
- Create: `src/lib/github.ts`, `src/lib/github-fixture.ts`, `tests/unit/github.test.ts`
- Modify: `src/app/projects/[slug]/page.tsx` (fetch + render + `export const revalidate = 86400`),
  `tests/e2e/projects.spec.ts`, `.env.example`
- Docs: `docs/04-DECISIONS.md` C28

**Interfaces:**
- Produces: `type RepoMeta = { lastCommit: string /* YYYY-MM-DD */; topics: string[] }`,
  `fetchRepoMeta(repoUrl: string, opts?: { fetchImpl?: typeof fetch; token?: string }): Promise<RepoMeta | null>`,
  `repoMeta(repoUrl: string): Promise<RepoMeta | null>` (picks the fixture when `process.env.E2E_SELFTEST === '1'`,
  else live with `process.env.GH_DATA_TOKEN`).

- [ ] **Step 1: Write failing unit tests** in `tests/unit/github.test.ts` with an injected `fetchImpl`:
  - `parses last commit date and topics` — repo response `{ topics: ['playwright','qa'], default_branch: 'main' }`
    and commits response `[{ commit: { committer: { date: '2026-11-02T09:15:00Z' } } }]` →
    `{ lastCommit: '2026-11-02', topics: ['playwright','qa'] }`.
  - `requests both endpoints with the token` — expects
    `https://api.github.com/repos/VincentJerico/accessibility-testing` and
    `.../commits?sha=main&per_page=1`, header `Authorization: Bearer t0k`, `Accept: application/vnd.github+json`,
    and `next: { revalidate: 86400 }` on each call.
  - `returns null on a non-200`, `returns null on malformed JSON`, `returns null when fetch rejects (timeout)`.
  - `drops topics that are not GitHub topic slugs` — `['ok-topic', 'Bad Topic!']` → `['ok-topic']`.
  - `returns null for a non-GitHub repo URL`.
- [ ] **Step 2: Run** `pnpm exec vitest run tests/unit/github.test.ts` — expect FAIL (module missing).
- [ ] **Step 3: Implement `src/lib/github.ts`.** Parse owner/name from `https://github.com/<owner>/<name>`; two
  `fetch` calls with `AbortSignal.timeout(5000)` and `next: { revalidate: 86400 }`; validate both bodies with Zod;
  topics filtered by `/^[a-z0-9][a-z0-9-]{0,49}$/`; any error → `null` (never throw: a failed refresh shows no
  GitHub fields rather than failing the page). `github-fixture.ts` exports a map from repo URL to `RepoMeta`
  with obviously test values (`lastCommit: '2000-01-01'`, `topics: ['fixture-topic']`) for every project with a
  `repo`.
- [ ] **Step 4: Run** the unit tests — expect PASS.
- [ ] **Step 5: Render on `/projects/[slug]`.** Add `export const revalidate = 86400`. When `project.repo` and
  `repoMeta` is non-null, show in the report header metadata: "Last commit" with `formatDay(lastCommit)` inside a
  `<time dateTime>`, and topics as a list labelled "Topics" (`<ul aria-label="GitHub topics">`) styled like the
  existing stack tags. A single line under them, `text-sm text-ink-muted`: "From GitHub, refreshed daily."
  Nothing renders when null.
- [ ] **Step 6: E2E** in `tests/e2e/projects.spec.ts`: on `/projects/accessibility-testing` the test build shows
  `Last commit` with `1 Jan 2000` (fixture) and a `GitHub topics` list containing `fixture-topic`; on a project
  without `repo` (LegataLink) neither appears.
- [ ] **Step 7: Config.** `.env.example`: `GH_DATA_TOKEN=` with a comment "Optional. Fine-grained, public
  repositories read-only. Server only." (Actions secret names cannot start with `GITHUB_`.) Decision C28 in
  `docs/04-DECISIONS.md`: GitHub fields come from the API, refreshed daily, omitted when unavailable; test builds
  use a fixture.
- [ ] **Step 8: Gates** (`pnpm lint && pnpm format:check && pnpm typecheck && pnpm test`) and **commit**
  `feat(projects): show last commit and topics from GitHub, refreshed daily`.

### Task 2: Contact submission core (validation, rate limit, mail)

**Files:**
- Create: `src/lib/contact/schema.ts`, `src/lib/contact/rate-limit.ts`, `src/lib/contact/mailer.ts`,
  `src/lib/contact/config.ts`, `src/lib/contact/submit.ts`, `src/app/contact/actions.ts`,
  `tests/unit/contact.test.ts`
- Modify: `package.json` (add `@upstash/ratelimit`, `@upstash/redis`)

**Interfaces:**
- Produces:
  - `ContactInput = z.object({ name: z.string().trim().min(1).max(100), email: z.email().max(254),
    message: z.string().trim().min(10).max(5000) })`; honeypot field name `website`.
  - `type ContactState = { status: 'idle' } | { status: 'invalid'; fieldErrors: Partial<Record<'name'|'email'|'message', string>>; values: { name: string; email: string; message: string } } | { status: 'sent' } | { status: 'rate-limited' } | { status: 'failed' }`
  - `interface RateLimiter { limit(key: string): Promise<boolean /* allowed */> }`; `upstashLimiter(url, token)`
    (sliding window, 5 per 10 minutes, prefix `contact`); `memoryLimiter(max = 5, windowMs = 600_000)`.
  - `interface Mailer { send(msg: { name: string; email: string; message: string }): Promise<void> }`;
    `resendMailer(apiKey, to)` (POST `https://api.resend.com/emails`, from
    `Portfolio contact <onboarding@resend.dev>`, `to`, `reply_to: email`, subject
    `Portfolio contact from ${name}`, plain-text body; throws on non-2xx); `testMailer()` (resolves, but throws
    when the message contains `e2e-mailer-failure`).
  - `contactConfig(env = process.env): { limiter: RateLimiter; mailer: Mailer } | null` — test build
    (`E2E_SELFTEST === '1'`): `memoryLimiter` + `testMailer`; otherwise needs `RESEND_API_KEY`,
    `CONTACT_TO_EMAIL`, and `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (fallback `KV_REST_API_URL`/
    `KV_REST_API_TOKEN`), else `null`.
  - `submitContact(form: FormData, clientKey: string, deps: { limiter; mailer }): Promise<ContactState>` (pure,
    unit-tested).
  - `src/app/contact/actions.ts` (`'use server'`): `sendContact(prev: ContactState, form: FormData): Promise<ContactState>`
    — derives `clientKey` from the first `x-forwarded-for` entry (fallback `x-real-ip`, then `unknown`); in test
    builds appends `:${x-e2e-client}` so parallel tests get separate buckets; returns `failed` when
    `contactConfig()` is null.

- [ ] **Step 1: Write failing unit tests** (`tests/unit/contact.test.ts`, fakes for limiter and mailer):
  - `rejects empty and malformed fields with a message per field` → `invalid` with `fieldErrors.name`,
    `.email`, `.message` set and `values` echoing the input.
  - `honeypot filled: reports sent, sends nothing, does not count against the limit`.
  - `sends once and reports sent for valid input` (mailer called with trimmed values).
  - `rate-limited after the limiter refuses` → `rate-limited`, mailer not called.
  - `mailer failure reports failed` and does not throw.
  - `memoryLimiter allows 5 then refuses the 6th within the window, per key`.
  - `contactConfig returns null without the secrets and stand-ins in the test build`.
  - `resendMailer posts the expected request` (injected fetch; asserts URL, `Authorization: Bearer`, JSON body
    fields above) `and throws on a 4xx`.
- [ ] **Step 2: Run** `pnpm exec vitest run tests/unit/contact.test.ts` — expect FAIL.
- [ ] **Step 3: Implement** the modules per the Interfaces block. Order inside `submitContact`: honeypot →
  validation → limiter → mailer. Field-error copy: name "Enter your name.", email "Enter a valid email
  address.", message "Write at least 10 characters." (and "Keep it under 5,000 characters." for too long).
- [ ] **Step 4: Run** unit tests — expect PASS; `pnpm typecheck`.
- [ ] **Step 5: Commit** `feat(contact): validate, rate-limit and send contact messages`.

### Task 3: Contact form UI, page and checks

**Files:**
- Create: `src/components/contact/ContactForm.tsx` (`'use client'`), `tests/e2e/contact-form.spec.ts`
- Modify: `src/app/contact/page.tsx`, `tests/smoke/deployment.spec.ts`, `.env.example`, `README.md`,
  `docs/04-DECISIONS.md` (C29)

**Interfaces:**
- Consumes: `sendContact`, `ContactState`, `contactConfig` (Task 2).
- Produces: `<ContactForm />`; the page renders a "Send a message" section only when `contactConfig() !== null`.

- [ ] **Step 1: Write failing E2E tests** (`tests/e2e/contact-form.spec.ts`; each test sets
  `page.setExtraHTTPHeaders({ 'x-e2e-client': crypto.randomUUID() })`):
  - `labels are visible and fields are required` — `getByLabel('Name')`, `'Email'`, `'Message'` visible; honeypot
    not focusable (Tab order skips it) and `aria-hidden`.
  - `invalid submit announces errors and focuses the first invalid field` — submit empty; an element with
    `role="alert"` contains "Check the highlighted fields"; Name has `aria-invalid="true"` and
    `aria-describedby` pointing at "Enter your name."; focus is on Name.
  - `valid submit announces success and clears the form` — `role="status"` contains "Message sent. I'll reply
    by email." and fields are empty.
  - `sixth message within ten minutes is refused` — five valid sends, the sixth shows `role="alert"` "Too many
    messages. Try again in a few minutes, or email me directly."
  - `mail failure is announced` — message containing `e2e-mailer-failure` shows "Your message could not be sent.
    Email me directly at" plus the address.
  - `works without JavaScript` — `test.use({ javaScriptEnabled: false })`, valid submit shows the success text.
  - axe: zero violations on `/contact` with the error state showing, both themes (reuse the existing axe helper).
- [ ] **Step 2: Run** `pnpm exec playwright test tests/e2e/contact-form.spec.ts --project=chromium` — FAIL.
- [ ] **Step 3: Implement `ContactForm`** with `useActionState(sendContact, { status: 'idle' })`, `<form action>`
  (progressive enhancement), visible `<label>`s, `name`/`email`/`message` with `autocomplete` `name`/`email`,
  `required`, `maxLength` 100/254/5000; honeypot `website` inside a visually hidden wrapper with
  `aria-hidden="true"`, `tabIndex={-1}`, `autoComplete="off"`; submit button text "Send message" /
  "Sending…" while pending (disabled). Status region `role="status"` for success; `role="alert"` for errors;
  after an `invalid` result move focus to the first invalid field (`useEffect` on state). Reuse the existing
  `Button` styles. Re-fill `defaultValue` from `state.values` on `invalid`.
- [ ] **Step 4: Page.** Add the section above "Elsewhere" in `src/app/contact/page.tsx`, heading
  "Send a message", one line "Messages go straight to my inbox; nothing is stored on this site.", then the form.
- [ ] **Step 5: Run** the E2E spec on all three projects — PASS. Update any shell tab-stop counts the new
  controls change (the shell spec counts only shell stops, so expect none).
- [ ] **Step 6: Production smoke** in `tests/smoke/deployment.spec.ts`: `/contact` HTML contains the
  "Send a message" heading (catches a missing secret after deploy).
- [ ] **Step 7: Docs.** `.env.example`: `RESEND_API_KEY=`, `CONTACT_TO_EMAIL=`, `UPSTASH_REDIS_REST_URL=`,
  `UPSTASH_REDIS_REST_TOKEN=` (server only). README: one paragraph on the form and which env vars enable it.
  Decision C29: Upstash rate limit 5 per 10 minutes per IP; Resend onboarding sender to the account address;
  form hidden when unconfigured; test build uses stand-ins.
- [ ] **Step 8: Gates incl. `pnpm test:e2e`, commit** `feat(contact): contact form with announced states`.

### Task 4: `/notes` (MDX), hidden until the first note

**Files:**
- Create: `src/mdx-components.tsx`, `src/content/notes.ts` (registry), `src/content/notes/selftest-pipeline.mdx`,
  `src/app/notes/page.tsx`, `src/app/notes/[slug]/page.tsx`, `tests/unit/notes.test.ts`,
  `tests/e2e/notes.spec.ts`
- Modify: `next.config.ts` (wrap with `createMDX()`; no plugins), `package.json`, `src/content/schema.ts`
  (`Note`), `src/lib/nav.ts` (add `{ href: '/notes', label: 'Notes', spec: 'notes/' }` after Quality),
  `src/lib/nav-items.ts`, `src/lib/seo.ts` (`sitemapEntries`), `src/lib/site-index.ts`, `tests/e2e/shell.spec.ts`
  (count `navItems()` instead of `NAV_ITEMS`), content guard tests (scan `src/content/notes/*.mdx`)

**Interfaces:**
- Produces: `Note = z.object({ slug, title, summary, date: isoDate, status: z.enum(['published','draft','selftest']) })`;
  `notes: Note[]`; `visibleNotes(selftest = process.env.E2E_SELFTEST === '1'): Note[]` (published, plus
  `selftest` entries in the test build, newest first). `navItems()` and `sitemapEntries()` drop `/notes` when
  `visibleNotes()` is empty. Both are evaluated on the server only (layout, sitemap); confirm no client import.

- [ ] **Step 1: Write failing unit tests** (`tests/unit/notes.test.ts`):
  - `every registry slug has an MDX file and every MDX file has an entry` (readdir of `src/content/notes`).
  - `visibleNotes hides drafts and the selftest note outside the test build`.
  - `navItems and sitemap omit /notes when no note is visible` and include `/notes` plus `/notes/<slug>` when
    one is.
  - The existing placeholder, emoji and denylist guards also run over each `.mdx` file's text.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement.** Install `@next/mdx @mdx-js/loader @mdx-js/react @types/mdx`; `createMDX()` in
  `next.config.ts` keeping the existing headers and turbopack rules; `src/mdx-components.tsx` maps `h2`, `h3`, `p`,
  `ul`, `ol`, `a`, `code`, `pre`, `blockquote` to the site's existing prose styles (no new design). `/notes`
  lists `visibleNotes()` (title link, date, summary) and calls `notFound()` when empty; `/notes/[slug]` uses
  `generateStaticParams` from `visibleNotes()`, `dynamicParams = false`, dynamic `import(`@/content/notes/${slug}.mdx`)`,
  renders one `<h1>` from the registry title, the date, and the MDX body; `pageMetadata` for both. The selftest
  note's text: "This note exists only in the CI test build. It proves the notes pipeline renders MDX: headings,
  lists, links and code." followed by one `##` heading, a two-item list, a link to `/quality` and an inline code
  span.
- [ ] **Step 4: E2E** (`tests/e2e/notes.spec.ts`, test build): `/notes` lists the selftest note; the note page
  has one `h1`, renders the list and code, passes axe in both themes, no overflow at 320 px; the sidebar shows
  Notes. Smoke (deployed): `/notes` returns 404 and the sitemap has no `/notes` while no note is published.
- [ ] **Step 5: Run** unit + E2E — PASS. Update `tests/e2e/shell.spec.ts` tab-stop count to use `navItems()`.
- [ ] **Step 6: Docs.** README: "Adding a note" (create `src/content/notes/<slug>.mdx`, add the registry entry
  with `status: 'published'`, gates check the rest). Decision C30: notes hidden until the first published note;
  content is Vincent's own writing only.
- [ ] **Step 7: Gates incl. E2E, commit** `feat(notes): MDX notes section, hidden until the first note`.

### Task 5: Configure services and release

- [ ] **Vincent creates and stores the secrets** (the agent may not write secrets): Resend API key (account
  `vincentjericoalcuran@gmail.com`), Upstash Redis via the Vercel Marketplace (adds its env vars to the project),
  `CONTACT_TO_EMAIL`, and the fine-grained read-only `GH_DATA_TOKEN`, each as Vercel env vars for production and
  preview via `vercel env add … --sensitive`.
- [ ] Open the Phase 7 PR; preview checks green (smoke now requires the contact form, so a missing secret fails
  here first).
- [ ] Merge; production release green; verify a real message arrives, the sixth within ten minutes is refused,
  and a project page shows a real last-commit date.

## Definition of Done

Project pages show the real last commit and topics from GitHub (omitted when GitHub is unavailable); `/contact`
sends a real message to `vincentjericoalcuran@gmail.com`, refuses the sixth within ten minutes, works without
JavaScript and announces every state; `/notes` is hidden in production until the first published note and
proven in the test build; all gates and the production release green.
