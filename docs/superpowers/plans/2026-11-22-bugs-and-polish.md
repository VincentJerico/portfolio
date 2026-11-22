# Bugs and Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the ten known bugs left from the C52 and C53 reviews, then apply ten interface details from Vincent's reference list to the paper-and-ink site.

**Architecture:** CSS and small component changes. The colour tokens move to OKLCH, with the contrast library learning to read `oklch()`, so the AA tests keep checking the real values. Each technique is applied only where the site has something for it, and the ones with little to apply are said so here.

**Tech Stack:** As C53: Next.js 16.4.4, React 19.3, Tailwind v4, CSS scroll-driven animations, Lenis, Playwright, Vitest, Lighthouse CI.

**Spec:** `docs/03-MASTER-PROMPT.md` amended by `docs/04-DECISIONS.md` (C50–C53). Vincent, 2026-11-22: "fix the bugs and then apply these", with a list: concentric radius, alpha borders, OKLCH palettes, OKLCH gradients, matched icon weight, masked edges, blurred icon swaps, dark mode depth, dynamic viewport, multiply blending. Reading "the bugs" as the known issues listed after #44 and #45 is my call, as is every application below.

## Bugs

| # | Bug | Fix |
|---|---|---|
| B1 | On very tall windows the Contact card never reaches full width and its arrow stops half drawn | Both ranges finish inside `entry`, which the end of the page always reaches |
| B2 | On phones the Contact card's grow-in clips the heading's first letter and the email | Start the card inset vertically only below 40rem |
| B3 | The career strip slides 16 px (desktop) to 60 px (landscape phone) before it pins | `view-timeline-inset: 3.5rem 0` so its range starts exactly at the pin |
| B4 | `.word { white-space: nowrap }` applies in reduced motion and print, so a long word can't break | Scope it to where letters are inline blocks (the motion block) |
| B5 | The focus check counts focus outside the viewport as "not hidden" | `focusEntirelyObscured` treats an off-screen focused element as obscured |
| B6 | The grain stops at solid surfaces (top bar, deck rows, Contact band, page sheet), leaving seams | Fixed by T10: the grain covers every surface |
| B7 | `CvRing` uses a fixed path id and a fixed text length | `useId` for the path; text length from the circumference |
| B8 | The cord's string and knob drop to about 2:1 where the flipped Contact band passes behind them | A 1 px halo in the page colour around the line and knob |
| B9 | The phone menu's links rise 40 px since C53 (they read `--arrive-rise`) | Set 16 px on the menu items explicitly |
| B10 | No hover test runs without the `pointAt` helper | One plain `hover()` test under reduced motion (no smooth scrolling) |

## The ten details

| # | Detail | Applied to |
|---|---|---|
| T1 | Concentric radius | The site is mostly rules, so only the evidence thumbnails and their full-size dialog nest rounded shapes: each outer radius becomes the inner button's radius plus its inset (tokens `--radius-inner`, `--inset`, `--radius-outer`). The CV ring is concentric already. |
| T2 | Alpha borders | Every rule and border uses the ink at low alpha (`color-mix(in oklch, var(--text) 18%, transparent)`) instead of a fixed beige or slate, so lines read the same on paper, slate, the flipped band and the grain. Form fields keep a solid, darker boundary (WCAG 1.4.11, 3:1). |
| T3 | OKLCH palettes | `tokens.css` is written in `oklch()`: each colour is its current value converted, then the surfaces step evenly in lightness from the page colour. `src/lib/contrast.ts` converts OKLCH to sRGB, so every AA pair test still runs on the real colours. |
| T4 | OKLCH gradients | Every gradient and colour mix interpolates in OKLCH: the skeleton sweep, the link underline, the knob's glow, and the alpha borders. |
| T5 | Matched icon weight | Icons draw strokes that match the text beside them: `svg.lucide` gets a non-scaling stroke of 1.25 px next to small mono text and 1.5 px next to body text, and the Contact arrow's stroke matches the heading's stem. |
| T6 | Masked edges | The skills strip and the career strip fade out at their left and right edges with `mask-image`, instead of cutting off hard. |
| T7 | Blurred icon swaps | The copy button's icon swaps to a check, and the contact form's spinner to a check, through blur and scale: out to `blur(4px) scale(0.6)`, in from the same. Icons only, never text; instant under reduced motion. |
| T8 | Dark mode depth | In the dark theme, layers get lighter as they rise, with a 1 px top highlight instead of shadows: page `--bg` < top bar and deck rows `--surface` < dialogs `--surface-2`. Light mode stays flat paper. |
| T9 | Dynamic viewport | Already in place: the phone menu is `100dvh`, the evidence dialog `92dvh`, the career strip `svh`. The one plain `vh` left (the page sheet's clip) becomes `dvh`, and a test keeps plain `vh` out of the CSS. |
| T10 | Multiply blending | The paper grain moves over everything, blended `multiply` on paper and `screen` on slate, so every surface carries it (fixes B6). Evidence thumbnails blend `multiply` on paper, so white screenshot backgrounds take the paper tone; the full-size view stays unblended, so evidence stays true. This amends C52's "grain behind the content". |

## Global Constraints

- Everything from C53 still holds: data integrity, no client names, no emojis, private files never committed, gates `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` plus `pnpm test:e2e`, Lighthouse budgets (LCP ≤ 2000 ms, TBT ≤ 300 ms, CLS ≤ 0.05, home script ≤ 184,320 bytes).
- Every text and background pair keeps WCAG AA (4.5:1, or 3:1 for large text and the focus ring), checked by the token tests in OKLCH.
- C50: never fade text that stays. The blur swaps touch icons only.
- Reduced motion turns every new move off; print stays black on white with no grain and no blending.
- No AI attribution in commits or the PR.

## Review Focus

1. Multiply grain over text must not drop any text pair below AA on paper or slate (measured on screenshots at the darkest grain pixel).
2. Alpha borders must not erase form-field boundaries or the focus ring (3:1).
3. OKLCH tokens must render the same in Safari and Chromium; Firefox's support is assumed from its current release.
4. The masked strip edges must not hide the first or last skill when the strip is wrapped (reduced motion, no scroll-driven support).
5. A blurred swap repeated quickly (copying twice) must never leave both icons showing.

---

### Task 1: The bugs (B1–B10)

**Files:** `src/app/globals.css`, `src/components/motion/CvRing.tsx`, `tests/helpers/a11y.ts`, tests in `tests/e2e/{motion,motion-fallback,layout,cord,guards,overview}.spec.ts` and `tests/selftest/gates.spec.ts`.

- [ ] One failing test per bug before its fix:
  - B1: at 1440×2400 and 1080×1920, scrolled to the bottom, Contact's clip has no rounding and the arrow's `stroke-dashoffset` is 0.
  - B2: at 390 px, mid grow-in, the heading's left edge is inside the visible clip.
  - B3: at 1280 px, when the strip pins, the first step hasn't moved (`translate` x within 1 px of 0); at 844×390 likewise.
  - B4: under reduced motion, `.word` has `white-space: normal`.
  - B5: the selftest page gets a planted off-screen focus target, and the guard reports it obscured.
  - B7: two rings on a test page have distinct path ids (unit test on the id builder), and the text fits the circumference.
  - B8: the cord line and knob have a `drop-shadow` in the page colour.
  - B9: menu items rise 16 px.
  - B10: a plain `hover()` test under reduced motion opens a row's hook.
- [ ] Watch each fail, fix, watch it pass; full suite green. Commit: "Fix the bugs left from the motion reviews".

### Task 2: Colour in OKLCH, alpha borders, OKLCH mixes (T2, T3, T4)

**Files:** `src/styles/tokens.css`, `src/lib/contrast.ts`, `src/lib/tokens.ts`, `src/app/globals.css`; tests in `tests/unit/{tokens,contrast}.test.ts`, `tests/e2e/layout.spec.ts`.

- [ ] Unit tests first:
  - `oklchToRgb` matches known conversions (white, black, the current paper `#efe9de` within 1/255).
  - `parseTokens` reads `oklch()` values.
  - Every AA pair still passes in both themes.
  - Every `color-mix` and gradient in `globals.css` names `in oklch`.
- [ ] e2e: rules use an alpha border colour; form fields' boundary keeps at least 3:1 against their background.
- [ ] Convert, rerun, compare screenshots of home, About and a report in both themes against the current ones (the page colours should match within a just-noticeable difference).
- [ ] Commit: "Colour in OKLCH, alpha borders".

### Task 3: Shape, icons and edges (T1, T5, T6, T7, T9)

**Files:** `src/app/globals.css`, `src/components/ui/CopyButton.tsx`, `src/components/contact/ContactForm.tsx`, `src/components/content/EvidenceGallery.tsx`; tests in `tests/e2e/{motion,motion-fallback,layout}.spec.ts`, `tests/unit`.

- [ ] Failing tests first:
  - T1: the thumbnail radius equals the button radius plus its inset (computed), and likewise for the dialog.
  - T5: lucide strokes are non-scaling at 1.25 or 1.5 px by context.
  - T6: the strip and the career strip have a `mask-image`; it's absent where the strip wraps.
  - T7: a copy swap runs `icon-in` with blur; two quick copies end with one icon in the button (Review Focus 5); reduced motion runs none.
  - T9: no `100vh` remains in the built CSS.
- [ ] Implement, run green on three projects. Commit: "Concentric radii, matched icons, masked edges, blurred swaps".

### Task 4: Depth and blending (T8, T10)

**Files:** `src/app/globals.css`, `src/components/content/EvidenceGallery.tsx`; tests in `tests/e2e/{motion,resume}.spec.ts`, `tests/a11y/routes.spec.ts`.

- [ ] Failing tests first:
  - T8: in dark, the top bar's background is `--surface` and dialogs' is `--surface-2`, each with an inset top highlight; in light, unchanged.
  - T10: the grain is above content with `mix-blend-mode: multiply` on paper and `screen` on slate; thumbnails `multiply` on paper only; the full-size evidence view has no blend; print has no grain.
  - Review Focus 1: screenshot-sampled text contrast on paper and slate with the grain on stays at least 4.5:1 for body text.
- [ ] Implement, run green; axe in both themes. Commit: "Dark mode depth and multiply blending".

### Task 5: Decision, gates, review, PR

- [ ] C54 in `docs/04-DECISIONS.md` (amends C52's grain placement and C51's token values).
- [ ] Every gate, local Lighthouse 5×5, a fresh whole-branch review on the most capable model, one fix pass (red then green), screenshots for Vincent, then push and open "Fix the motion bugs; OKLCH, alpha borders and other polish".
