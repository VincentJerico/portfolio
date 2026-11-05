# Portfolio

Vincent Jerico Alcuran's QA portfolio (Next.js, Tailwind, Playwright). See `AGENTS.md` for the working rules.

## Contact form

The `/contact` page shows a "Send a message" form only when `RESEND_API_KEY`, `CONTACT_TO_EMAIL`,
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are all set (see `.env.example`). The Vercel KV
integration's names, `KV_REST_API_URL` and `KV_REST_API_TOKEN`, work in place of the two Upstash variables.
Messages are sent by email and rate-limited to 5 per 10 minutes per IP; nothing is stored. Upstash only sees an
HMAC of the IP, keyed by the optional `CONTACT_KEY_SALT` (derived from the Redis token when unset). Without the
variables the form is hidden and the page keeps its email and social links.

## Adding a note

Notes live at `/notes` and stay hidden (no nav entry, no sitemap entry, `/notes` returns 404) until the first
published note exists.

1. Create `src/content/notes/<slug>.mdx` with the note's body (Markdown plus MDX). Do not repeat the title: the
   page renders it as the only `h1`, so start headings at `##`.
2. Add an entry to `src/content/notes.ts` with the same `slug`, a `title`, a one-sentence `summary`, an ISO
   `date` and `status: 'published'`. Use `status: 'draft'` to keep it unpublished.
3. Run the gates. They check that every entry has a file and every file an entry, that the text has no
   placeholder markers, emojis or client terms, and that the page passes the layout and accessibility suites.

Notes are Vincent's own writing only. The `selftest-pipeline` note exists only in the CI test build
(`E2E_SELFTEST=1`) so the pipeline is tested before any real note exists.
