# 02 · UI Specification — The Journal

Source of truth: `design/blog-timeline.pen`, frame **`Journal C — Timeline as Hero`** (id `jOpJc`, 1440×auto) for Desktop, frame **`Mobile Journal — Wave Timeline`** (id `X8cSJ`, 390×auto) for Mobile. Every number below was read directly from those frames (or the shared `Story Card Journal` component, id `NeXhk`) via the Pencil MCP — nothing here is invented. **Tablet was not designed in Pencil.** §Tablet gives an explicit, clearly-labeled interpolation; do not treat it as equally authoritative to Desktop/Mobile.

Colors and font names are referenced by token name only (`$a-bg`, etc.) — see `journal-07-design-tokens.md` for resolved values. Do not hardcode hex values in components; import tokens.

---

## 1. Page structure (top to bottom, both breakpoints)

1. Mini Header
2. Timeline Hero Zone (contains: Numeral block + Wave Timeline)
3. Content Area (contains: Same-Day Up control → Card Nav Row [Prev · Story Card · Next] → Same-Day Down control → Nav Caption)
4. Site Footer (existing Docusaurus footer — unchanged, out of scope for this feature)

There is no sidebar in this design. The site's existing left-hand docs sidebar belongs only to `/docs` (Notes) and must not appear on the Journal route. There is no secondary/related-posts rail, no author bio card, no comment section — deliberately, to keep exactly one focal point on screen.

## 2. Header

Called "Mini Header" in the design — intentionally minimized so the Hero (§3) is the first thing a visitor's eye lands on, not the header.

**Desktop** (padding `[40, 80, 28, 80]` — top/right/bottom/left, `space_between` row, vertically centered):
- Left: "Wordmark" group (horizontal, gap 10): eyebrow text **"JOURNAL"** (Inter 13px / weight 600 / letter-spacing 3px / color `$a-accent`) + tagline text **"· 時間留下的字"** (Inter 13px / regular / color `$a-ink-secondary`).
- Right: index caption **"詩 · 散文 · 旅行 · 生活"** (Inter 12px / color `$a-ink-secondary`).

**Mobile** (padding `[32, 20, 14, 20]`, vertical stack, gap 6):
- Row 1 — Wordmark (horizontal, gap 8): eyebrow (11.5px / 600 / letter-spacing 2.5px) + tagline (11.5px).
- Row 2 — index caption (11px), left-aligned under the wordmark (no `space_between` on mobile — it does not fit two columns at 390px).

There is no navbar link list, no search box, no theme toggle inside this component — those belong to the site's existing global navbar (`docusaurus.config.js` navbar), which sits *above* this Mini Header and is unaffected by this feature.

## 3. Hero (Timeline Hero Zone)

This is the dominant visual region of the page — see PRD §5, "the timeline is the anchor." It is a **full-bleed** band (edge-to-edge, breaking out of the page's side margins) with a top and bottom 1px hairline (`stroke: $a-border`, `strokeWidth: {top:1, bottom:1, left:0, right:0}`) and background `$a-bg-card` (very slightly lighter than the page background `$a-bg` — the only "stage" cue; there is no drop shadow anywhere in this design).

**Desktop:** padding `[36, 80, 30, 80]`, vertical layout, centered, gap 26 between the Numeral block and the Timeline Window.
**Mobile:** padding `[24, 20, 22, 20]`, gap 18.

### 3.1 Numeral block

A horizontal row, centered, gap 20 (desktop) / 14 (mobile):

| Element | Desktop | Mobile |
|---|---|---|
| Big day number (e.g. `"04"`) | Newsreader, 128px, weight 300, line-height 0.9, color `$a-ink` | 84px, same weight/line-height |
| Month column (vertical stack, gap 4/3, top padding 8/6) | | |
| — Month text (e.g. `"AUG"`) | Inter 16px / 600 / letter-spacing 2px / `$a-ink` | 13px / 600 / letter-spacing 2px |
| — Year text (e.g. `"2026"`) | Inter 13px / `$a-ink-secondary` | 11px |
| — "Today" pill (padding `[4,10]`/`[3,9]`, corner-radius 999, fill `$a-accent-soft`) containing label **"今天"** | Inter 11px / 600 / `$a-accent` | 10px / 600 |

This numeral **always shows the Current Moment's date** (see PRD §7 / Interaction Spec §Current Moment) — it is not a static "today" widget, it re-renders whenever the Current Moment changes. The "今天" label is copy, not a literal claim that the calendar date is today — see Interaction Spec for the exact rule.

### 3.2 Timeline Window + Wave Timeline

A clipping viewport, full-bleed width, fixed height **110px desktop / 90px mobile**, `overflow: hidden` (`clip: true` in Pencil), content right-aligned inside it (`justifyContent: "end"` in Pencil terms — in CSS, the track is right-anchored and everything older overflows/clips on the *left* only, never the right).

Inside the window sits one continuous **Timeline Track**, wider than the window, containing:

1. **Wave Line** — a single open SVG `<path>`, stroke-only (`stroke: $a-timeline-line`, `stroke-width: 1.5`, `stroke-linecap: round`, no fill), sampled as a smooth polyline. Exact waveform math (must be reproduced, not re-derived): see `journal-04-motion-spec.md` §Wave Math.
2. **Day nodes** — one small circle per calendar day in range (default size **7×7px**, all identical size, no exceptions). See Interaction Spec §Timeline for the opacity-fade and glow rules.
3. **Companion dots** — a tiny **5×5px** circle offset ~9.5px above a day-node's center, present only on days that have more than one entry. See Interaction Spec §Multiple articles in one day.
4. **Moment Glow** — a soft blurred circle (**64×64px desktop / 48×48px mobile**, fill `$a-accent-soft`, opacity 0.75, blur radius **16px desktop / 12px mobile**) centered on the Current Moment's node, rendered *behind* it.

The right-side buffer inside the track (space reserved after the last/most-recent day-node before the track's own right edge) must be at least **90px desktop / 70px mobile** so the glow and any companion dot never get clipped by the window. This was a real bug caught during design QA (see `journal-10-review-checklist.md`) — do not shrink this buffer.

## 4. Article Card (Story Card)

Exactly one instance visible at a time, centered in the Content Area, max-width **680px** on Desktop, full-width (minus page padding) on Mobile. Background `$a-bg-card`, corner-radius **20px**, `overflow: hidden` (clip), no border, no shadow.

**Structure, top to bottom:**

1. **Hero image** — width 100%, height **250px desktop / 200px mobile**, `object-fit: cover`. If a post has no declared image, render the card *without* this block entirely (do not render a placeholder/gray box in production — the gray placeholder in Pencil was a design-tool stand-in only).
2. **Card body** — padding desktop `[44, 52, 52, 52]` (card default) — *the Desktop Journal-C instance overrides nothing on body padding, keep the component default* — Mobile override `[28, 26, 30, 26]`. Vertical stack, gap **22px**.
   - **Metadata row** (horizontal, gap 10, center-aligned): `{formattedDate}` (Inter 13px / `$a-ink-secondary`) + `"·"` separator + `{readingTime} 分鐘閱讀` (same style). Both values come from the real post (Docusaurus's built-in `readingTime` plugin option is already enabled — see `journal-08-implementation-plan.md`).
   - **Title** — Newsreader 30px / weight 500 / line-height 1.3 / `$a-ink`. Full post title, wraps (`fixed-width`, no truncation to a fixed number of lines — if a title is long, the card grows taller; do not `line-clamp` the title).
   - **Preview** — Inter 16px / line-height 1.75 / `$a-ink-secondary`. Sourced from the post's real excerpt (content before its `<!-- truncate -->` marker, or `frontMatter.description` if present) — **never** a fabricated summary. If neither exists, render nothing for this block (no Lorem ipsum, no auto-generated summary).
   - **Tags row** (horizontal, gap 8, center-aligned) — plain text tags separated by `"·"` (color `$a-border` for the separator, `$a-ink-secondary` 13px for tag labels). Deliberately **not** pill/chip components with background fill — that reads as "News Card," which this design explicitly avoids (see PRD §3). Source: the post's real `frontMatter.tags`. If a post has zero tags, omit the row.
   - **CTA row** (horizontal, gap 8, top padding 16) — a quiet text link, not a filled button: label **"繼續閱讀"** (Inter 15px / 500 / `$a-ink`) + a `chevron-right`/`arrow-right` icon (15px / `$a-ink`). Links to the post's real permalink. No background fill, no border, no hover-elevate shadow.

## 5. Navigation controls

All navigation is expressed as quiet outline icon-buttons — never filled, never carrying a drop shadow, always a **1px `$a-border` stroke circle** with a centered Lucide icon in `$a-ink-secondary`.

| Control | Desktop size / icon size | Mobile size / icon size | Purpose |
|---|---|---|---|
| Prev / Next (horizontal) | 38px / 16px, gap 32 between prev–card–next | 36px / 15px, gap 24 | Move to the previous/next **day** that has an entry |
| Up / Down (vertical) | 34px / 15px | 30px / 13px | Move to the previous/next **entry within the same day** — only rendered when that day has >1 entry (see Interaction Spec) |

**Same-Day Up** control (only when applicable) sits directly above the Card Nav Row, with a caption underneath it: **"同一天，還有 {n} 篇"** (Inter 12px/11px, `$a-ink-secondary`). The **Same-Day Down** control sits directly below the Card Nav Row, icon-only, no caption (avoids repeating the same sentence twice on screen).

**Nav Caption** (below everything, centered, Inter 13px/11.5px, `$a-ink-secondary`, text-align center on mobile): **"沿著時間軸往前，翻閱更早以前寫下的字。"** — static copy, always visible, describes the horizontal direction only (the vertical caption already explains itself contextually).

## 6. Footer

Out of scope. The existing Docusaurus theme footer (configured in `docusaurus.config.js` → `themeConfig.footer`) renders below this feature unchanged. Do not add a Journal-specific footer.

## 7. Breakpoints

| Name | Width | Status |
|---|---|---|
| Desktop | 1440px design reference; fluid ≥ 997px (Docusaurus's own `ifm` desktop breakpoint) | Explicitly designed in Pencil |
| Mobile | 390px design reference; fluid ≤ 596px | Explicitly designed in Pencil |
| **Tablet** | 597–996px | **Not designed.** Interpolate: keep the Mobile vertical Mini-Header stack until ~768px then switch to the Desktop horizontal `space_between` header; scale the Hero numeral to ~104px; keep the Timeline Window at 100px height; keep the Card at Mobile's full-bleed-minus-padding width but raise hero-image height to ~220px. Treat every tablet number in this paragraph as a reasonable default, not a pixel contract — if it looks visually broken at a specific tablet width during QA, prefer the nearest Desktop or Mobile rule over inventing something new. |

## 8. Spacing rules that must not be "optimized away"

These are the specific numbers the site owner already approved and asked to freeze. Do not round them to a nearby value in your spacing scale unless that exact value is added as a token (see `journal-07-design-tokens.md`).

- Hero right-side track buffer: **≥ 90px desktop / ≥ 70px mobile** (see §3.2 — prevents glow/companion clipping).
- Card corner-radius: **20px**, not 16 or 24.
- Card body gap: **22px** between metadata/title/preview/tags/CTA blocks.
- Nav control gaps: **32px** (desktop horizontal), **24px** (mobile horizontal), **8px** (up/down internal gap to their own caption).
- Mini Header top padding: **40px desktop / 32px mobile** — this is deliberately less than a typical hero top padding; the smallness of the header is itself a design decision (PRD §5), not an oversight to "fix."
