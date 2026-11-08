# Design principles pass

Vincent sent a list of design principles (2026-11-06) and asked for all of them to be applied. This plan
maps each one to the existing system. It adapts the principles to the "Site Under Test" concept. It adds
no new facts: every rendered string still comes from `docs/01-PORTFOLIO-DATA.md`.

Already true before this pass, audited and kept: dark and light themes, labels above (never inside)
fields, semantic landmarks, field-level error handling on the contact form, the IBM Plex Sans, Plex Mono
and Instrument Serif pairing, 320 to 2560 px layouts, and type-to-search via the command palette.

## 1. Color system

- **70/20/10, decided by Vincent.** 70% tinted neutrals (`--bg`, `--surface`, `--surface-2`). 20% a
  slate-blue secondary (`--secondary`), used by the 280 px sidebar, the mobile top bar and the run summary
  band. 10% the accent (`--accent`): links, primary buttons, focus and active states. Pass, warn and fail
  sit outside the split and mark status only.
- **Color psychology.** Blue family for trust and competence. Green only for passing checks. Red only for
  real failures and errors.
- **More saturated light mode.** Neutrals move from warm gray to a cool blue tint. Ink becomes navy. Pass,
  warn and fail become a little more saturated.
- **No pure black or white.** Light `--surface` changes from `#FFFFFF` to a tinted off-white. Print keeps
  black on white on purpose.
- **Guarded by tests.** `--secondary` joins `TOKEN_NAMES`. Text, muted text and accent on `--secondary`
  join `TOKEN_PAIRS`, so the unit test enforces AA in both themes. A new test fails if any theme token is
  `#000000` or `#ffffff`. Dark `--bg` stays `#0B0F14`, because the no-JS test pins it.

## 2. Motion (CSS only, reduced motion respected)

- **Motion tokens.** `--ease-out`, `--dur-fast`, `--dur-base` and `--dur-slow` in `globals.css`.
- **Hover.** Cards lift 2 px and their border shifts toward the accent. "Read the report" style links nudge
  an arrow. Buttons press down on `:active`. Chips tint. Only `transform`, `box-shadow`, `border-color`
  and `background-color` animate.
- **On scroll.** Inside `@supports (animation-timeline: view())`, each Section rises into place as it
  enters the viewport. A status dot beside its kicker turns from pending (muted) to pass (green), so every
  section "passes" as the visitor reaches it. Content never animates `opacity` or `clip-path`, so axe
  never scans text in a half-faded state, and hit testing is unchanged. Browsers without support get the
  final state.
- **Route transitions.** The page enters with a short rise and fade and leaves with a quicker fade. A
  project's name morphs from its card into the report title (`<ViewTransition name share="morph">`, per
  `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`).

## 3. Hierarchy and less text

- **Fluid type.** `h1`, `h2` and `h3` use `clamp()` between the spec's mobile and desktop sizes, so the
  endpoints stay as specified.
- **Result first.** Project cards lead with the hook (the outcome) and drop the summary, which still opens
  the report page and its metadata.
- **Less repetition.** `/contact` and the overview contact block stop repeating the Projects tagline.

## 4. Forms and loading states

- **Horizontal form.** At 640 px and up, labels sit in a left column aligned to their fields. Below
  640 px they stack above.
- **Width matches content.** Name is short, email medium, message full width.
- **Guidance instead of masks.** The fields are name, email and message, which have no fixed format, so a
  mask would block valid input. Each field instead gets a hint below its label, the correct `inputmode`,
  `autocapitalize`, `spellcheck` and `enterkeyhint`, and the message gets a live character count.
- **Earlier errors.** Each field validates on blur with the browser's constraint API, using the same copy
  as the server (moved out of the zod module so the client bundle does not grow by zod). Server-side
  validation is unchanged.
- **Real loading moments only.** Every page is pre-built and GitHub data is fetched on the server, so
  pages get no skeletons. Skeletons go where a visitor actually waits: queued checks in the suite runner,
  the external CI badge images, and a spinner on the contact submit button. The command palette chunk
  loads in a few milliseconds, so a skeleton there would only flash; it gets none.

## 5. Requests made during the work

- **Sidebar avatar removed** (Vincent, 2026-11-07): the sidebar and drawer show the name and role only.
- **Flippable portrait card** (Vincent, 2026-11-07): the overview portrait flips to a "fixture data" face
  listing role, company, location, languages, goal and next directions, all from verified profile data.
  A labelled toggle button (`aria-pressed`) is the accessible control, clicking the card is a pointer
  shortcut, the hidden face is `inert`, and reduced motion makes the flip an instant swap.

## Verification

Unit tests for the token rules. E2E tests for the horizontal form at desktop and mobile widths, blur
validation, the character count, and both themes passing axe. Then the full gate:
`pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`, and CI on
the PR including Lighthouse.

## 6. Second round (Vincent, 2026-11-07: "implement all", fonts not preferred, avoid AI slop)

- **Fonts.** Archivo (variable width and weight) replaces Instrument Serif and IBM Plex Sans. Headings
  are set condensed and heavy like a spec-sheet label; body text runs at normal width. Martian Mono
  (variable width, set slightly condensed) replaces IBM Plex Mono for runner data. OG images and the
  icon follow.
- **Less generic.** Labels are sentence case instead of tracked-out all caps. The per-section slide-up,
  the glow under hovered cards and the arrows appended to card links are gone. The scroll-linked
  moment is the section status dot alone. The hero's eyebrow label, which repeated the role a third
  time, is gone.
- **Input mask.** The email field drops whitespace as it is typed or pasted and lowercases the domain
  on blur.
- **Loading.** A placeholder sheet holds the runner's place while its code downloads, and lazy
  evidence thumbnails show a pending placeholder until they paint.
- **Type, search and scroll.** /projects has a labelled search box (name, hook, summary, stack) that
  combines with the category chips.
- **Visuals.** Each report's run summary shows a segmented severity bar beside the severity chips. The
  sidebar shows a coverage bar under "You've covered N of M pages". Both are decorative because the
  text beside them carries the numbers.
- **Hierarchy.** The hero intro's first sentence leads in body ink and the rest steps back. The split
  happens only at sentence ends, so the wording stays exactly as written in the data file.
- **Dynamic system.** Fluid spacing tokens (`gap-rhythm`, `gap-section`; first named `gap-block`) set the vertical rhythm on
  every page.
- **Color split.** Kept at 70/20/10, Vincent's correction of the original 60/20/10.

## 7. Motion in every component (Vincent, 2026-11-07)

A cursor-swarm trial (arrow cursors flocking after the mouse, adapted from Vincent's reference reel)
was built, then removed at his request in favour of transitions and animations across every component
and piece of content. Decision C37.

- **Transitions.** Every link, button, summary, input and chip transitions colour, background,
  border, underline, shadow and transform with shared timing tokens.
- **Dialogs.** The command palette, ticket and evidence dialogs scale in; their backdrops fade.
- **Tickets.** Defect tickets expand and collapse smoothly where the browser supports animating
  `details` content.
- **Page headers.** The kicker, title and lead rise in once on load, staggered.
- **On scroll.** Sections rise into place, list items and table rows stream in, cards are scanned by
  a sweep behind their text, the timeline draws down and severity bars fill.
- **Safety.** Content motion is transform-only, so axe never meets half-faded text and hit targets do
  not shift; everything is off under reduced motion and in print.
