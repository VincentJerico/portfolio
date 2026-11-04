# Phase 6: Deploy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Production on `https://vincentjerico.vercel.app`, deployed from GitHub Actions only after every gate
passes (D1), showing the results of the run that deployed it on `/quality`, with Lighthouse budgets met on
production.

**Spec:** `docs/03-MASTER-PROMPT.md` Section 14 Phase 6; amended by `docs/04-DECISIONS.md` (D1 deploy from
Actions, C21 and C22 budgets). Decided 2026-11-04: no custom domain yet; Vercel project `vincentjerico` (C23); public previews (C24).

## Global Constraints

- Token auth only: `.env.cli` locally, GitHub secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` in CI.
  Never `vercel login`, never print a token. Auth failure means stop and say so.
- Vercel's git integration stays off (`vercel.json`); nothing deploys unless the gates passed.
- Deployed builds never contain `/selftest` (no `E2E_SELFTEST`).
- `NEXT_PUBLIC_SITE_URL` comes from the Vercel project's environment (pulled with `vercel pull`), so a domain
  change later is one `vercel env` update and a redeploy.
- Every deploy carries the CV PDF generated from the same build (C12).

## Review Focus

1. **Deploying after a failed gate.** Both deploy paths require every gate job to be `success`. Pinned by the
   job `if` conditions.
2. **Secrets on untrusted PRs.** Preview deploys skip forks and Dependabot (no Actions secrets there), and no
   PR-controlled text reaches a `run:` line.
3. **A cancelled production deploy.** Main pushes queue instead of cancelling each other; only PR runs cancel.
4. **Preview pages indexed by search engines.** Vercel marks preview URLs `noindex`; the preview Lighthouse run
   skips only the crawlability audit for that reason, production runs the full set.
5. **Production headers differ from the tested build** (Vercel can add or rewrite headers). The security header
   spec runs against production after deploy.

---

### Task 1: Link the Vercel project (needs `.env.cli`)

- `pnpm vercel:whoami` shows Vincent's personal account.
- `vercel project add vincentjerico`; `vercel:link` gains `--project vincentjerico`; `.vercel/` stays ignored.
- `vercel env add NEXT_PUBLIC_SITE_URL production preview` = `https://vincentjerico.vercel.app`.
- Turn on Web Analytics and Speed Insights for the project (otherwise their scripts 404 and Lighthouse
  best-practices fails on console errors).
- Preview protection off (C24): previews are public, `noindex`, and testable without a bypass secret.
- GitHub secrets set by Vincent (the agent may not write secrets): `VERCEL_TOKEN`, `VERCEL_ORG_ID`,
  `VERCEL_PROJECT_ID`.

### Task 2: Deploy script shared by both paths

- `scripts/vercel-deploy.sh <preview|production>`: `vercel pull`, `vercel build [--prod]`, start the built app,
  `pnpm cv`, copy `public/cv/*.pdf` into `.vercel/output/static/cv/`, `vercel deploy --prebuilt [--prod]`,
  print the URL to `$GITHUB_OUTPUT`. Fails loudly on any step.
- `deploy:prod` and `deploy:preview` package scripts call the same script with `.env.cli` loaded, so the
  emergency path also carries the PDF.

### Task 3: CI wiring

- Workflow env `NEXT_PUBLIC_SITE_URL=http://localhost:3210` moves to the jobs that test the local build.
- Concurrency: `cancel-in-progress` only for `pull_request`.
- `deploy-preview` (PR, same repo, not Dependabot, all gates `success`): deploy, then Lighthouse against the
  preview URL (`lighthouserc.preview.json`: same budgets, `is-crawlable` off), URL in the job summary.
- `quality-report` becomes `release` (main pushes, `!cancelled()`): build `quality.json` from the gates; when
  every gate passed, deploy production with that report inside, then run the production checks; finally commit
  the report (`[skip ci]`) whatever the gates said.
- Production checks: security header spec and a smoke spec (each route 200, `/quality` shows this run's commit,
  CV PDF served) against the production URL via `PLAYWRIGHT_BASE_URL` (no local web server), then Lighthouse
  against production with the full budgets.

### Task 4: `/quality` and docs

- `/quality` states the D1 note: the deployed build is rebuilt from the same commit after the gates pass and
  differs only in this report and the CV PDF.
- `docs/04-DECISIONS.md`: record the domain/project decision.
- Final reminders for Vincent: GitHub profile website field, profile README and LinkedIn link, data file
  Section 12 GitHub inconsistencies.

## Definition of Done

Production URL loads; `/quality` shows the latest run (commit matches the deployed commit); Lighthouse on
production meets budgets; preview deploy and its Lighthouse run green on the Phase 6 PR.
