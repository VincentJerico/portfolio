# Portfolio

Vincent Jerico Alcuran's QA portfolio, live at <https://vincentjerico.vercel.app>. Next.js 16 (App Router),
React 19, Tailwind CSS v4 and MDX, tested with Vitest, Playwright, axe and Lighthouse CI, deployed on Vercel.

The working rules are in `AGENTS.md`, and the spec is `docs/03-MASTER-PROMPT.md` as amended by
`docs/04-DECISIONS.md`.

## Run it

Needs Node 22 (`.node-version`) and pnpm.

```bash
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL; everything else is optional
pnpm dev
```

| Variable                                                                                   | Purpose                                                  |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                                                     | Required. Canonical origin for metadata, sitemap and OG. |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Contact form (see below).                                |
| `CONTACT_KEY_SALT`                                                                         | Optional key for the rate-limit HMAC.                    |
| `GH_DATA_TOKEN`                                                                            | Optional. Read-only token for public repository data.    |

## Checks

Work is done when the gates pass:

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build
```

When the UI changes, also run `pnpm test:e2e`. It builds the site, serves it on port 3210 and runs Playwright
in Chromium, WebKit and a mobile Chrome profile. The suites cover the pages, axe on every route in both themes,
layout, security headers, and self-tests that prove the gates catch planted defects.

Other scripts:

- `pnpm contrast` prints the contrast of every colour token pair in both themes.
- `pnpm content:report` lists what the site hides and why, and spot-checks content against the data file.
- `pnpm cv` builds the CV PDF.

## Content

Every fact on the site comes from `docs/01-PORTFOLIO-DATA.md`. The data lives in `src/content/*.ts`, is
validated by the Zod schemas in `src/content/schema.ts`, and only entries marked verified render. Never invent,
round or embellish a fact, and never name a client.

**Adding a note.** Notes live at `/notes` and stay hidden (no nav entry, no sitemap entry, `/notes` returns 404)
until the first one is published.

1. Create `src/content/notes/<slug>.mdx`. Start headings at `##`: the page renders the title as the only `h1`.
2. Add an entry to `src/content/notes.ts` with the same `slug`, a `title`, a one-sentence `summary`, an ISO
   `date` and `status: 'published'` (or `'draft'`).
3. Run the gates. They check that each entry has a file and each file an entry, that the text has no
   placeholders, emojis or client terms, and that the page passes the layout and accessibility suites.

Notes are Vincent's own writing. The `selftest-pipeline` note exists only in the test build (`E2E_SELFTEST=1`).

**Contact form.** `/contact` shows a form only when the four contact variables are set. The Vercel KV names
(`KV_REST_API_URL`, `KV_REST_API_TOKEN`) work in place of the Upstash pair. Messages go out by email, limited to
5 per 10 minutes per IP, and nothing is stored. Upstash sees only an HMAC of the IP. Without the variables the
page keeps its email and social links.

## Layout

```text
src/app         routes (home, projects, work, about, skills, notes, quality, resume, contact)
src/components  content, layout, motion and UI components
src/content     the portfolio data and its schemas
src/lib         helpers (content queries, formatting, SEO, motion text, theme switch)
src/styles      design tokens (paper and slate themes)
tests           unit, e2e, a11y, security, smoke and self-test suites
scripts         CV, quality report, content and contrast reports, Vercel deploy
docs            the data, the spec, the decisions and the implementation plans
```

## Deploys

GitHub Actions runs every gate on pull requests, on pushes to `main` and weekly (Mondays 06:00 UTC).

- **Pull requests from this repository:** a preview deploy once every gate passes.
- **Pushes to `main`:**
  1. Deploys production, with the quality report and the CV from the same build.
  2. Runs smoke and security-header checks against the live site.
  3. Runs Lighthouse on the live site.
  4. Commits the refreshed report.

For setup or emergencies, `pnpm vercel:link`, `pnpm deploy:preview` and `pnpm deploy:prod` read token
credentials from `.env.cli`. Never run `vercel login`.

## Never committed

`docs/*.pdf`, `assets-inbox/`, `.env.cli`, `.env*.local` and `tests/fixtures/client-denylist.txt`.
