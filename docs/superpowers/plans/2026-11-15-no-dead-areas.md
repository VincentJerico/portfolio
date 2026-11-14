# No dead areas

Vincent (2026-11-15): "I want a more animated and transition in all modules and parts", then "as in no
static area or dead area". An inventory of origin/main found that the home, report and about pages move
a lot, but many controls, state changes and the quieter pages snap or sit still. This plan closes every
gap it found. The specific choices are Claude's, made inside the existing Site Under Test / spec-sheet
system, and Vincent reviews them on the PRs before anything merges.

## Principle

Every part of the site does at least one of three things: it **arrives** (rises, draws or counts in as it
loads or scrolls into view), it **answers** (responds to hover, focus and press), or it **changes shape**
(a state change morphs or slides instead of snapping). One shared vocabulary, so the site still reads as
one designed system: lift and accent border for cards, a nudge for arrows, a press-in for controls, a
slide-open for anything that expands, a stagger for lists, a count-up for numbers, a draw for lines and
checks.

## Bugs found by the inventory (fixed first)

1. The home hero's text column has no entrance: the header-rise rule targets the hero's first child,
   which is the dot field, not the text. The same rule outranks the cursor pulse ring, so the ring likely
   never shows.
2. The 404 page has no entrance on a direct load (it has no header element).

## The work, by area

**Shell (every page)**
- A thin scroll-progress line under the top edge on every page, driven by the page's own scroll.
- Press-in feedback on every small control (search, run suite, bug hunt, site checks, links in the
  sidebar footer, close buttons, filter chips), not just the two buttons that have it today.
- Sidebar: the project-specs folder slides open and shut instead of snapping; the visited check draws in.
- Drawer: its rows stagger in like the sidebar's, and the Menu icon morphs into the close X.

**Lists and results that change**
- /projects filter: when the filter or search changes, cards that stay glide to their new places, new
  ones rise in, removed ones shrink away; the "Showing N of 8" count rolls; the empty state rises.
- Command palette: closing shrinks it back into the Search button (today it vanishes); results stagger
  in as you type, the highlighted row's marker glides between rows, and the count rolls.

**Feedback states**
- Contact form: field errors and alerts slide open under their field; a successful send morphs the
  button into the sent message; the character counter's colour eases as it nears the limit.
- Copy buttons: the icon flips to a check with a small pop, the status slides in, and both reset after
  a few seconds.
- Run-suite panel: slides up instead of popping, result rows stream in one by one, the "running" chip
  pulses, and the loading shimmer keeps going until results arrive.
- Bug Hunt: the banner slides down, the "No defect here." note rises and dismisses itself, the
  completion card rises, and the ticket dialog shrinks away on close.

**Cards and chips with no hover today**
- One lift-and-accent hover for the remaining cards: Skills cards, About education, experience and
  certification cards, decisions, result callouts, the Quality gate cards, prev/next and capstone links
  (whose arrows also nudge).
- Chips (stack, tools, skills, severity links) tint and rise slightly on hover; the result callout rises
  in with its section.
- "Currently testing" and other live status chips get a soft compositor pulse on their dot.
- CI badges ease in when their image loads; an open ticket's border eases to its open colour.

**Quieter pages**
- Skills: chip groups stagger in as each section scrolls in; each card gets a status dot that turns to a
  check like the section headings.
- Quality: scores count up on the odometer as they scroll in, gate bars fill to their value, and the
  latest-run list streams in.
- Work: a case study card morphs into its page title, like projects do into reports.
- Resume: entries rise in turn on screen; print stays exactly as it is.
- 404: the page arrives like the others, and its Overview button gets the shared hover and press.

## Constraints

Unchanged from AGENTS.md and decisions C37 to C43: no invented facts, no emojis, no text opacity on
content, every effect off under reduced motion and in print, 44 px targets, focus never lost or hidden,
axe clean. **Performance:** nothing new runs on page load except the hero fix. Everything else starts on
scroll or interaction and uses only transforms, clip-path and opacity on decoration, so the compositor
runs it. Anything endless stays compositor-only (the existing guard test enforces this). Lighthouse
budgets stay green.

## Delivery

Two PRs, so each is small enough to review:
1. **Bugs, shell, feedback states, cards and chips, quieter pages.**
2. **Lists that change:** the /projects filter morph and the command palette (exit, results, marker).

## Verification

E2E tests for each new behaviour: the element animates, settles in its final state, and does not move
under reduced motion. Also dialogs still trap and return focus, and the endless-animation guard covers
the new pulses. Then the full gate, local Lighthouse on the five budget routes, CI, and frames captured
in both themes.
