# Morph motion pass

Vincent (2026-11-10): "I am still not satisfied with the UI/UX. I want something advanced and a lot of
motion, transition and animation, but still proper to the theme. I want morphing or something like
that." Asked for specifics, he said: "anything applicable. Be creative." So the choices below are
Claude's, made within the existing Site Under Test / spec-sheet system, and reviewed by Vincent on a PR
before anything merges.

## Principle

Things should change shape instead of appearing and disappearing. When the visitor acts, the element
they touched becomes the thing they asked for: a button grows into its dialog, a row becomes the page
header, the light switch floods the page with the new theme. That is what "morphing" means here.

## How it is built (Claude's call)

The browser's View Transitions API, already used through React's `<ViewTransition>`, for every morph
triggered by a click or navigation, and scroll-driven CSS for morphs tied to scrolling. No animation
library, no JavaScript on page load beyond what exists; the transitions run only when the visitor acts,
so Lighthouse budgets are unaffected. Everything falls back to an instant change without support and
under reduced motion.

## The morphs

1. **Theme switch floods the page.** Pulling the cord (or the drawer toggle) reveals the new theme as a
   circle growing from the point that was pressed.
2. **The sidebar's active marker glides.** On navigation the highlight slides from the old page's row
   to the new one instead of jumping.
3. **A project becomes its report.** From a home index row or a /projects door, the suite number,
   category and name each morph into their places in the report header (today only the name morphs).
4. **Controls grow into their dialogs.** The Search button grows into the command palette; a defect
   ticket chip into its ticket; an evidence thumbnail into its full-size view. Closing shrinks them
   back.
5. **Text morphs.** The hero's "My suites cover" card changes word by morphing letter by letter (the
   decode effect) instead of flipping, and each section's status dot morphs from a pending ring into a
   check as the section scrolls in.
6. **The report title docks.** On report pages, as the visitor scrolls past the header, the big title
   morphs into a compact sticky bar showing the suite number and name.

## Constraints

Unchanged from AGENTS.md and decisions C37 to C39: no invented facts, no emojis, content motion by
transform, clip-path or stroke only (never text opacity), off under reduced motion and in print,
44 px targets, axe clean, focus never lost or hidden, Lighthouse budgets green.

## Verification

E2E tests per morph (the right elements carry shared names, dialogs still trap and return focus, the
docked bar appears and stays readable, reduced motion turns everything off), the full gate, local
Lighthouse, then CI and a PR with notes on how to try each morph.
