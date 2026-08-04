# 08 · Implementation Plan — The Journal

This is the architecture document. It resolves every "how does this actually connect to the real Docusaurus site" question that `journal-01` through `journal-07` deliberately left as pure product/design/UX decisions. Read this before writing any code — it is the difference between building a real feature and building a mockup with fake data.

---

## 1. Repository facts (verified, not assumed)

- Framework: Docusaurus 3.9 (`@docusaurus/preset-classic`), React 19.
- Package scripts available: `dev` (`docusaurus start --port 3003`), `build`, `clear`, `serve`, `deploy`, `swizzle`, `write-translations`, `write-heading-ids`. **There is no `lint`, `test`, or `typecheck` script.** Do not invent calls to commands that don't exist; do not add new npm packages to introduce them either (see §6).
- The blog plugin is already configured (`docusaurus.config.js`, preset `blog` options): `showReadingTime: true` is already on. Good — reading time is already computed by the plugin for every real post; never hand-roll a word-count/reading-time calculation.
- Real content today: four **stock Docusaurus starter posts** under `blog/` (`2019-05-28-first-blog-post.md`, `2019-05-29-long-blog-post.md`, `2021-08-01-mdx-blog-post.mdx`, `2021-08-26-welcome/index.md`) plus `blog/authors.yml`, `blog/tags.yml`. None of these are the site owner's real personal journal entries — they are template placeholders that ship with `create-docusaurus`.
- The site already has a separate `docs/` tree (Notes, technical knowledge base) and a custom Portfolio home (`src/pages/index.js`, `src/components/PortfolioHome/**`, delivered in a prior implementation round — see `specs/portfolio-home-implementation.md` for that precedent's conventions). This feature must not touch either of those trees.

## 2. Architecture decision: how the Journal actually replaces `/blog`

**Decision: eject-swizzle `BlogListPage`.**

```
npm run swizzle @docusaurus/theme-classic BlogListPage -- --eject
```

This copies Docusaurus's default `BlogListPage` implementation into `src/theme/BlogListPage/index.js` (or `.tsx` if the ejected output is TS — match whatever the installed theme version emits, do not force-convert file extensions). From that point, this file's *rendering* is fully ours to replace with `JournalPage` (Component Spec §1) — but the **props it receives are still populated by the real blog plugin's data-loading pipeline**, exactly as before ejecting. This is why eject (not "wrap," and not a brand-new custom page/route) is the correct choice: it is the only swizzle mode that lets us fully replace the visual output while still being handed real `items`/`metadata` props sourced from actual Markdown files, with zero risk of the implementer inventing a parallel fake data layer.

Do **not**:
- Create a new standalone page (`src/pages/journal.js`) with hand-fetched or hardcoded post data. That would duplicate the blog plugin and drift from real content immediately.
- Use "wrap" swizzle mode. Wrap mode renders the *original* list UI and only lets you wrap it with extra markup before/after — insufficient for a full visual replacement.
- Modify `docusaurus.config.js` blog plugin options beyond what's already there, unless a specific new option is required and justified (e.g. if pagination needs to be disabled because this design shows one entry at a time rather than a paginated list — check `postsPerPage`/`routeBasePath` defaults first; it is likely fine to leave pagination config alone and simply have the ejected page request/receive *all* posts via the plugin's existing "load all posts into the list page for page 1" behavior, since real content volume here is small. If real content ever grows large enough that this becomes a genuine performance problem, that is a future task, not part of this build.)

The blog's individual post-detail route (`/blog/<slug>`) is unaffected by this feature — `BlogPostPage`/`BlogPostItem` are not swizzled, not restyled. "只客製列表頁的 UI" (per the site owner's original brief) means exactly this list/index page, not the post reading page.

## 3. Data model: reconciling "every calendar day gets a node" with sparse real content

This is the single most important judgment call in this plan, because Pencil's mock showed a dense, continuous 60-day wave, but the *real* four starter posts span **2019-05-28 to 2021-08-26** (~820 days), and once the site owner replaces these stub posts with real journal entries, the actual cadence is unknown and will almost certainly be sparse (not one post per day).

**Rule (derived from PRD §6 "every calendar day gets a node, including empty ones," confirmed against the site owner's explicit ask): the day-range is `[earliest real post's date, most recent real post's date]`, inclusive, at daily granularity — not `[earliest post, literal today]`.**

Rationale, stated explicitly so a future maintainer doesn't "fix" this into using `new Date()`:
- The Journal is retrospective ("回到某一天"), not a live countdown to now. `Current Moment` = most recent real entry (PRD §7), not the visitor's browser clock.
- Extending the range to literal "today" would, for this repo's current content, paint roughly 5 empty years of inert dots past the last real post for no reason, and would silently change every time someone loads the page on a different day even with zero new content — a page that mutates its own rendered day-count on every visit without new data is a bug, not a feature.
- This also means: **the wave is potentially very wide** (hundreds or low thousands of days × `SPACING`), which is intentional — see UI Spec §3.2 and Interaction Spec §4, "the timeline extends beyond the viewport and is scrollable" was an explicit design requirement, not an implementation compromise to work around.

**Fade-curve indexing (ties to Design Tokens §7):** the opacity fade (`0.18 + 0.82 * i/(n-1)`) is indexed over **real entries only**, `i = 0` at the oldest real post, `i = n-1` at the most recent. Empty days do not participate in this formula at all — they use the flat `--journal-opacity-day-empty` constant. This avoids a degenerate case where, if entries are sparse, two adjacent *real* entries years apart would otherwise get nearly-identical fade values under a naive "index by day" scheme.

**Grouping for "multiple articles in one day":** group real entries by `dayKey = date.toISOString().slice(0,10)` (calendar day in the site's configured timezone — if the project has no explicit TZ handling anywhere else, match whatever Docusaurus's own date parsing does with the post's frontmatter `date` field; do not introduce a new timezone-conversion layer this feature doesn't otherwise need).

## 4. What happens with the current four stub posts

Do not delete, rewrite, or "fix" the four existing stub posts' content or dates — they are out of scope (§6, file boundaries) and deleting placeholder content the site owner hasn't asked to remove is exactly the kind of unrequested cleanup this project's own working conventions warn against. The Journal must render correctly against *whatever* posts exist, including these four — that's the real integration test (see `journal-09-task-breakdown.md` acceptance criteria and `journal-10-review-checklist.md`).

Do **not** author new blog Markdown files that pretend to be the site owner's personal essays/poems (e.g. do not create a "雨天的清邁" post — that was illustrative placeholder copy invented for the Pencil mockup and the specs above, purely to describe *layout*, never intended as real content to ship). If the acceptance test needs at least one multi-entry day to visually verify Interaction Spec §6, it is acceptable to add **one** clearly-marked test-fixture post with a date matching an existing stub post's date (same-day grouping needs ≥2 posts sharing a `dayKey` to be testable at all) — title it plainly, e.g. "Journal 版面測試草稿" with a body that says outright it's a placeholder for QA, not journal-worthy prose. Record this fixture explicitly in the final report so the site owner can delete it before publishing.

## 5. File boundaries

**Allowed to create:**
- `src/theme/BlogListPage/index.{js,jsx,tsx}` (the ejected entry point, swizzle-generated then rewritten)
- `src/components/Journal/**` (new directory — all components from `journal-06-component-spec.md`)
- `src/components/Journal/useJournalTimeline.{js,ts}` (or under a `hooks/`/`lib/` subfolder, implementer's call)
- `src/components/Journal/waveMath.{js,ts}`
- `src/components/Journal/*.module.css` (one CSS Module per component, matching the existing project convention already used by `PortfolioHome` and `HomepageFeatures`)
- One test-fixture blog post, only if needed per §4, clearly named and flagged in the report.

**Read-only (do not modify):**
- `docusaurus.config.js` (unless a truly required, narrowly-scoped blog-plugin option change is identified — if so, treat it like the prior spec's Blocker convention: make the smallest change possible and call it out explicitly in the report rather than silently editing broader config)
- `sidebars.js`
- `package.json` / `package-lock.json` (see §6 — no new dependencies without an explicit substitution note)
- `src/css/custom.css` (read it for existing font/breakpoint conventions; do not add Journal-specific rules into this shared global file — keep them scoped to the new CSS Modules)
- `src/pages/index.js`, `src/components/PortfolioHome/**`, `src/components/HomepageFeatures/**`, `src/components/ui/**` (unrelated features)
- Everything under `docs/`
- The four existing stub posts under `blog/` and `blog/authors.yml`/`blog/tags.yml` (content untouched; §4)
- `design/blog-timeline.pen` (never write to the design file from code)

## 6. Dependencies

**No new npm packages.** Two known gaps to resolve via substitution, documented in the final report (same convention as the prior Portfolio Home build):

- **Icons:** the design used Lucide icons (`chevron-left/right/up/down`, `arrow-right`). Check whether an icon package is already a dependency (it was not, as of this plan's writing — `package.json` §1 above lists no icon library). Do not add `lucide-react`. Substitute inline SVG (a tiny local component per icon, 4–5 simple chevron/arrow paths — cheap, dependency-free, and exactly matches Lucide's visual style closely enough for this purpose) or the project's existing `theme-svg-external-link` inline-SVG pattern already visible in the site's generated HTML (`<symbol>` defs) as a precedent for how this codebase already prefers inline SVG over icon packages.
- **Fonts:** Newsreader (heading) is not currently loaded anywhere in the project (verify via the same method the prior Portfolio Home spec used — grep for `@font-face`/`fonts.googleapis` in `docusaurus.config.js` and `custom.css`). Inter may already satisfy the body-font token closely via the site's existing default font stack — check `--ifm-font-family-base` in `custom.css` first. If neither is loaded: adding **one** Google Fonts `<link>` (or a self-hosted `@font-face`, if the project has a "no external network requests" preference — check for one before assuming) for Newsreader only (do not add Inter as a webfont if the system/Infima default already renders acceptably close) is a reasonable, narrowly-scoped exception to "no new dependencies," since it's a font load, not an npm package — but it must be called out explicitly in the final report as a deliberate, scoped addition, exactly like the prior build's font-substitution note.

## 7. Implementation order

1. `waveMath.js` (pure functions, zero React, easiest to get exactly right and to sanity-check numerically against `journal-04-motion-spec.md` §1 before any component touches it).
2. `useJournalTimeline.js` (pure data transform, no rendering — can be verified against the real four stub posts by logging its output before any UI exists).
3. `StoryCard` (fully static, only needs one hand-built sample `NormalizedEntry` to develop against — does not depend on the hook or the timeline yet).
4. `NavButton` (fully static, in parallel with step 3).
5. `JournalNumeral`, `JournalMiniHeader` (fully static, in parallel with steps 3–4).
6. `WaveTimeline` (the hard one — depends on `waveMath.js` from step 1 and a `days` array shaped like step 2's output; build against a hand-built fixture array first, then wire to the real hook).
7. `JournalHero`, `JournalContentArea`, `JournalPage` (composition — wires steps 2–6 together, owns state per Component Spec §1).
8. Eject `BlogListPage`, mount `JournalPage` with the real `items` prop.
9. Full-page QA against `journal-10-review-checklist.md`, using the real (stub) blog content, at Desktop/Tablet/Mobile.

Steps 3–5 can happen in parallel (see `journal-09-task-breakdown.md` for how these map to independent, parallelizable tasks). Step 6 is the critical path and should not be parallelized further.
