<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules

This is Vincent Jerico Alcuran's portfolio. The spec is `docs/03-MASTER-PROMPT.md`, amended by
`docs/04-DECISIONS.md` (the decisions file wins where they disagree).

- **Data integrity.** Every rendered fact comes from `docs/01-PORTFOLIO-DATA.md`. Never invent, round,
  aggregate or embellish. Anything not `VERIFIED` stays hidden. Never render "TODO", placeholder text or lorem.
- **Client confidentiality.** No client names, regions, logos, URLs, staff names or screenshots anywhere,
  including metadata, alt text, OG images and commit messages.
- **No emojis** anywhere in the product.
- **Private files never committed:** `docs/*.pdf`, `assets-inbox/`, `.env.cli`, `.env*.local`,
  `tests/fixtures/client-denylist.txt`.
- **Done means gates pass.** Before claiming work is done, run:
  `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`
  (and `pnpm test:e2e` when UI changed).
- Node 22 (`.node-version`). Package manager: pnpm.

## Auth & deploys

Vercel account: Vincent's **personal** Vercel account (not a team or work scope). No Supabase in this repo.
All CLI credentials live in `.env.cli` at the repo root (gitignored). This repo uses token auth; there is no
logged-in state to rely on.

- Use the wrapper scripts for anything that touches Vercel: `pnpm vercel:link`, `pnpm deploy:preview`,
  `pnpm deploy`. They load `.env.cli` for you. Calling `vercel` bare will fail on auth.
- Production deploys normally run from GitHub Actions after every gate passes (D1); the local scripts are
  for setup and emergencies.
- Never run `vercel login`. A browser flow can't complete in an agent session, and any token it stored
  wouldn't survive to the next one.
- If a command fails on auth, or `.env.cli` is missing, stop and say so. Don't attempt a login, and don't work
  around it by hardcoding credentials.
- Never print, echo, or paste a token value. To check a variable is set, test it for non-emptiness.
