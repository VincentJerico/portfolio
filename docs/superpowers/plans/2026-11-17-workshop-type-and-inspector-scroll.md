# Workshop type and an inspector on scroll

Vincent (2026-11-17): "I want an animation on scroll a more advance and creative", then "something
creative and cool", and "change the font paring because it's very AI". From rendered samples he chose
D, Workshop: Bricolage Grotesque with IBM Plex Mono. The scroll ideas below are defaults, made inside
the Site Under Test theme, and he reviews them on the PR.

## 1. Type: Workshop

- Bricolage Grotesque (variable weight and optical size) for headings and body; IBM Plex Mono for
  labels, data and the runner voice. Replaces Geist and Geist Mono (amends C39).
- Headings use its optical sizing and heavier weights, so large titles get the tighter, quirkier
  display cuts while body text stays even.
- The social share images and the favicon move to the same pair; the Geist font packages are
  replaced by the Bricolage Grotesque and IBM Plex Mono ones.
- Mono labels stay at 12 px with an 11 px floor; every size is re-checked for legibility.

## 2. Scroll: the page gets inspected as you read

The signature: **as each card crosses the middle of the screen, a test inspector checks it.** A thin
scan line sweeps down the card once, then corner brackets lock on around it with a small mono tag that
reads "inspected". The brackets stay, so the page you have read looks checked. Cards on every page
take part: suite cards, case studies, Skills cards, gate cards, decisions, evidence, the run summary.

Two supporting moves:
- **Headings light up word by word:** each section heading starts in the muted text colour and
  brightens to full ink a word at a time as it scrolls in. Colour only: it starts at a colour that
  already passes AA, so text is readable at every moment.
- **Depth:** cards tilt up a few degrees into place as they enter, and the dot grids behind the hero
  and the timeline drift at a slower speed than the page.

## Constraints

Everything is driven by scroll position in CSS: nothing runs on load, and nothing endless. The
inspector, the lighting and the tilt animate registered numbers, colour and visibility, not
compositor transforms, so cards hold no layers (the speed lesson from C44). All of it is off under
reduced motion and in print; tests and axe still pass; no invented text (the tag says only
"inspected").

## Verification

Tests for the new fonts loading on every page and in share images, the inspector reaching a card as it
crosses the middle, the headings' final colour, and reduced motion showing everything settled. Full
gate, full e2e in three browsers, a speed comparison against main on the home and about pages, and
screenshots in both themes.
