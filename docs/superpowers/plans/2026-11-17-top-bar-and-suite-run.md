# Top bar, status bar and a suite run

Vincent (2026-11-17): "remove the side nav bar, I don't prefer side nav bar in my portfolio" and "the
horizontal scroll; I don't prefer it, think of something creative". He chose, from mockups, a top bar
with a status bar along the bottom, and featured projects that run as suites while the visitor scrolls.
This reverses spec 2.4 (sidebar) and C38's call to keep the sidebar.

## 1. Top bar (desktop, from 1024 px)

- A slim bar fixed to the top: the name on the left; the pages in the middle, each with its status dot;
  Search (Ctrl K) on the right.
- The active page has one underline marker that glides to the new page on navigation, replacing the
  sidebar's gliding row.
- Projects has a small chevron that opens a menu of the project specs, replacing the sidebar folder.
- Content goes full width up to the existing 1100 px column, with no 280 px left offset.
- Below 1024 px nothing changes: the existing top bar and drawer stay.

## 2. Status bar (desktop, from 1024 px)

- A thin bar fixed along the bottom, styled like an IDE status line. Left to right: the run summary
  (passed, failed, last run), exploration coverage ("covered 3 of 9" with its bar), Run tests on this
  page, Bug Hunt on or off, site checks, Vincent's local time, and the GitHub and Email links.
- The run-checks sheet opens above it, and the page gets bottom padding so the bar never covers
  content.
- The pull cord stays the desktop theme switch, hanging from under the top bar at the right.

## 3. Suites run as you scroll (home)

- The sideways reel becomes a vertical test run. Each featured project is a suite row: a dot on a rail,
  the suite number, the name, the category and a status.
- As a row reaches the middle of the screen its dot fills, its status steps from queued to running to
  done, and its result (the project hook) opens beneath it. The rail draws down as the run advances,
  and a counter reads "N of 6 run".
- **The status says "done", not PASS.** The data file has no live CI result per project repo, so a PASS
  stamp would invent a claim (C39 kept the index free of pass or fail for the same reason). "Done"
  only describes the visual run reaching the row. The statuses and counter are decorative (hidden from
  screen readers). The list itself reads as a plain list of links.
- All rows keep their links and the project-to-report morph. Without scroll-driven animation support,
  or under reduced motion, every row shows done with its result open.

## Knock-on changes

- Overlays that stopped at the sidebar edge (boot, page-change runner, reading-progress line) now sit
  below the top bar instead.
- The report page's docked title bar docks below the top bar on desktop too.
- Decisions: a new entry records the reversal of spec 2.4 and C38, and the "done" status.

## Constraints

Unchanged: no invented facts, no emojis, 44 px targets, focus visible and never lost, axe clean,
reduced motion respected, print unchanged, Lighthouse budgets green (the run uses one shared scroll
timeline, and its reveals use clip-path so rows hold no compositor layers).

## Verification

Tests move from the sidebar to the top bar and status bar: page links, status dots, active marker,
project menu, coverage, Run tests, Bug Hunt, site checks, local time. New tests cover the suite run
(statuses, counter, results open, reduced motion shows everything) and check that there's no sideways
scroll anywhere. Then the full gate, full e2e in three browsers, a speed comparison against main on the
home page, and screenshots in both themes.
