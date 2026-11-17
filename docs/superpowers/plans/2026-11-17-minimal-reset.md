# Minimal reset: your name as the poster

Vincent (2026-11-17): "let's reset, make my protfolio minimalist style", then "Yes, strip it back" (drop
the test-runner extras, keep the content). From the Awwwards portfolio picks he chose "Big type, little
else", and from three homepage mockups he clicked A, "your name as the poster": "I like it, go implement
it". Calls marked _(my call)_ are defaults he can change on the PR.

## What it looks like

- **Paper and ink.** Light: warm paper `#efe9de`, deep navy ink `#20263a`, one vermilion accent. Dark:
  the C48 slate `#151c26`, paper-coloured text, a coral accent. Nothing reads as white or black, and every
  pair passes AA (the tokens test keeps both rules).
- **Two typefaces, as now.** Bricolage Grotesque, now loaded with its width axis so big titles can be
  set condensed and heavy, and IBM Plex Mono for the small labels. No other fonts.
- **Home page.** It opens on "VINCENT / JERICO" filling the screen, with the second line pushed right.
  "Software QA/QC Engineer on the path to SDET." sits in the gap. Small mono details sit in the corners:
  role and company, the five testing areas, and location with local time. Below it:
  1. **Projects:** all eight as a list of big names (number, name, category, year).
  2. **Client work:** the approved case studies, as the same kind of list.
  3. **Contact:** the email set large, with copy, Download CV and GitHub.
- **List rows are the one hover.** Hover or keyboard focus nudges a row right, turns its name the accent
  colour and opens its one-line hook below. On touch screens the hook is always shown. The text is
  always in the page, so screen readers get it either way.
- **Top bar.** Name on the left. Projects, Work, About, Resume and Contact on the right _(my call)_. A
  small "Dark" / "Light" text switch replaces the pull cord _(my call)_. On phones the links fold into
  "Menu", which opens a full-screen list of big links.
- **Footer on every page.** Skills, Notes and Quality move here from the main nav _(my call)_. Also
  GitHub, the email, the CV and location with local time.
- **Inner pages.** The same bar and footer, a big condensed page title, and content in one column.
  Tables become plain ruled rows. No cards, shadows or boxed chips: just text and thin rules.
  - Project reports keep their findings, decisions, evidence and the headline result, set as a big quote.
  - About keeps the career path and full timeline as a plain list, plus the portrait and the headline
    numbers as a quiet row _(my call)_.
- **Motion stays C50's one rhythm.** Things rise 16 px over 400 ms. The list-row hover replaces the card
  lift, since the cards are gone, and takes 180 ms. Kept on the same timing: page changes, the theme
  flood and the project-row-to-report-title morph. All of it is off under reduced motion.
- **No-JS visitors and crawlers get the paper theme** _(my call: the poster is designed paper-first)_.
  With JavaScript the site follows the OS setting until the switch is used.

## What goes

- **Extras:** bug hunt; the run-tests sheet and its checks; the command palette and Search button; the
  test-explorer drawer and coverage meter; the status bar; the pull cord; the route-runner chip; the
  site-checks chip; the reading-progress line; the scroll inspector.
- **Projects page:** the suite door and suite run. Its category filter stays, as plain text tabs.
- **Every page:** the "next spec" footer.
- **Home page:** the masthead; the dot-field hero; and the run-summary strip, "How I test" grid, skills
  snapshot, timeline and portrait (they stay on About and Skills).
- **About:** the time machine's pinned year numerals (the timeline itself stays as a list).
- **Project reports:** the control-panel header (its counts become one mono line).

The content files (`src/content/*`) and `docs/01-PORTFOLIO-DATA.md` don't change. Every fact on the new
pages already renders today.

## Build order (branch `design/minimal-reset`, one commit each)

1. **Tokens and type.** `src/styles/tokens.css` gets the new values. In `tests/unit/tokens.test.ts`, the
   no-JS default becomes paper `#efe9de` and the slate test moves to `.dark`; all AA pairs stay.
   `src/lib/fonts.ts` adds `axes: ['opsz', 'wdth']`. `globals.css` gets `--font-poster` settings
   (`'wdth' 75`, weight 800) for the poster name and page titles.
2. **Shell.** `src/app/layout.tsx` drops every extra above.
   - New `components/layout/SiteHeader.tsx`: name, five links, theme switch, phone menu (the phone menu
     reuses MobileNav's open and close logic).
   - New `components/layout/SiteFooter.tsx`.
   - Delete the folders and files that only the extras use: `components/bughunt/`,
     `components/runner/`, `components/palette/`, `components/explorer/`. Also `PullCord`,
     `StatusBar`, `RouteRunner`, `TopBar`, `IdentityBlock`, `ShellLinks`, `NextSpec`, `SuiteDoor`,
     `TimeMachine`, `HeroSpotlight`, `Masthead`, `QaAreaGrid`, `RunSummaryPanel`, `Inspectable`, and
     their libs (`bug-hunt-store`, `runner-store`, `explorer-rows`, `coverage`, `site-index`,
     `next-spec`, `content/bug-hunt.ts`).
   - Typecheck and build prove nothing else imports them. The `/selftest` page stays: the gate
     self-tests use it.
3. **Home page.** `src/app/page.tsx` becomes poster hero, Projects list, Client work list, Contact.
   - New `components/content/WorkList.tsx` draws a list of rows: number, name, meta, year and hook. It
     takes the `data-morph` name, so a row morphs into its report title as the project rows do today.
   - The Person JSON-LD stays.
4. **Projects and reports.** `/projects` uses `WorkList` with the existing `ProjectFilter` logic as text
   tabs. `/projects/[slug]` gets the big condensed title, the result as a big quote, and findings as
   plain disclosure rows (`DefectTicket` restyled, `TicketOpener` kept so `#ticket-ID` links still open).
5. **The other pages.** Work, case studies, Skills, About, Resume, Quality, Notes, Contact and 404 are
   restyled to the new bar and footer, title, rules and one column. `/quality` loses its Run tests button.
   The social share images (`lib/og.tsx`) move to paper and ink with the condensed name.
6. **Docs.** Decision C51 in `docs/04-DECISIONS.md` (amends C37, C39, C44, C48, C49 and C50 where they
   describe removed parts).

## Tests

- **Delete with their features:** `bughunt`, `runner`, `palette`, `explorer` and `tickets` (tickets only
  if its behaviour moves into `projects`). Also the parts of `redesign`, `shell`, `overview`, `morph`,
  `motion` and `theme` that cover removed parts, and the unit tests `bug-hunt` and `next-spec`.
- **New or rewritten e2e:**
  - The home page shows the name as one `h1` and lists all eight projects in display order, each
    linking to its report.
  - Hovering or focusing a row shows its hook. On a touch viewport the hook shows without hover.
  - The top bar has exactly the five links. On phones, Menu opens and closes, Escape closes it, and focus
    returns.
  - The theme switch flips and persists across reload, and no-JS gets paper.
  - The footer on every route links Skills, Notes, Quality, GitHub, email and CV.
  - None of the removed parts render anywhere: no `[data-statusbar]`, no palette dialog on Ctrl+K, no
    bug-hunt toggle.
  - A project row still morphs into its report title.
- **Kept as they are:** axe on every route, the 24 px targets and no-sideways-scroll check, layout and
  overflow guards, integrity and denylist, SEO, OG, contact form, resume, notes, fonts, speed budget.
- **Done means:** `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` plus the
  full `pnpm test:e2e` in chromium, webkit and mobile-chrome. Plus screenshots of home, projects, a report
  and about, at phone and desktop sizes in both themes, and a speed comparison against main on home.

## Review focus

1. **A long project name on a phone row** (`playwright-framework-template`) wraps without overlapping
   the category or year, and never scrolls sideways.
2. **The poster name at 320 px wide and at 1920 px** stays inside the page. It scales with the viewport
   and never clips.
3. **Keyboard-only use of the list:** Tab reaches every row, the hook shows on focus, and the focus ring
   is visible on paper and slate.
4. **Visiting with the OS in dark mode** lands on slate with no paper flash. The existing first-paint
   class test is adapted.
5. **A case study list with zero approved studies** hides the Client work section and the Work link, as
   today.
