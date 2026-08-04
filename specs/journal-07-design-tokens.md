# 07 · Design Tokens — The Journal

Every value below was read directly from `design/blog-timeline.pen` via `GetVariables()` and from the confirmed frames — not re-derived, not "improved." Where the design used a Pencil variable (`$a-*`), the token name here is the direct translation. Where the design used a literal value inline (spacing/motion), the token is new but the *value* is taken from the frame as built.

Implementers: define these once (CSS custom properties on `:root`/a scoped class, or a JS/TS token module — match whatever pattern `src/css/custom.css` already uses for the site's existing Infima variables) and reference them everywhere. **Do not hardcode any hex/px value from this document a second time somewhere else in the codebase.**

---

## 1. Color

| Token | Value | Used for |
|---|---|---|
| `--journal-bg` | `#F4F5F6` | Page background |
| `--journal-bg-card` | `#FAFBFB` | Hero band background, Story Card background |
| `--journal-ink` | `#26292E` | Primary text (headings, numeral, title, nav-button icon on hover/focus) |
| `--journal-ink-secondary` | `#868D93` | Secondary text (captions, metadata, tags, nav-button icon default) |
| `--journal-border` | `#E1E4E7` | 1px hairlines (Hero top/bottom, nav-button circle stroke) |
| `--journal-accent` | `#5C7285` | Eyebrow "JOURNAL", "今天" label, Current Moment day-node fill |
| `--journal-accent-soft` | `#DCE3E7` | "今天" pill background, Moment Glow fill |
| `--journal-timeline-line` | `#D9DDE1` | Wave `<path>` stroke, default (non-current) day-node fill |

This is the **Scandinavian fog-blue** retheme the site owner explicitly chose over two other options during design (a warm-terracotta "MUJI" direction and a botanical-green "Aesop" direction were presented and not selected — do not resurrect either as a "would look nicer" substitution). Dark mode was never designed — see §6.

## 2. Typography

| Token | Value |
|---|---|
| `--journal-font-heading` | `Newsreader` |
| `--journal-font-body` | `Inter` |

Both are Google Fonts. **Check `docusaurus.config.js` and the existing site for whether either is already loaded before adding a new font-loading mechanism** (see `journal-08-implementation-plan.md` §Dependencies — the site's existing custom CSS may already standardize on system/Infima fonts; if so, follow that precedent's substitution pattern rather than introducing a new webfont `<link>` unilaterally, and document the substitution explicitly in the final report, exactly as the prior Portfolio Home implementation did for its own font question).

| Element | Font | Size (Desktop / Mobile) | Weight | Line-height | Letter-spacing | Color |
|---|---|---|---|---|---|---|
| Eyebrow "JOURNAL" | body | 13 / 11.5px | 600 | default | 3px / 2.5px | accent |
| Tagline | body | 13 / 11.5px | 400 | default | — | ink-secondary |
| Index caption | body | 12 / 11px | 400 | default | — | ink-secondary |
| Big numeral | heading | 128 / 84px | 300 | 0.9 | — | ink |
| Month text | body | 16 / 13px | 600 | default | 2px | ink |
| Year text | body | 13 / 11px | 400 | default | — | ink-secondary |
| "今天" label | body | 11 / 10px | 600 | default | — | accent |
| Card meta row | body | 13px (both) | 400 | default | — | ink-secondary |
| Card title | heading | 30px (both — not separately specified for mobile; scale down only if it visibly overflows during QA) | 500 | 1.3 | — | ink |
| Card preview | body | 16px (both) | 400 | 1.75 | — | ink-secondary |
| Card tags | body | 13px (both) | 400 | default | — | ink-secondary (separator uses `--journal-border`) |
| Card CTA label | body | 15px (both) | 500 | default | — | ink |
| Same-Day caption | body | 12 / 11px | 400 | default | — | ink-secondary |
| Nav caption | body | 13 / 11.5px | 400 | default | — | ink-secondary |

## 3. Spacing

| Token | Value | Notes |
|---|---|---|
| `--journal-space-xs` | 6px | Pencil shared token `gap-xs` |
| `--journal-space-sm` | 12px | Pencil shared token `gap-sm` |
| `--journal-space-md` | 20px | Pencil shared token `gap-md` |
| `--journal-space-lg` | 32px | Pencil shared token `gap-lg` |
| `--journal-space-xl` | 56px | Pencil shared token `gap-xl` |

Layout-specific paddings/gaps that do **not** map onto the shared scale above (use as literal values, or add as new named tokens if the codebase's convention prefers that — do not force them onto the nearest `space-*` token if it changes the actual number):

- Mini Header padding: `40px 80px 28px 80px` (desktop) / `32px 20px 14px 20px` (mobile).
- Hero padding: `36px 80px 30px 80px` (desktop) / `24px 20px 22px 20px` (mobile); Hero internal gap 26px / 18px.
- Content Area padding: `44px 80px 88px 80px` (desktop) / `24px 20px 40px 20px` (mobile); internal gap 18px / 14px.
- Card body padding: `44px 52px 52px 52px` (desktop) / `28px 26px 30px 26px` (mobile); internal gap 22px (both).
- Nav row gaps: 32px (desktop horizontal) / 24px (mobile horizontal); 8px / 6px (vertical, button-to-caption).
- Timeline right-side buffer: ≥90px (desktop) / ≥70px (mobile) — see UI Spec §3.2, this is a correctness constraint, not a stylistic choice; do not shrink it.

## 4. Radius

| Token | Value | Used for |
|---|---|---|
| `--journal-radius-card` | 20px | Story Card |
| `--journal-radius-pill` | 999px | "今天" pill, all nav-button circles |

No other radius value exists in this design. Do not introduce a generic "8px card" radius elsewhere in this feature.

## 5. Shadow

There is no shadow anywhere in the approved design — not on the Card, not on nav buttons, not on hover. `--journal-shadow: none` is a deliberate token (documenting its absence, not omitting shadow because no one thought about it). If any implementation adds a `box-shadow` to the Story Card "for depth," that is a spec violation — see `journal-10-review-checklist.md`.

## 6. Motion tokens

Duplicated here for completeness from `journal-04-motion-spec.md` §6 (that document is the source of truth for *why*; this table is the flat reference for implementers wiring up CSS/JS):

| Token | Value |
|---|---|
| `--journal-motion-duration-card-out` | 600ms |
| `--journal-motion-duration-card-in` | 800ms |
| `--journal-motion-duration-moment` | 700ms |
| `--journal-motion-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--journal-motion-translate-card` | 8px |
| `--journal-motion-wave-drift-period` | 18000ms |
| `--journal-motion-wave-drift-amplitude` | 0.05 rad |
| `--journal-motion-hover-transition` | 180ms linear |

## 7. Opacity

| Token | Value | Used for |
|---|---|---|
| `--journal-opacity-day-oldest` | 0.18 | Fade-curve floor for the oldest real entry (Interaction Spec §7/Motion Spec) |
| `--journal-opacity-day-current` | 1.0 | Current Moment day-node |
| `--journal-opacity-day-empty` | 0.12 | Empty (no-entry) day-node — a flat constant, not part of the fade curve (Interaction Spec §5) |
| `--journal-opacity-companion` | fade-value × 0.85 | Companion dot relative to its parent day-node's own computed opacity |
| `--journal-opacity-glow` | 0.75 | Moment Glow fill opacity (before blur) |
| `--journal-opacity-disabled-nav` | 0.35 | Disabled Prev/Next/Up/Down |

Real-entry day-node opacity formula (not a flat token — a function, see `journal-04-motion-spec.md`): `0.18 + 0.82 * (i / (totalRealEntries - 1))` where `i` is the entry's chronological index among *real entries only* (empty days are not part of this index — see Implementation Plan §Data Model for why the fade curve is indexed over real entries, not calendar days).

## 8. Breakpoint

| Token | Value |
|---|---|
| `--journal-bp-mobile-max` | 596px |
| `--journal-bp-tablet-min` | 597px |
| `--journal-bp-tablet-max` | 996px |
| `--journal-bp-desktop-min` | 997px |

These match Docusaurus/Infima's own existing breakpoint convention (`ifm-*` variables) — reuse the site's existing breakpoint mixins/variables if `src/css/custom.css` already defines them, rather than defining a second, possibly-inconsistent set. See UI Spec §7 for the explicit note that Tablet was not designed and its rules are interpolated defaults, not frozen numbers.

## 9. Sizes (component dimensions, for completeness — cross-reference UI Spec §2–5)

| Token | Desktop | Mobile |
|---|---|---|
| `--journal-numeral-size` | 128px | 84px |
| `--journal-hero-window-height` | 110px | 90px |
| `--journal-day-node-size` | 7px | 7px |
| `--journal-companion-dot-size` | 5px | 5px |
| `--journal-glow-size` | 64px | 48px |
| `--journal-glow-blur` | 16px | 12px |
| `--journal-card-max-width` | 680px | 100% (minus page padding) |
| `--journal-card-hero-image-height` | 250px | 200px |
| `--journal-nav-btn-horizontal` | 38px | 36px |
| `--journal-nav-btn-vertical` | 34px | 30px |
| `--journal-nav-icon-horizontal` | 16px | 15px |
| `--journal-nav-icon-vertical` | 15px | 13px |
