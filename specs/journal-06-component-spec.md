# 06 · Component Specification — The Journal

React component breakdown. No code in this document — see `journal-08-implementation-plan.md` for file paths and build order, `journal-09-task-breakdown.md` for how these map to independent tasks. All styling values referenced by name come from `journal-07-design-tokens.md`.

**Where this mounts:** these components render *inside* an ejected `@theme/BlogListPage` (see Implementation Plan §Architecture Decision). They receive real Docusaurus blog data as props from that theme component — none of them fetch data themselves or own a content/CMS layer.

---

## 1. `JournalPage` (top-level orchestrator)

- **Purpose:** Owns all navigation state. Computes the derived day-range/day-grouping from the real post list once, and re-derives it only when the post list itself changes (it doesn't, at runtime — it's a static build). Renders `JournalMiniHeader`, `JournalHero`, `JournalContentArea` in that order, nothing else. This is the component that *is* the ejected `BlogListPage`'s render output (or is mounted by it — see Implementation Plan).
- **Props:** `items: PropBlogListItem[]` (exact shape provided by Docusaurus's `BlogListPage` — array of `{ content: BlogPostContent }`, each `content` having a static `.metadata` with `title`, `date`, `formattedDate`, `description`, `permalink`, `tags`, `readingTime`, `frontMatter`); `metadata: BlogListPaginated` (pagination info from the plugin — not used by this design, since there's no pagination UI, but must be accepted and safely ignored, not destructured-and-crash if absent).
- **State:** `currentDayKey: string` (the `YYYY-MM-DD` of the day currently shown; initialized to the most recent day with an entry), `currentEntryIndexInDay: number` (initialized to `0`).
- **Children:** `JournalMiniHeader`, `JournalHero`, `JournalContentArea`.
- **Variants:** none — this component has exactly one visual form.
- **Dependencies:** the data-derivation hook `useJournalTimeline(items)` (see §8) — do not inline that logic into this component; keep it a pure, independently testable hook.

## 2. `JournalMiniHeader`

- **Purpose:** Static presentational header (UI Spec §2). Carries no navigation logic.
- **Props:** none (all copy is static per the frozen design — "JOURNAL", "· 時間留下的字", "詩 · 散文 · 旅行 · 生活"). If the site owner later wants this copy configurable via site config, that is a follow-up task, not part of this build — hardcode the approved copy for v1.
- **State:** none.
- **Children:** none (plain text nodes).
- **Variants:** responsive layout only (row on desktop, stacked on mobile) — pure CSS, not a prop-driven variant.
- **Dependencies:** design tokens only.

## 3. `JournalHero`

- **Purpose:** Full-bleed band containing the Numeral and the Wave Timeline (UI Spec §3). Purely a layout/composition component.
- **Props:** `currentMoment: JournalDay` (the day object for whichever day is currently shown — used to drive the Numeral, see §4), `days: JournalDay[]` (full day-range, passed through to `WaveTimeline`), `onSelectDay: (dayKey: string) => void`.
- **State:** none (stateless composition).
- **Children:** `JournalNumeral`, `WaveTimeline`.
- **Dependencies:** none beyond its children.

## 4. `JournalNumeral`

- **Purpose:** Renders the big day-number + month/year + "今天" pill (UI Spec §3.1). Pure presentational.
- **Props:** `date: Date` (the currently-shown day's date — note: this is whichever day the visitor is looking at, re-labeled live as they navigate, per PRD §7's "not a static widget" rule), `isMostRecent: boolean` (controls whether the "今天" pill renders at all — see Interaction Spec §7; only show the pill when the visitor is actually looking at the Current Moment, not on every day).
- **State:** none.
- **Variants:** desktop/mobile sizing via CSS only, not a prop.

## 5. `WaveTimeline`

- **Purpose:** The single most complex component — renders the SVG wave path, all day-nodes (real + empty), companion dots, and the Moment Glow; owns drag/scroll interaction and the idle phase-drift animation (Motion Spec §1–2, §5).
- **Props:** `days: JournalDay[]` (ordered oldest→newest, see §8 for shape), `currentDayKey: string`, `onSelectDay: (dayKey: string) => void`, `variant: "desktop" | "mobile"` (selects which constant set from Motion Spec §1 to use — `SPACING`/`PERIOD`/`AMP_MIN`/`AMP_MAX`/`CENTER_Y`/window height — prefer deriving this from a CSS media query / container width at runtime rather than a build-time prop if the component is rendered once for a fluid layout; expose it as a prop only if the implementation renders two separate trees for desktop/mobile).
- **State:** internal scroll/drag-offset position; internal `phase` value driving the idle drift (Motion Spec §2), ideally via `requestAnimationFrame`, paused entirely when `prefers-reduced-motion: reduce` (Accessibility Spec §3).
- **Children (rendered, not passed in):** the `<path>` wave line; one `<button>` (real day) or decorative `<circle>` (empty day) per entry in `days`; a companion `<circle>` for any day with `entryCount > 1`; one glow `<circle>` for the day matching `currentDayKey`.
- **Variants:** `desktop` / `mobile` per the differing wave constants (Motion Spec §1). This is the one component allowed a true breakpoint-driven variant, because the underlying math genuinely differs (not just CSS).
- **Dependencies:** the wave-math utility (pure function(s) implementing Motion Spec §1's formulas — extract to a small module, e.g. `waveMath.ts`, so `WaveTimeline` and any future preview/testing tool share one implementation, not two copies).

## 6. `StoryCard`

- **Purpose:** Renders exactly one entry (UI Spec §4). Pure presentational — receives fully-resolved data, does not know about "days," "current moment," or navigation.
- **Props:** `entry: { title, formattedDate, readingTimeMinutes, imageUrl?, previewText?, tags: string[], permalink }` (a normalized shape the parent derives from the raw Docusaurus `content.metadata` — see §8's normalization note).
- **State:** none.
- **Children:** none (all sub-blocks — hero image, metadata row, title, preview, tags row, CTA row — are internal markup of this one component, not separately reusable elsewhere in the app; do not over-factor this into five sub-components with no other call site).
- **Variants:** `hasImage: boolean` derived from `imageUrl` presence (UI Spec §4 point 1 — omit the image block entirely, don't render an empty/placeholder box); `hasTags: boolean` derived from `tags.length`; `hasPreview: boolean` derived from `previewText` presence. These are internal conditionals, not props the parent needs to pass explicitly.
- **Dependencies:** design tokens; no dependency on `WaveTimeline` or navigation state.

## 7. `NavButton`

- **Purpose:** The one shared visual component for Prev/Next/Up/Down (UI Spec §5) — a bordered circle with a centered icon, hover/focus color-shift (Interaction Spec §8–9), disabled state (Interaction Spec §2–3), and the 44px hit-area padding (Accessibility Spec §6).
- **Props:** `direction: "prev" | "next" | "up" | "down"` (selects icon + `aria-label` text per Accessibility Spec §4), `size: "horizontal" | "vertical"` (selects the 38/36px vs 34/30px sizing per UI Spec §5 table), `disabled: boolean`, `onClick: () => void`.
- **State:** none (hover/focus are CSS pseudo-states, not component state).
- **Children:** none (icon is resolved internally from `direction`).
- **Dependencies:** an icon set — the Pencil design used Lucide (`chevron-left/right/up/down`); if Lucide is not already a project dependency, see Implementation Plan §Dependencies for the "no new npm packages" constraint and the required substitution.

## 8. Data hook: `useJournalTimeline(items)`

Not a rendered component, but a required, independently-specifiable unit:

- **Purpose:** Turn the raw Docusaurus `items` prop into everything the components above need: the full `days: JournalDay[]` array (including empty days), an `entriesByDay` lookup, and helper functions `getPrevDayWithEntry(dayKey)`, `getNextDayWithEntry(dayKey)`.
- **`JournalDay` shape:** `{ dayKey: string /* YYYY-MM-DD */, date: Date, entries: NormalizedEntry[] /* 0..n */ }`.
- **Normalization:** maps each real Docusaurus post's `content.metadata` into the `NormalizedEntry` shape `StoryCard` expects (§6) — this is the one place responsible for pulling `title`, `formattedDate`, `metadata.readingTime` (already a number of minutes, from the plugin's built-in `showReadingTime` option — do not recompute reading time manually), `metadata.description` as `previewText` fallback, `frontMatter.image` (if the project ever adds one — see Implementation Plan §Data Model for what to do when it's absent today), `tags.map(t => t.label)`, `permalink`.
- **Never fabricates data.** If a field is missing on a real post (no description, no image, no tags), the corresponding `NormalizedEntry` field is `undefined`/`[]`, and `StoryCard`'s variant conditionals (§6) handle it — this hook must not invent placeholder text, a stock image, or fake tags.

## 9. Dependency graph (for build ordering — see Implementation Plan §Order)

```
useJournalTimeline  (no deps within this feature)
        │
        ▼
   JournalPage  ──────────────┬───────────────┐
        │                     │               │
        ▼                     ▼               ▼
JournalMiniHeader        JournalHero    JournalContentArea
                               │               │
                     ┌─────────┴───────┐   ┌────┴─────┐
                     ▼                 ▼   ▼          ▼
             JournalNumeral    WaveTimeline  NavButton  StoryCard
                                    │
                                    ▼
                              waveMath.js (pure util)
```

`NavButton` and `StoryCard` have no dependency on each other or on `WaveTimeline` — they can be built and reviewed in parallel (see Task Breakdown).
