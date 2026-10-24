# Assets Checklist

Updated: 2026-10-24 (revision 2)

## Received

| Item | Where it went |
| --- | --- |
| CV, two versions (QA and IT/cloud/cyber) | Used as a data source in `01-PORTFOLIO-DATA.md`; not served on the site (contains phone number) |
| Job title and start date: Software QA/QC Engineer, 2026-09-03 | Data file Sections 1 and 4 |
| Graduation: August 2026 | Data file Section 7 |
| LegataLink live link and home page screenshot | Data file 3.8; image at `assets-inbox/legatalink/home-hero.png` |
| OK on the 5 planted Bug Hunt bugs | Spec 4.4 C |
| Photo | Cropped to `assets-inbox/profile/vincent-portrait.jpg` (phone and case photos removed, flipped, metadata stripped) |
| Client work: publish anonymously | Data file Section 5 |

## Still wanted (nothing here blocks the build; each field stays hidden until filled)

| # | Item | Notes |
| --- | --- | --- |
| 1 | LinkedIn URL | Coming after you recover the account |
| 2 | Optional: a straight-on headshot | Looking at the camera, plain background, at least 800x1000. The current photo works until then |
| 3 | 3–4 more LegataLink screens | Rooms, resort map, booking flow, admin dashboard. PNG, desktop width, no real guest data |
| 4 | LegataLink repo: can it be made public? | It's private on KyleReginaldo's account, so the site won't link it unless it's public |
| 5 | Certification credential URLs | Fortinet and DataCamp share links, if you have them |
| 6 | The 13th area of your QA checklist | 12 are on record |
| 7 | Domain name (optional) and the GitHub repo name for the site | Defaults: Vercel URL, `VincentJerico/portfolio` |
| 8 | Spoken languages (optional) | e.g. English, Filipino |
| 9 | Screenshots of Playwright HTML reports, k6 dashboards or CI runs you like (optional) | Make the test-report pages stronger |

Already available from your public repos (copied during the build):

- `accessibility-testing/docs/evidence/menu-focus-obscured.png`
- `accessibility-testing/docs/evidence/login-button-focused.png`
- `accessibility-testing/docs/evidence/login-button-unfocused.png`
- `performance-testing/docs/breakpoint-dashboard.png`
- `taskflow-under-test/docs/screenshot.png`

## Setup to do yourself (per machine, per repo)

- Node 22 and pnpm installed (`node -v`, `pnpm -v`)
- Vercel account, and the Vercel CLI logged in with a **token for this repo** (use your `supabase-vercel-cli-auth`
  skill). No Supabase needed for this site.
- GitHub repo created under `VincentJerico`, public

## Quick GitHub fixes

- Profile README: "6 public QA repos" -> 7; update `now.txt`; add performance-testing to Projects and CI Status
- GitHub bio: "QA Engineer" -> "Software QA/QC Engineer"
- performance-testing: add topics (`k6`, `performance-testing`, `load-testing`, `slo`, `qa`, `sdet`, `github-actions`)
- taskflow-under-test: deploy the live demo or remove the commented-out demo line
- GitHub profile website field: set it once the portfolio is live
