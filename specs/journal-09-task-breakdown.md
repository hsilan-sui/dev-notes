# 09 · Task Breakdown — The Journal

Independent, sequential-by-default tasks for an unattended coding agent (Codex CLI). Follow the order below unless a task explicitly says it may run in parallel with another. Each task lists its own acceptance criteria — do not move to the next task until the current one's criteria are met, and do not batch multiple tasks into one giant commit-worth of changes without checking each task's own DoD along the way.

Global rules that apply to every task (do not repeat per-task, but they are binding on all of them):
- Follow `journal-01` through `journal-08` exactly. If a task's instructions here ever seem to conflict with one of those documents, the more detailed document (usually `journal-02` UI Spec or `journal-08` Implementation Plan) wins; if truly ambiguous, choose the more conservative/quieter interpretation (Motion Philosophy, PRD §4) and record the judgment call in the final report.
- No new npm dependencies (Implementation Plan §6) beyond the two explicitly-scoped, explicitly-reported exceptions (icon substitution via inline SVG — not a package; possible single Newsreader font `<link>`).
- No commits, no pushes, no deploys, no `npm install`, no dependency upgrades, no editing `docs/`, no editing the four existing stub blog posts' content.
- Every task's "Definition of Done" includes: the dev server (`npm run dev`) starts without new console errors attributable to this feature, and `npm run build` completes successfully before the task is considered finished (not just "before the whole feature is finished" — catch build breakage per-task, not at the very end).

---

### TASK-00 — Design tokens

- **Goal:** Add every token from `journal-07-design-tokens.md` as CSS custom properties, scoped so they don't leak into/collide with the rest of the site (e.g. under a `.journal-scope` class applied at the Journal's root, or under `:root` with a `--journal-` prefix if the project's existing convention is global `:root` variables — check `src/css/custom.css` first and follow its existing pattern rather than inventing a new one).
- **Files:** new `src/components/Journal/tokens.css` (or equivalent), imported once from the Journal's top-level component.
- **Dependencies:** none.
- **Acceptance Criteria:** every token name in `journal-07-design-tokens.md` §1–9 exists and resolves to the exact value listed. No token value is hardcoded a second time anywhere else once this task is done (later tasks reference `var(--journal-*)`, not literals).
- **Definition of Done:** `npm run build` succeeds; visually inspecting the token file confirms every color/spacing/motion/opacity/breakpoint/size value matches the spec table exactly (manual diff against the doc, not "looks about right").
- **Estimated complexity:** Trivial.
- **Risk:** Low. The only real risk is silently rounding a value (e.g. 22px → 20px) — double-check every number against the source doc, not memory.

### TASK-01 — `waveMath` utility

- **Goal:** Implement the pure functions from `journal-04-motion-spec.md` §1: `amplitude(x, trackWidth, ampMin, ampMax)`, `waveY(x, trackWidth, opts)`, `buildWavePathD(days, spacing, ...)`, `dayNodePosition(index, spacing, ...)`. Desktop and mobile constant sets both supported via a parameter object, not two copies of the logic.
- **Files:** new `src/components/Journal/waveMath.js`.
- **Dependencies:** TASK-00.
- **Acceptance Criteria:** given the exact Desktop constants from Motion Spec §1 (`DAYS=60` sample, `SPACING=22, PERIOD=340, AMP_MIN=6, AMP_MAX=16, CENTER_Y=55, PHASE=0.6`), the function output for `trackWidth`, and for `waveY(x)` at a few spot-checked `x` values, must match hand-computed values from the formula (compute 3–5 spot checks yourself while implementing and leave them as unit-style sanity assertions or a short comment showing the check — there is no test runner in this project, so this verification lives as inline reasoning/comments, not a `*.test.js` file).
- **Definition of Done:** the module has zero React/DOM dependency (importable and callable from a plain Node REPL); build succeeds.
- **Estimated complexity:** Small.
- **Risk:** Low, but a sign error or off-by-one in `x`'s domain (`0..trackWidth` vs `0..trackWidth-1`) is easy to introduce silently — re-read Motion Spec §1 literally rather than "simplifying" the formula.

### TASK-02 — `useJournalTimeline` hook

- **Goal:** Implement the data-derivation hook per `journal-06-component-spec.md` §8 and `journal-08-implementation-plan.md` §3–4: take real Docusaurus `items`, normalize each into a `NormalizedEntry`, group by `dayKey`, build the full continuous `days` array (including empty days) spanning earliest→latest real entry, compute each real entry's fade-curve index/opacity, expose `getPrevDayWithEntry`/`getNextDayWithEntry`.
- **Files:** new `src/components/Journal/useJournalTimeline.js`.
- **Dependencies:** TASK-00 (opacity tokens only; otherwise independent of TASK-01).
- **Acceptance Criteria:** run against the repository's real four stub posts (via a small throwaway harness/log during development — remove the throwaway harness before finishing, don't leave debug `console.log`s in the shipped hook) and confirm: (a) day-range spans 2019-05-28 to 2021-08-26 inclusive: `real earliest date` → `real most recent date`; (b) `days.length` equals the exact inclusive day-count between those two dates; (c) no day is missing or duplicated; (d) if two stub posts ever share a `dayKey` today they don't (confirm this — the four stub posts currently all fall on distinct days), so the "multiple entries" path is *not yet* exercised by real data alone — see TASK-03a below for how to still test it.
- **Definition of Done:** hook never throws on the real current content; build succeeds; no fabricated fields (Implementation Plan §4 — verify by inspecting the normalized output for any post missing an image/description/tags and confirming the corresponding field is empty/undefined, not a placeholder string).
- **Estimated complexity:** Medium.
- **Risk:** Medium — timezone/date-parsing edge cases (a post dated at UTC midnight might land on the "wrong" local day depending on how it's parsed) are the most likely subtle bug here; follow Implementation Plan §3's instruction to match whatever date handling Docusaurus itself already uses for `formattedDate`, rather than introducing a second, possibly-inconsistent date parser.

### TASK-03 — Inline SVG icon set (dependency substitution)

- **Goal:** Build the 5 small icon components needed (`chevron-left`, `chevron-right`, `chevron-up`, `chevron-down`, `arrow-right`) as simple inline SVG React components, visually equivalent to the Lucide icons used in the Pencil design, with no new npm dependency (Implementation Plan §6).
- **Files:** new `src/components/Journal/icons/*.jsx` (one file per icon, or one file exporting all five — implementer's call, keep it small).
- **Dependencies:** none (can run in parallel with TASK-01/02).
- **Acceptance Criteria:** each icon accepts `size`/`color` (or accepts a className and is styled via CSS `currentColor`/`width`/`height` — either pattern is fine, pick one and use it consistently across all five) and renders recognizably as its named chevron/arrow direction at the sizes listed in Design Tokens §9 (13–16px).
- **Definition of Done:** visually spot-checked at 13px and 16px (the two extremes actually used) — a chevron that's illegible at 13px needs a simpler path, not a smaller stroke-width hack.
- **Estimated complexity:** Small.
- **Risk:** Low.

### TASK-03a — Test fixture for "multiple entries in one day" (optional, only if needed for QA)

- **Goal:** Per `journal-08-implementation-plan.md` §4, add exactly one clearly-labeled placeholder blog post sharing a `dayKey` with an existing stub post, solely so TASK-07/TASK-08's multi-entry UI (companion dot, vertical nav) can be visually verified against real plugin data rather than only unit-tested in isolation.
- **Files:** one new file under `blog/` (e.g. `blog/2021-08-26-journal-layout-test/index.md`, sharing the date of the existing `2021-08-26-welcome` post), title and body must state plainly it is a QA fixture, not real content.
- **Dependencies:** none.
- **Acceptance Criteria:** after adding it, `useJournalTimeline`'s output shows that `dayKey` with `entries.length === 2`.
- **Definition of Done:** the fixture's existence and exact file path is called out by name in the final report under a "Test fixtures added — delete before publishing" heading.
- **Estimated complexity:** Trivial.
- **Risk:** Low, provided it is clearly labeled and reported (the only real risk is it being forgotten and mistaken for real content later).

### TASK-04 — `StoryCard` component

- **Goal:** Build per `journal-06-component-spec.md` §6 and `journal-02-ui-spec.md` §4, using tokens from TASK-00. Develop against 2–3 hand-built sample `NormalizedEntry` objects covering: an entry with an image+tags+preview, an entry with none of those (tests the omit-don't-placeholder rule), a long title (tests wrapping/growth, not truncation).
- **Files:** new `src/components/Journal/StoryCard.jsx` + `StoryCard.module.css`.
- **Dependencies:** TASK-00, TASK-03 (for the CTA arrow icon).
- **Acceptance Criteria:** all three hand-built samples render correctly, including the "omit the block entirely" cases (no gray placeholder box, no "no image available" text, no empty tag-separator dangling).
- **Definition of Done:** matches UI Spec §4 padding/gap/font numbers exactly at both 680px (desktop) and full-width-mobile contexts.
- **Estimated complexity:** Medium.
- **Risk:** Low–Medium. The most likely mistake is rendering pill/chip-styled tags (this design explicitly forbids that — UI Spec §4 tags row) or adding a card-level hover shadow (also explicitly forbidden — Interaction Spec §8).

### TASK-05 — `NavButton` component

- **Goal:** Build per `journal-06-component-spec.md` §7, `journal-02-ui-spec.md` §5, `journal-03-interaction-spec.md` §8–9, and `journal-05-accessibility-spec.md` §6 (44px hit-area padding) simultaneously — this component is small but has to satisfy visual, interaction, and accessibility specs all at once.
- **Files:** new `src/components/Journal/NavButton.jsx` + `.module.css`.
- **Dependencies:** TASK-00, TASK-03.
- **Acceptance Criteria:** all four `direction` variants render at both `size` variants; disabled state is both visually dimmed (opacity token) and functionally inert (`aria-disabled` + `disabled`, not just a CSS class); hover and focus-visible states are visually distinguishable from default and from each other's absence (i.e. focus-visible must not rely solely on `:hover` styles).
- **Definition of Done:** keyboard-Tab to each button variant and confirm a visible focus ring in addition to the border/icon color shift.
- **Estimated complexity:** Small.
- **Risk:** Low.

### TASK-06 — `JournalNumeral` + `JournalMiniHeader`

- **Goal:** Build both static/near-static components per Component Spec §2 and §4.
- **Files:** new `JournalMiniHeader.jsx`, `JournalNumeral.jsx` + CSS Modules.
- **Dependencies:** TASK-00.
- **Acceptance Criteria:** `JournalNumeral` correctly formats an arbitrary `Date` into the big-number/month/year layout in the site's locale (match whatever locale/date-formatting convention Docusaurus's own `formattedDate` already uses — do not introduce a new date-formatting library); "今天" pill only appears when `isMostRecent` is true.
- **Definition of Done:** visually correct at both breakpoints per UI Spec §3.1 and §2.
- **Estimated complexity:** Small.
- **Risk:** Low.

### TASK-07 — `WaveTimeline` component

- **Goal:** The critical-path component. Build per Component Spec §5, consuming TASK-01's `waveMath` and a `days` array shaped like TASK-02's output (develop first against a hand-built fixture `days` array with a deliberate mix of empty days, single-entry days, and — using TASK-03a's fixture once available — a multi-entry day, before wiring to the real hook).
- **Files:** new `WaveTimeline.jsx` + `.module.css`.
- **Dependencies:** TASK-00, TASK-01, TASK-02 (or its fixture stand-in), TASK-03a (to visually confirm the companion-dot path).
- **Acceptance Criteria:** every requirement in `journal-03-interaction-spec.md` §2, §4, §5, §6, §7 is implemented: click-to-select on real day-nodes, empty days inert and `aria-hidden`, horizontal drag with decel settle (Motion Spec §5), idle phase-drift respecting `prefers-reduced-motion` (Accessibility Spec §3), companion dot + glow rendering exactly per UI Spec §3.2 sizes, right-side buffer ≥90/70px verified with the actual glow never clipped.
- **Definition of Done:** manually drag the timeline in a running dev server and confirm it decelerates rather than snapping; toggle OS-level reduced-motion and confirm the idle drift stops; confirm via browser devtools that empty-day elements are not in the Tab order.
- **Estimated complexity:** Large.
- **Risk:** Medium–High. This is the one component where visual fidelity (Pencil screenshots), interaction correctness, motion feel, and accessibility all intersect — budget real QA time here, don't rush to TASK-08 before this is solid.

### TASK-08 — `JournalHero`, `JournalContentArea`, `JournalPage`

- **Goal:** Compose everything built so far per Component Spec §1/§3, owning navigation state (current day/entry index), wiring Prev/Next/Up/Down to `useJournalTimeline`'s helpers, wiring the Card transition motion (Motion Spec §4) between navigations.
- **Files:** new `JournalHero.jsx`, `JournalContentArea.jsx`, `JournalPage.jsx` + CSS Modules.
- **Dependencies:** TASK-02 through TASK-07 (all of them — this is the integration step).
- **Acceptance Criteria:** every behavior in `journal-03-interaction-spec.md` end-to-end: loading the page shows the Current Moment; Prev/Next change days and always land on that day's first entry; Up/Down (when present) change entries within a day without changing the day; disabled-button states appear correctly at both ends of the real data range; the live region (Accessibility Spec §4) announces title changes on navigation.
- **Definition of Done:** a full manual click-through of every control against the real (stub + TASK-03a fixture) content, in a running dev server, with no console errors/warnings.
- **Estimated complexity:** Medium–Large.
- **Risk:** Medium. State-management bugs (stale index after a day-change, vertical index not resetting to 0 on a horizontal move — Interaction Spec §2) are the likely failure mode; re-read Interaction Spec §2's exact reset rule before wiring the Prev/Next handlers.

### TASK-09 — Eject `BlogListPage` and mount

- **Goal:** Run the swizzle-eject command (Implementation Plan §2), replace the ejected component's render with `<JournalPage items={props.items} metadata={props.metadata} />`, confirm the real `/blog` route now renders the Journal.
- **Files:** `src/theme/BlogListPage/index.{js,jsx,tsx}` (modified after swizzle generates it).
- **Dependencies:** TASK-08.
- **Acceptance Criteria:** `npm run dev`, visit `/blog` (actual route, do not create a separate `/journal` route), confirm the Journal renders with the real four stub posts (+ TASK-03a fixture if added) and not the default Docusaurus blog list UI. Individual post pages (`/blog/<slug>`) remain unmodified/default.
- **Definition of Done:** `npm run build` succeeds and the built output's `/blog/index.html` contains the Journal markup (spot-check the built HTML, not just the dev server).
- **Estimated complexity:** Small (mechanically), but only after everything upstream is solid.
- **Risk:** Low, provided TASK-00–08 are done; the main risk at this step is discovering a real-data edge case (e.g. a post with no `date` frontmatter falling back to filename-derived date in a way `useJournalTimeline` didn't anticipate) — if so, that's a TASK-02 bug surfacing late, fix it there, don't patch around it in the theme file.

### TASK-10 — Full QA pass + final report

- **Goal:** Run every checklist item in `journal-10-review-checklist.md`, at Desktop and Mobile widths (and a quick Tablet sanity check per UI Spec §7's interpolation), against the real, running dev server and the production build.
- **Files:** none (verification only) plus the report file itself.
- **Dependencies:** TASK-09.
- **Acceptance Criteria:** every item in the Review Checklist is either confirmed passing or listed as a named Blocker with a reason.
- **Definition of Done:** final report written per this repo's existing convention (see `.codex-reports/portfolio-home-final.md` for the expected shape/sections) to `.codex-reports/journal-final.md`, including: tasks completed/partial, full file diff list, build/dev results, placeholder/fixture inventory (must include TASK-03a's fixture if added, and the font-loading decision from Implementation Plan §6), known risks, rollback instructions for a human.
- **Estimated complexity:** Medium (mostly time, not difficulty).
- **Risk:** Low, but this is the step most likely to be rushed — do not skip items in the checklist to finish faster.
