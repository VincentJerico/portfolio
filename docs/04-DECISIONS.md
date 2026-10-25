# Decisions log

Addendum to `03-MASTER-PROMPT.md` (the spec). Where this file and the spec disagree, this file wins.
Each entry says who decided: **Vincent** (answered in chat) or **Claude's call** (Vincent can reverse it).

---

## Answered by Vincent, 2026-10-24

### D1. Deploy from GitHub Actions, not Vercel's git integration

Vincent: "whichever is the best". Chosen: deploy from GitHub Actions with the Vercel CLI.

Why: the spec needs two things Vercel's own build servers can't do cleanly: generate the CV PDF with
Playwright (7.7) and include CI results in `quality.json` (12.6). Deploying from Actions also means nothing
ships unless every gate passed.

How it works:

- Vercel's automatic git deploys are turned off for this project (`vercel.json` `git.deploymentEnabled: false`).
- PRs: after all gates pass, a `deploy` job runs `vercel build` then `vercel deploy --prebuilt` (preview).
- `main`: after all gates pass, the job first aggregates the run into `src/generated/quality.json`, then
  `vercel build --prod`, then starts the built app and runs `scripts/build-cv-pdf.ts`, copies the PDF into the
  prebuilt output, and runs `vercel deploy --prebuilt --prod`. Finally it commits `quality.json` with
  `chore(quality): update report [skip ci]`.
- Result: production shows the results of the run that deployed it, not the previous run (an improvement on
  spec 12.6). The build that was tested and the build that was deployed differ only in `quality.json` and the
  PDF; this is stated on `/quality`.
- GitHub secrets needed: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `CLIENT_DENYLIST`.

### D2. Repository

`VincentJerico/portfolio`, public.

### D3. Commit identity

Repo-local git config: `Vincent Jerico Alcuran <vincentjericoalcuran@gmail.com>`. Commits made by Claude also
carry a `Co-Authored-By: Claude` trailer.

### D4. ui-ux-pro-max

Installed as a user-level skill (`~/.claude/skills/ui-ux-pro-max`) from
`github.com/nextlevelbuilder/ui-ux-pro-max-skill` (v2.15.0, commit `d14efff`). Its scripts were read before
install: local CSV search only, no network or shell calls. Used for all UI work in Phases 3 and 3b. Its
generic palette and font suggestions do not override the spec's tokens (4.1).

### D5. Client case studies: no regions

Regions are removed from what the site shows: "Office-furniture distribution", "Fine-jewelry retail" and the
multi-company group without location. Because the repository is public, the regions are removed from the data
file as well (Section 5 rule added).

**Claude's call, pending Vincent:** the `/work` confidentiality note drops the words "with BossLabs.AI approval"
until Vincent confirms BossLabs.AI itself (not just Vincent) signed off. Note reads: "Client names, data and
screenshots are withheld."

### D6. Private deny-list

Claude creates `tests/fixtures/client-denylist.txt` (git-ignored) and the `CLIENT_DENYLIST` GitHub secret.
Contents: the client names (Vincent to supply in chat), the postal code and the street address from the CV.
These values never appear in committed files, commit messages or chat summaries.

### D7. Spoken languages

English, Tagalog. Added to the data file (Section 1, VERIFIED). Shown on `/about` and `/resume`.
Schema extension: `Profile.languages: z.array(z.string()).default([])`.

### D8. Still to follow

LinkedIn URL, certification credential URLs, more LegataLink screens, the 13th checklist area. All stay hidden
until supplied.

---

## Claude's calls (reversible)

| # | Decision | Why |
| --- | --- | --- |
| C1 | Node 22 via fnm for this repo (`.node-version` = 22); machine default stays 24 | Spec 3, matches his repos |
| C2 | Tablet (640–1023px) uses the same drawer as mobile, not an icon rail | One keyboard pattern below 1024px; fewer focus edge cases |
| C3 | `Project.year: z.string().regex(/^\d{4}$/).optional()` added | LegataLink has a year (2026) but no full dates |
| C4 | Category chips use the data file's wording ("API / Contract", "UI Automation / Framework", "Portfolio hub", "Capstone") mapped from the schema enum | Data file is the source of truth for visible text |
| C5 | CI badges use the standard URL `https://github.com/VincentJerico/<repo>/actions/workflows/ci.yml/badge.svg` | Data file confirms `ci.yml` in each repo; badge is live, not a static claim |
| C6 | Metric source links point to the repo/file in the data file's Source column; "GitHub API" links to `https://github.com/VincentJerico?tab=repositories` | Every number needs a clickable source |
| C7 | API quirks, TaskFlow seed-and-catch, journey area status and performance test types render as `extraTables`; defect tickets only where a FINDINGS / BUGS-FOUND file exists | Spec 4.4 D: no invented repro steps |
| C8 | Photo is the desktop sidebar avatar; `VJ` monogram is the mobile top bar mark and favicon | Spec 4.3 and 7.1 both ask for it; this places each |
| C9 | The spec is treated as the approved design document; per-phase implementation plans live in `docs/superpowers/plans/` | Avoids a duplicate design doc |
| C10 | Default `NEXT_PUBLIC_SITE_URL` for CI test builds is `http://localhost:3210` (the Playwright server port); real URL set in Vercel and the deploy job | Build must not fail before a domain exists |
| C11 | Theme: OS preference wins (`defaultTheme="system"`); dark is the CSS default for no-JS visitors and crawlers; the toggle stores an explicit choice | Reads "dark default, system respected" (spec 3) without one overriding the other |
| C12 | The generated CV PDF is not committed (`public/cv/` git-ignored); CI and `pnpm cv` produce it | D1; keeps the PDF in sync with `/resume` |
| C13 | Light `--warn` changed from spec `#9A6700` to `#956400` | Spec value is 4.34:1 on `--surface-2` (`#F2F2EE`), below 4.5:1; `#956400` is the nearest darker shade that passes (4.56:1). Caught by `tests/unit/tokens.test.ts` |
| C14 | Schema extensions: `Profile.languages` (D7), `Profile.background` (data §1 Background line, for `/resume`), `Project.year` (C3), optional `decisions[].body`, `CaseStudy.currentlyTesting` (data §5.3), `QaArea` collection (data §5.4) | Each holds a data-file fact the spec schema had no field for |
| C15 | `Profile.siteUrl` removed; `getEnv().NEXT_PUBLIC_SITE_URL` is the single source | Avoids two sources for one value |
| C16 | Metric `login-latency` value "12 s p95" with the data cell as context; `browsers` value "4" counting the four browsers on the same tile | Spec 6 example; spec 2.1 allows counting items rendered together |
| C17 | `navItems()` and all content reads run on the server; client nav components get plain props | Keeps content and Zod out of the client bundle (perf budget) |

---

## Proposed UX additions (awaiting Vincent's OK)

Vincent asked for a site that is unique, pretty, user-friendly and "addictive to explore". These fit the
"Site Under Test" concept, keep to the spec's constraints (CSS-only motion, no animation library, no invented
data, WCAG 2.2 AA) and would be built in Phase 3/3b:

| # | Proposal | What the visitor gets |
| --- | --- | --- |
| P1 | **Exploration coverage.** The test-explorer sidebar marks pages this visitor has opened and shows "You've covered 4 of 9 pages", like a coverage report. Stored per browser in `localStorage` (try/catch); never mixed with the real CI status dots. | A reason to open one more page |
| P2 | **"Next spec" links.** Every page ends with a suggested next page (Overview -> Projects -> a case study -> Client Work -> ...), so there are no dead ends. | A guided path through the site |
| P3 | **Command palette (Cmd/Ctrl+K)**, pulled forward from Phase 7. Jump to any page, project or finding by typing. Uses a modifier key only (WCAG 2.1.4 safe). | Fast navigation for technical visitors |
| P4 | **Clickable severity counts.** In each test report's run summary, clicking "3 SERIOUS" jumps to and opens those tickets. | Faster drill-down from summary to evidence |
| P5 | **View transitions** between pages via the CSS View Transitions API (no library), off under `prefers-reduced-motion`. | Polished, app-like page changes |
