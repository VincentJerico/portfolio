# Uniform motion

Vincent (2026-11-17): "I don't like the animation and transitions. Make it uniform." Asked how far, he
chose "One rhythm, keep signatures" over "Minimal and calm". Recorded as C50.

## The rhythm

- One easing everywhere: `--ease-snap`.
- Arrive: rise 16 px over 400 ms, on load and as content scrolls in (headers, sections, list items,
  table rows, the resume, the time machine years, alerts, menus, dialogs, the drawer's rows, the run
  sheet, filter cards). Staggers are 40 ms.
- Answer: cards, chips, suite rows and buttons lift 2 px over 180 ms; cards pick up the accent border.
- Leave: 180 ms (page changes 120 ms out, 240 ms in).

## Kept, on that timing

Theme flood, project to report morph, palette grow and shrink, suite run, inspector, the pull cord,
the reading line, the docked report title, loading placeholders.

## Removed

First-visit boot, letter-by-letter title, odometer digits, card tilt, label scramble, chip and check
pops, word-lit headings, sideways slides, form shake, load bar, career pulse, breathing status dot, CI
badge fade, hero and timeline parallax, morph blur.

## Verification

Tests updated for the shared `rise`, a new test that header items, sections and card hovers share one
animation, timing and lift; full gate, full e2e in three browsers, a speed check against main.
