# Portfolio Home Implementation Spec

Status: Ready for execution
Author: Claude Code (Technical Lead / Frontend Architect role)
Consumer: OpenAI Codex CLI (autonomous, no human in the loop during execution)
Source of truth: `design/portfolio-home.pen` → board **"Portfolio Home — Selected Direction"**, confirmed boards `Portfolio Selected — Desktop 1440`, `Portfolio Selected — Tablet 768`, `Portfolio Selected — Mobile 390`.

This document is **self-contained**. Codex does not need Pencil, the Pencil MCP, or any design tool to execute it. Every dimension, color, spacing value, and piece of copy referenced below was read directly out of the confirmed Pencil boards and the current repository — nothing here is inferred or invented. Anywhere real data (a URL, an asset, an email) could not be found in the repository, this document says so explicitly and tells Codex to use a safe placeholder instead of fabricating one.

---

## 0. Non-negotiable execution rules (read first)

Codex runs unattended. When in doubt, resolve using this priority order:

1. Follow this spec's exact numbers/copy over any personal judgment.
2. Reuse existing project conventions (see §3) over inventing new patterns.
3. Reuse existing dependencies over adding new ones.
4. Use a clearly-marked placeholder over fabricating a link, asset, number, or metric.
5. Never fabricate: URLs, emails, GitHub repos, YouTube links, screenshots, résumé files, usage numbers, or outcomes that do not already exist in this repository.
6. Never delete files unrelated to this task.
7. Never touch `docs/` sidebar structure, never remove Docusaurus scaffolding docs, never rewrite existing technical notes content.
8. Never upgrade dependencies, never run `npm audit fix`, never add new npm packages.
9. Never run `git push`, never create a commit, never deploy, never modify CI/CD.
10. Never modify `design/portfolio-home.pen`.
11. Only work inside this repository's working directory.
12. If a requirement cannot be completed due to a missing real asset/credential/service: finish everything else that IS safely completable, leave an explicit `TODO:` code comment at the exact spot, and record it as a **Blocker** in the final report. Do not stop the whole task because one piece is blocked.

### Hard file boundary for this task

**Allowed to modify/create:**
- `src/pages/index.js`
- `src/pages/index.module.css` (may be emptied/removed if fully superseded — see TASK-11)
- `src/components/PortfolioHome/**` (new directory tree, created by this task)
- (optional, only if truly needed and justified in the PR notes) new files under `static/img/portfolio/` as placeholder image slots — **no image generation**, only if you need an empty/placeholder asset file explicitly called out below.

**Read-only context (do not modify):**
- `design/portfolio-home.pen`
- `docusaurus.config.js`
- `sidebars.js`
- `package.json`, `package-lock.json`
- `src/css/custom.css`
- `src/components/HomepageFeatures/**`
- `src/components/ui/Highlight.jsx`
- `src/theme/**`
- everything under `docs/`
- everything else under `static/`

If at any point a change to a read-only file seems necessary, stop, do not make it, and record it as a Blocker instead.

---

## 1. Goal

Replace the current ad-hoc homepage (`src/pages/index.js` + `index.module.css`) with the confirmed **Portfolio Home — Selected Direction** design, implemented as composable React components + CSS Modules, fully responsive at Desktop/Tablet/Mobile, respecting Docusaurus's existing Navbar, Footer, theming, dark mode, and routing.

The homepage must communicate, in this order: positioning (Backend / Automation / AI Engineer) → three Selected Projects with real evidence-oriented media → one More Project (公仔辨識系統) → Engineering Capabilities tied to real projects → a Technical Notes entry point → a final CTA to résumé/portfolio/GitHub.

---

## 2. What already exists in the repository (read before writing code)

### 2.1 Current homepage (to be replaced)

- `src/pages/index.js` — a `HomepageHeader` (hero with floating skill-tag bubbles + rotating orbit ring) plus three generic 3-card grid sections (`focusAreas`, a split highlight panel, `noteBuckets`). **All content in this file is being superseded by this spec.**
- `src/pages/index.module.css` — matching styles, including the floating/orbit animations. These are exactly the "floating tech bubbles" and "SaaS landing page" patterns the confirmed design explicitly avoids (see design brief §七 in the design thread — avoid floating tech bubbles, avoid generic SaaS template feel).
- `src/components/HomepageFeatures/index.js` + `styles.module.css` — the **stock Docusaurus starter component** (3 SVG feature cards: "Easy to Use", "Focus on What Matters", "Powered by React"). **It is not imported by `index.js` today** (confirmed by reading the file — no `HomepageFeatures` import exists). It is dead code from the template, out of scope, do not touch it.
- `src/components/ui/Highlight.jsx` — an inline-style `<Highlight>` span used inside MDX docs content, unrelated to the homepage. Do not touch.

### 2.2 Design tokens already wired into the site theme (`src/css/custom.css`)

These Infima CSS variables already match the Pencil design tokens almost exactly. **Reuse them — do not redefine colors that already exist.**

| Infima variable | Light value | Dark value | Matches Pencil token |
|---|---|---|---|
| `--ifm-background-color` | `#FFFDF8` | `#111827` | `bg-warm` (`#FFFDF8`) — exact match in light mode |
| `--ifm-background-surface-color` | `#FFFFFF` | `#182230` | `bg-surface` (`#FFFFFF`) — exact match in light mode |
| `--ifm-heading-color` | `#1D2733` | `#FFF7F2` | `text-primary` (`#1D2733`) — exact match in light mode |
| `--ifm-font-color-secondary` | `#4F6175` | `#C6D2DE` | `text-secondary` (`#4F6175`) — exact match in light mode |
| `--ifm-color-primary` | `#BD3F1B` | `#FF9C72` | `accent` (`#BD3F1B`) — exact match in light mode |
| `--ifm-color-primary-dark` | `#AA3818` | `#FF8551` | `accent-dark` (Pencil uses `#9D3516`, close enough — reuse, do not add a duplicate variable) |
| `--ifm-color-primary-light` | `#CF4920` | `#FFB394` | `accent-light` (`#CF4920`) — exact match in light mode |
| `--ifm-font-color-base` | `#223041` | `#EDF2F7` | body text; dark value exact-matches Pencil `text-on-dark` |

No Google Fonts / webfonts are loaded anywhere in this project (`custom.css` has no `@font-face` or font-family override; `docusaurus.config.js` has no stylesheet injection). The Pencil file used `Noto Sans TC` for body text and `IBM Plex Mono` for mono/eyebrow/tag text, but **do not add new font loading** (no new `<link>`, no new npm font package — that violates the "no new dependencies / no unnecessary network requests" rule). Instead:
- Body/heading font → `var(--ifm-font-family-base)` (Infima's existing default, already renders Traditional Chinese correctly across the whole site today).
- Mono font (used for eyebrows, tags, duration badge) → a system monospace stack: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. This is a documented, deliberate substitution — record it in the final report, not a silent deviation.

### 2.3 Real assets already in the repository (use these, do not invent new ones)

| Asset | Path | Use |
|---|---|---|
| Profile photo | `static/img/me.png` | **Use as the real Hero avatar image.** The Pencil board used a generic person-icon placeholder circle only because Pencil has no way to import site assets — the real site already has a real photo. Render `<img src={useBaseUrl('/img/me.png')} />` inside the avatar circle instead of an icon placeholder. |
| LINE OA QR code | `static/img/line-oa-qr.png` | Real asset, currently unused by any page. Optional: may be referenced by the LINE OA project card as a small supplementary element only if it does not change the confirmed layout. Not required for this task; do not force it in if it breaks the approved Pencil composition. |
| Site logo | `static/img/logo.png`, `static/img/logo.svg` | Already wired into the Docusaurus navbar via `docusaurus.config.js`. Not part of homepage body content. |

### 2.4 Real routes and links already in the repository (use these, do not invent new ones)

| Label | Real target | Source |
|---|---|---|
| GitHub (general) | `https://github.com/hsilan-sui/sui-dev-notes` | `docusaurus.config.js` navbar + footer |
| LINE OA (real, live) | `https://line.me/R/ti/p/@998enzsc` | `docusaurus.config.js` footer "Contact" |
| 求職入口 / résumé & job-hunt summary | `/docs/job-hunt-portfolio` | `docs/job-hunt-portfolio.md` (real page, id `job-hunt-portfolio`, slug `/job-hunt-portfolio` → resolved route `/docs/job-hunt-portfolio`) |
| LINE OA 互動作品集 案例總覽 | `/docs/LINEOA-PORFOLIO/overview` | `docs/LINEOA-PORFOLIO/00-overview.mdx` (already linked from navbar/footer as "代表專案") |
| 地政圖資小幫手 案例 + 流程圖 | `/docs/LINEOA-PORFOLIO/11-landinfo-project` | `docs/LINEOA-PORFOLIO/11-landinfo-project.mdx` (real page; contains both the write-up and the mermaid flow diagram — use the same URL for both "查看案例" and "查看流程") |
| 技術筆記總覽 | `/docs/intro` | `docs/intro.md` (real page, already linked from navbar as "技術筆記") |

### 2.5 Confirmed missing real data — DO NOT FABRICATE

These were searched for across `docs/`, `docusaurus.config.js`, `package.json`, and `static/` and **do not exist**. Codex must not invent them:

- **心理諮商地圖**: no dedicated case-study page, no live demo URL, no GitHub repo. The LINE OA overview doc (`docs/LINEOA-PORFOLIO/00-overview.mdx`) mentions the feature narratively ("心理諮商... 事前是做好Next架設靜態網站") but there is no separate URL to link to.
- **地政圖資小幫手**: no dedicated GitHub repo found (only the general `sui-dev-notes` repo exists, which is the docs/notes site, not confirmed to be this project's backend code).
- **公仔辨識系統**: no GitHub repo and no YouTube link found anywhere in the repository.
- **Email address**: no email exists anywhere in `docusaurus.config.js`, `docs/`, or `package.json`.
- **Résumé PDF / external résumé link**: does not exist. `/docs/job-hunt-portfolio` is the real, existing substitute and must be used for any "查看履歷" or "求職摘要" CTA.
- **LINE OA demo video file**: no video asset exists in `static/`.
- The four "Technical Notes" list item titles from the Pencil design (非同步任務設計筆記 / LINE Webhook 除錯紀錄 / 地圖資料清理與地理資訊筆記 / 部署與環境設定紀錄) are **category labels from the design mockup, not confirmed real document titles**. Some candidate files exist under `docs/LINEOA-PORFOLIO/` but several have `" copy"` in their filename (e.g. `06-worker-queue-and-callback copy.mdx`), which signals unresolved/duplicate WIP files — do not assume these are the final canonical target pages.

§4 and §7 below specify exactly how to wire each of these cases safely (real link where available, explicit disabled/TODO placeholder where not).

---

## 3. Project conventions to follow

- Component folders follow the existing `src/components/HomepageFeatures/` pattern: a folder with `index.js` + `styles.module.css`, default export, CSS Modules imported as `styles`.
- Use `clsx` for conditional class composition (already a dependency, already used in `index.js`).
- Use `@docusaurus/Link` for all internal/external links (already used in `index.js`), not raw `<a>`, so Docusaurus's active-link/broken-link checking (`onBrokenLinks: "throw"` in `docusaurus.config.js`) can catch mistakes at build time. **This means: every internal `to=` must be a real route, or the production build will fail (`onBrokenLinks: "throw"`).** External links (`href=`) must include `target="_blank" rel="noopener noreferrer"`.
- Use `useBaseUrl` (already imported today) for any static asset path (`/img/...`).
- No CSS-in-JS, no styled-components, no Tailwind — this project only uses CSS Modules + Infima. Do not introduce a new styling system.
- No test framework, no linter config, no TypeScript config exist in this repository today (confirmed via `package.json` — see §11). Do not introduce one as part of this task.

---

## 4. Confirmed design content (verbatim from Pencil, cross-checked against real data)

### 4.1 Positioning (Hero)

- Eyebrow: `Backend / Automation / AI Engineer`
- Headline: `把複雜流程整理成可被使用、維護與持續迭代的產品與系統。`
- Intro paragraph: `專注 Backend、自動化與 AI 應用的實作。把資料擷取、非同步任務、外部系統整合與地理資訊查詢，整理成可以真正被使用、被維護的產品。從需求釐清、架構設計到部署上線，我負責把整條路徑走完。` (Mobile uses a shortened variant — see §6.3.)
- Capability chips (static, 4 total, no animation, no icons orbiting): `Backend API`, `Queue / Worker`, `自動化整合`, `地圖 / 公共資料`.
- CTA buttons: Primary `查看作品` → scroll/link to Selected Projects section (`#selected-projects` anchor on the same page). Secondary `查看履歷 / 求職摘要` → `/docs/job-hunt-portfolio` (real). Ghost `GitHub` → `https://github.com/hsilan-sui/sui-dev-notes` (real, external).
- Identity block: avatar (`static/img/me.png`, circular, bordered) + name `于方成 Yu Fang-Cheng` + role `Backend / Automation / AI`.

### 4.2 Selected Projects (tier 1 — exactly 3, in this order)

**1. 心理諮商地圖** — media type **Screenshot**
- Problem: `問題：公共心理諮商資源分散、難以依地區與條件查詢。`
- Solution: `解法：整理公共資料，做成可用地圖瀏覽、依距離排序與條件篩選的資源查詢入口。`
- Tags: `Next.js`, `Leaflet`, `資料清理`, `地理資訊`, `公共資料產品化`
- Media placeholder note: `建議補入畫面：地圖主畫面（篩選條件 + 資源列表 + 標記點）`
- Links: "查看案例" → **disabled/TODO** (no real page — see §4.4). "開啟地圖 Demo" → **disabled/TODO** (no live URL). "GitHub" → **disabled/TODO** (no confirmed repo). Optionally surface a real alternative: "透過 LINE 體驗" → `https://line.me/R/ti/p/@998enzsc` (real), since the feature is reachable through the LINE OA per its overview doc.

**2. 地政圖資小幫手** — media type **Result Preview**
- Problem: `問題：地號圖資查詢分散在政府網站，手動截圖存檔耗時。`
- Solution: `解法：串接地號輸入、網頁查詢、圖資擷取與 LINE 回傳，整條流程自動化。`
- Tags: `Playwright`, `BullMQ`, `Queue / Worker`, `Cloud Storage`, `LINE Push`
- Media placeholder note: `建議補入畫面：地號查詢結果、LINE 回傳畫面、自動化流程示意圖`
- Links: "查看案例" → `/docs/LINEOA-PORFOLIO/11-landinfo-project` (real). "查看流程" → same URL (the mermaid flowchart lives on the same page — do not invent a separate anchor/slug). "GitHub" → **disabled/TODO** (no confirmed repo).

**3. LINE OA 互動作品集** — media type **Video Preview**
- Problem: `問題：履歷與作品分散在多個連結，面試官難以快速瀏覽。`
- Solution: `解法：把履歷、作品導覽與可操作 Demo 整合進 LINE 對話入口，直接互動查看。`
- Tags: `FastAPI`, `LINE Messaging API`, `Webhook`, `Redis`, `Queue / Worker`
- Caption under media: `點擊播放 30 秒操作展示 · 首頁不自動播放`
- Duration badge: `0:30`
- Media placeholder note (inside the pillarboxed phone frame — see §6.2): `LINE 對話畫面`
- Links: "查看案例" → `/docs/LINEOA-PORFOLIO/overview` (real). "播放 30 秒展示" → **no video file exists**; render as a disabled/inert control (see §4.4) — must never point to a broken/empty video player. "立即體驗" → `https://line.me/R/ti/p/@998enzsc` (real, external).

### 4.3 More Projects (tier 2 — exactly 1 for now, section must be able to hold more later)

**公仔辨識系統** — media type **YouTube**
- Description: `使用影像辨識流程識別公仔，是 AIoT 訓練期間完成的真實成果，可完整觀看專案影片與原始碼。`
- Tags: `影像辨識`, `AIoT`, `Python`
- Links: "觀看專案影片" → **disabled/TODO** (no YouTube URL found). "GitHub" → **disabled/TODO** (no repo URL found).
- Below the card: static text `更多作品陸續整理中` (not a link — just signals the section is extensible).

### 4.4 Disabled / TODO link behavior (applies everywhere in §4.2–4.3)

Any link marked **disabled/TODO** above must:
1. Render as a non-interactive element — `<span>` or `<button type="button" disabled aria-disabled="true">`, never an `<a href="#">` or `<a href="">`.
2. Keep the same label and icon as the design (so the layout matches Pencil exactly and nothing visually breaks).
3. Use a visibly muted style: `opacity: 0.5; cursor: not-allowed;` via a shared `.linkDisabled` class in `TechTags`/`ProjectCard`'s CSS module.
4. Optionally carry `title="尚未提供，補齊素材後再串接"` for a native tooltip.
5. Have an adjacent `{/* TODO: ... */}` code comment stating exactly what real data is missing (repo URL / YouTube URL / demo URL), so the next person can grep for `TODO:` and find every open item.

This satisfies "no broken/dead links, no fabricated links, no empty video player" simultaneously.

---

## 5. Component architecture

All new files live under `src/components/PortfolioHome/`. `src/pages/index.js` becomes a thin wrapper that renders `<Layout>` + `<PortfolioHome />` (Docusaurus's real Navbar/Footer come from `<Layout>` automatically — **do not build a custom Navbar or Footer component**; see §5.1).

```
src/components/PortfolioHome/
  index.js                          → PortfolioHome (orchestrator)
  styles.module.css                 → shared CSS custom properties + .container + section rhythm (see §8)
  data/
    projects.js                     → project content + link data (see §7)
  PortfolioHero/
    index.js
    styles.module.css
  SectionHeading/
    index.js
    styles.module.css
  SelectedProjects/
    index.js
    styles.module.css
  ProjectCard/
    index.js                        → renders both "feature" and "compact" visual variants via a `variant` prop
    styles.module.css
  ProjectMedia/
    index.js                        → dispatches by `type` prop: 'screenshot' | 'result' | 'video' | 'youtube'
    styles.module.css
  TechTags/
    index.js
    styles.module.css
  MoreProjects/
    index.js
    styles.module.css
  EngineeringCapabilities/
    index.js                        → also contains the small internal CapabilityItem row renderer (not split into its own file/folder — it has no independent reuse outside this list, so a nested component in the same file is enough; see rationale below)
    styles.module.css
  TechnicalNotes/
    index.js
    styles.module.css
  FinalCallToAction/
    index.js
    styles.module.css
```

### 5.1 Why no custom Navbar/Footer component

The Pencil boards include a Navbar frame and a Footer frame purely so each board reads as a complete page mockup. The real site already has:
- A configured navbar (`docusaurus.config.js` → `themeConfig.navbar`, items: 求職入口 / 代表專案 / 技術筆記 / GitHub) with built-in responsive collapse to a hamburger menu below Infima's `lg` breakpoint (996px) — this already matches the Pencil Tablet/Mobile "Navbar 收斂" requirement with zero extra code.
- A configured footer (`docusaurus.config.js` → `themeConfig.footer`, 3 columns: Portfolio / Notes / Contact, dark style) that already contains 履歷 (求職入口), GitHub, and LINE OA contact links.

**Decision: do not build any Navbar or Footer React component for the homepage.** `<Layout>` renders both automatically. The `Final CTA` component (§5, §7) is the homepage's own content block with its own buttons — it is not a footer replacement, it sits above the real Docusaurus footer in normal page flow.

### 5.2 Component responsibilities

#### `PortfolioHome` (`src/components/PortfolioHome/index.js`)
- **Responsibility**: page-level orchestrator; renders sections in order; owns the shared `.portfolioHome` wrapper class that defines the CSS custom properties (§8) inherited by every child.
- **Props**: none (root component).
- **Data source**: imports `data/projects.js`.
- **Reusable**: no (page-specific).
- **Pencil mapping**: the full "Selected Direction" board minus Navbar/Footer.
- **Desktop/Tablet/Mobile**: no layout logic itself — delegates to CSS. Renders identical JSX at all sizes; all responsive behavior is CSS-only (media queries), per §8.
- **New file**: yes.

#### `PortfolioHero` (`PortfolioHero/index.js`)
- **Responsibility**: renders eyebrow, headline, intro, CTA row, capability chips, avatar + identity.
- **Props**: none needed (content is static copy per §4.1 — no need for a data file here, see §7 rationale).
- **Data source**: hardcoded JSX strings (this is the one exception to "no inline content" — see §7).
- **Reusable**: no.
- **Pencil mapping**: `Hero` frame on all three boards.
- **Desktop**: two-column (`display:grid; grid-template-columns: minmax(0,1.2fr) minmax(220px,0.35fr)`), avatar column on the right, `align-items:center`.
- **Tablet**: single column, stacked (text block, then avatar+identity centered below), matches Tablet board exactly (avatar is NOT moved above the text at this breakpoint — only Mobile reorders).
- **Mobile**: single column; **explicit render order in JSX must be: eyebrow → headline → intro → CTA buttons (full width, stacked) → GitHub ghost link → capability chips (wrapped) → avatar+identity block last.** This is a real DOM order requirement, not just a visual `order:` CSS trick, because it also improves reading order for accessibility/SEO (positioning statement before personal image).
- **New file**: yes.

#### `SectionHeading` (`SectionHeading/index.js`)
- **Responsibility**: renders the repeated `eyebrow + title + (optional) description` header pattern used by Selected Projects, More Projects, and Engineering Capabilities.
- **Props**: `{ eyebrow: string, title: string, description?: string, id?: string }` (`id` used for the `#selected-projects` in-page anchor target from the Hero's primary CTA).
- **Data source**: passed by parent.
- **Reusable**: yes — this is the one clear cross-section repeat in the design (identical structure appears 3 times), so it earns a shared component per the "avoid duplicating structure 3+ times" guideline.
- **Pencil mapping**: `Section Header` frame (appears identically in Selected Projects / More Projects / Engineering Capabilities on every board).
- **Desktop/Tablet/Mobile**: font-size steps down at each breakpoint per §8.4 typography table; no structural change.
- **New file**: yes.

#### `SelectedProjects` (`SelectedProjects/index.js`)
- **Responsibility**: renders the section header + the 3 selected projects using `ProjectCard`.
- **Props**: none (reads from `data/projects.js`, filters `tier === 'selected'`).
- **Data source**: `data/projects.js`.
- **Reusable**: no.
- **Pencil mapping**: `Selected Projects` frame.
- **Desktop**: first project (`心理諮商地圖`) renders with `<ProjectCard variant="feature">` inside a full-width row; the remaining two render with `<ProjectCard variant="compact">` inside a 2-column row below (`display:grid; grid-template-columns: 1fr 1fr; gap: 32px`).
- **Tablet/Mobile**: all three render with `<ProjectCard variant="compact">` stacked in a single column, same order (Map → LINE OA → Land). There is no "feature" visual distinction below desktop — this matches the confirmed Tablet/Mobile boards exactly (they flatten to identical card shapes).
- **New file**: yes.

#### `ProjectCard` (`ProjectCard/index.js`)
- **Responsibility**: renders one project's media + name + problem + solution + tags + links, in either `feature` (media beside content, desktop only) or `compact` (media above content) visual arrangement. **This merges what the design brief called "ProjectFeature" and "ProjectCard" into one component with a `variant` prop**, because the only difference between the two is orientation/sizing, not structure or data shape — keeping them as two near-duplicate components would violate the "no unnecessary duplication" convention. This decision must be kept; do not re-split them.
- **Props**: `{ project: ProjectData, variant: 'feature' | 'compact' }`.
- **Data source**: `data/projects.js` entry passed by parent.
- **Reusable**: yes (used by `SelectedProjects` and `MoreProjects`).
- **Pencil mapping**: `Project Feature — …` and `Project — …` frames on every board.
- **Desktop**: `variant="feature"` → `display:flex; flex-direction:row; gap:40px` (media 600×380 fixed width, content `flex:1`). `variant="compact"` → `display:flex; flex-direction:column; gap:12px`, media full width of its column.
- **Tablet/Mobile**: both variants render as `flex-direction:column` (feature variant collapses to the same shape as compact below desktop — implement via a `min-width` media query, not a JS breakpoint check).
- **New file**: yes.

#### `ProjectMedia` (`ProjectMedia/index.js`)
- **Responsibility**: the single place that knows how to render each of the 4 media types. Pure presentational dispatcher.
- **Props**: `{ type: 'screenshot' | 'result' | 'video' | 'youtube', placeholderNote: string, typeLabel: string, aspect?: { desktop: [w,h], tablet: [w,h], mobile: [w,h] }, caption?: string, durationLabel?: string, links?: {...} }` — exact shape defined in §7.
- **Data source**: `data/projects.js` per-project `media` object.
- **Reusable**: yes — this is the component described in the design brief as the "Project Media Component" that must support multiple media forms without forcing every project into the same shape.
- **Pencil mapping**: the `Media` frame + its `Type Label` / `Play Button` / `Duration Badge` overlay children, across all 4 media-type variants and all 3 boards.
- **Behavior by type**:
  - `screenshot` / `result`: renders a bordered placeholder box (icon + `placeholderNote` text, centered) at the fixed per-breakpoint dimensions in §6.1. No play button, no duration badge. Top-left `typeLabel` pill (`PRODUCT SCREENSHOT` / `RESULT PREVIEW`).
  - `video`: renders the 16:9 pillarboxed "phone" composition described in §6.2 — fixed 16:9 outer box, a centered vertical placeholder ("phone screen") sized so it never gets stretched into a wide/cropped shape, a centered play button (visual only, not a real player), a `durationLabel` badge bottom-right, top-left `typeLabel` pill. **Must never render a broken/empty `<video>` tag** — since no video file exists yet, this stays a static placeholder with a disabled-looking play affordance (see §4.4 for the accompanying link's disabled state; the play button icon itself is decorative and does not need a `disabled` attribute since it is not a link).
  - `youtube`: renders a true 16:9 box (`aspect-ratio: 16 / 9`) at the dimensions in §6.1, a placeholder thumbnail (icon + note) since no real thumbnail exists, a centered play button, top-left `YOUTUBE` label. No pillarboxing needed (YouTube content is natively landscape).
- **Desktop/Tablet/Mobile**: exact pixel dimensions come from the tables in §6.1/§6.2 — implement via CSS custom properties set per breakpoint, not JS `window.innerWidth` checks.
- **New file**: yes.

#### `TechTags` (`TechTags/index.js`)
- **Responsibility**: renders a wrapping list of small pill tags (the `Tag Pill` component from Pencil).
- **Props**: `{ tags: string[] }`.
- **Data source**: passed by parent.
- **Reusable**: yes (used inside `ProjectCard` and `MoreProjects`).
- **Pencil mapping**: `Tag Pill` component (reusable in Pencil too) and its per-card `Tags` rows.
- **Desktop/Tablet/Mobile**: implemented with `display:flex; flex-wrap:wrap; gap:6px–8px` (real CSS wrap — the Pencil file simulated wrapping with manual rows since Pencil has no flex-wrap; the real CSS implementation should use actual `flex-wrap: wrap`, which is strictly better/more robust than the manual row-splitting used in the mockup).
- **New file**: yes.

#### `MoreProjects` (`MoreProjects/index.js`)
- **Responsibility**: renders the section header + the 公仔辨識系統 card (`ProjectCard variant="compact"` with `media.type = 'youtube'`) + the "更多作品陸續整理中" note.
- **Props**: none (reads `tier === 'more'` from `data/projects.js`).
- **Data source**: `data/projects.js`.
- **Reusable**: no.
- **Pencil mapping**: `More Projects` frame.
- **Desktop**: card uses `flex-direction:row` (media 400×225 fixed + content) inside a light-subtle-background section (`--ph-bg-subtle`).
- **Tablet/Mobile**: card stacks `flex-direction:column`, media becomes full-width 16:9.
- **New file**: yes.

#### `EngineeringCapabilities` (`EngineeringCapabilities/index.js`)
- **Responsibility**: renders the section header + 5 capability items, each with icon, title, description, and an "對應作品" evidence pill.
- **Props**: none (owns its own local array of 5 items — see §7 rationale for why this one array stays local instead of in `data/projects.js`).
- **Internal sub-render**: a local, non-exported `CapabilityItem({icon, title, description, evidence})` function inside the same file — **not** a separate folder/file, since it has no reuse outside this list and splitting it would add an import for no benefit.
- **Data source**: local constant array (5 entries, exact copy in §7.3).
- **Reusable**: no.
- **Pencil mapping**: `Engineering Capabilities` frame.
- **Desktop**: `display:grid; grid-template-columns: repeat(3, 1fr); gap:32px` — 5 items wrap naturally into a 3+2 grid (CSS grid auto-wraps; no manual row-splitting needed in code, unlike the Pencil mockup which had to hand-split rows because Pencil's layout engine has no grid/wrap).
- **Tablet**: `grid-template-columns: repeat(2, 1fr)` → 2+2+1.
- **Mobile**: `grid-template-columns: 1fr` → single column, all 5 stacked.
- **New file**: yes.

#### `TechnicalNotes` (`TechnicalNotes/index.js`)
- **Responsibility**: renders the dark panel with heading/description/CTA on one side and a 4-row link list on the other (desktop) or stacked (tablet/mobile).
- **Props**: none.
- **Data source**: local constant array of 4 `{ icon, label }` entries (see §7.4 — **no `href` per item**, see §4.5/§7.4 for the single shared real link decision).
- **Reusable**: no.
- **Pencil mapping**: `Technical Notes` frame.
- **Desktop**: `display:flex; justify-content:space-between; gap:64px` (two columns).
- **Tablet**: `flex-direction:column; gap:28px` (heading block, then list, matching the Tablet board's nested "Notes Top" grouping).
- **Mobile**: `flex-direction:column; gap:22px`, flat (no extra grouping wrapper), matching the Mobile board exactly.
- **New file**: yes.

#### `FinalCallToAction` (`FinalCallToAction/index.js`)
- **Responsibility**: renders the closing headline + CTA buttons (查看完整作品集 / 查看履歷 / GitHub / Email).
- **Props**: none.
- **Data source**: hardcoded (page-specific, single use).
- **Reusable**: no.
- **Pencil mapping**: `Final CTA` frame.
- **Desktop**: single row, all buttons inline, centered.
- **Tablet**: two rows (`查看完整作品集` + `查看履歷` on row 1; `GitHub` + `Email` on row 2), centered.
- **Mobile**: `查看完整作品集` and `查看履歷` each full-width stacked buttons; `GitHub` + `Email` as a centered inline row below.
- **Email**: no real email exists (§2.5). Render the Email item as a **disabled** element per §4.4, with `{/* TODO: 尚無公開 Email，取得後改成 mailto: 連結 */}`. Do not fabricate an address.
- **New file**: yes.

---

## 6. Exact dimensions (transcribed from the confirmed Pencil boards)

Container/content max-width at desktop: **1312px**, achieved via 64px side padding on a 1440px reference viewport. Implement as a local `.container { max-width: 1312px; margin-inline: auto; padding-inline: 64px; }` inside `PortfolioHome/styles.module.css` (do **not** reuse Infima's global `.container` class — its max-width does not match this design and reusing it would silently change these numbers).

### 6.1 Section padding, gaps, and non-video media sizes per breakpoint

| Section | Desktop (≥997px) padding / gap | Tablet (768–996px) padding / gap | Mobile (≤767px) padding / gap |
|---|---|---|---|
| Hero | `80px 64px 72px 64px` / gap 72 (row) | `48px 40px 56px 40px` / gap 40 (column) | `32px 20px 40px 20px` / gap 24 (column) |
| Selected Projects | `72px 64px` / gap 40 | `56px 40px` / gap 36 | `40px 20px` / gap 32 |
| More Projects | `64px` all sides / gap 32 | `48px 40px` / gap 28 | `36px 20px` / gap 24 |
| Engineering Capabilities | `72px 64px` / gap 36 | `56px 40px` / gap 28 | `36px 20px` / gap 28 |
| Technical Notes | `72px 64px` / gap 64 (row) | `48px 40px` / gap 28 (column) | `36px 20px` / gap 22 (column) |
| Final CTA | `72px 64px` / gap 24 | `56px 40px` / gap 22 | `40px 20px` / gap 18 |

| Media (non-video) | Desktop | Tablet (full width) | Mobile (full width) |
|---|---|---|---|
| 心理諮商地圖 (screenshot, feature) | 600 × 380, radius 10 | 688 × 340, radius 10 | 350 × 220, radius 8 |
| 地政圖資小幫手 (result, compact) | 640 × 260 (half of a 2-col row, gap 32), radius 10 | 688 × 300, radius 10 | 350 × 220, radius 8 |
| 公仔辨識系統 thumbnail box (youtube, More Projects card) | 400 × 225 (16:9, fixed, media sits beside content) | 640 × 360 (16:9, full card width minus 24px padding) | 314 × 177 (16:9, full card width minus 18px padding) |

All 4 placeholder box types share the same visual language: 1px `--ph-border-soft` border, `--ph-surface` fill, centered icon (26px, Lucide `image`/`map`/`file-search`/`scan-face` depending on project) + centered caption text (12px, `--ph-text-secondary`), `border-radius` per table above.

### 6.2 Video type — 16:9 pillarbox composition (LINE OA only)

This is the corrected spec after the design review that flagged the earlier ultra-wide crop. **The LINE OA phone screen is portrait content and must never be stretched to a wide aspect ratio.** Implement `ProjectMedia type="video"` as:

1. Outer box: exactly `aspect-ratio: 16 / 9`, `background: var(--ph-bg-subtle)`, `border-radius: 10px` (desktop/tablet) or `8px` (mobile), `overflow: hidden`, `position: relative`.
2. Inner "phone" placeholder: absolutely centered (`position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)`), portrait-oriented, `background: var(--ph-surface)`, `border: 1px solid var(--ph-border-soft)`, `border-radius: 16px` (10px on the smallest mobile size), containing the centered icon + `LINE 對話畫面` caption text.
3. Play button: `position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)` (same center as the phone, sitting visually on top of it), 56×56 circle (48×48 on mobile), `background: rgba(29,39,51,0.7)`, white play triangle icon, `border-radius: 999px`. This is a **static/decorative element in this task** (no click-to-play wiring — no video file exists yet); the real "click to play" interaction is explicitly deferred (§9 Out of Scope: "真實影片剪輯"). Leave a `{/* TODO: wire onClick to open a modal / <video> once a real recording exists */}` comment.
4. Duration badge: `position:absolute; right:16px (12px mobile); bottom:16px (12px mobile);` dark pill, `0:30` label, `--ph-font-mono`.
5. Type label pill: `position:absolute; top:16px (12px mobile); left:16px (12px mobile);` dark pill, `VIDEO PREVIEW` label, `--ph-font-mono`.
6. Caption below the box (not inside it): `點擊播放 30 秒操作展示 · 首頁不自動播放`, `--ph-text-secondary`, `font-size: 12px`, `font-style: italic`.

Exact outer box widths (height is always computed as `width × 9 / 16` — enforce with CSS `aspect-ratio`, do not hardcode both numbers):

| Breakpoint | Outer width | Outer height (16:9) | Inner phone size (approx, `height − 2×margin`, `width ≈ height × 0.4615`) |
|---|---|---|---|
| Desktop | 640 (half of a 2-col row) | 360 | ≈144 × 312, margin 24 |
| Tablet | 688 (full width) | 387 | ≈156 × 339, margin 24 |
| Mobile | 350 (full width) | 197 | ≈76 × 165, margin 16 |

Do not hand-copy these exact pixel numbers as fixed CSS — implement the outer box as `width: 100%` (or the fixed 640px column width on desktop) with `aspect-ratio: 16/9`, and the inner phone box as a percentage-based centered element (e.g. `height: calc(100% - 48px); width: 46.15%` on desktop/tablet, `height: calc(100% - 32px)` on mobile) so it stays correct if the column width ever shifts slightly — the numbers above are for verification, not for pixel-perfect hardcoding.

### 6.3 Hero copy variant per breakpoint

- Desktop & Tablet: full intro paragraph (§4.1).
- Mobile: shortened intro (confirmed from the Mobile board): `專注 Backend、自動化與 AI 應用的實作。把資料擷取、非同步任務、外部系統整合與地理資訊查詢，整理成可以真正被使用、被維護的產品。` (drops the trailing "從需求釐清...走完" sentence to control mobile vertical rhythm — this is an intentional, confirmed content difference, not a bug).

### 6.4 Typography scale

| Element | Desktop | Tablet | Mobile |
|---|---|---|---|
| Hero eyebrow | 14px / 600 | 14px / 600 | 12px / 600 |
| Hero headline | 38px / 700 / line-height 1.35 | 38px / 700 / line-height 1.35 | 27px / 700 / line-height 1.35 |
| Hero intro | 16px / 400 / line-height 1.7 | 16px / 400 / line-height 1.7 | 15px / 400 / line-height 1.7 |
| Section eyebrow | 13px / 600 | 13px / 600 | 12px / 600 |
| Section title | 26px / 700 | 22–24px / 700 | 20–22px / 700 |
| Project name | 22px / 700 (feature), 19px / 700 (compact) | 19px / 700 | 17px / 700 |
| Project problem/solution | 15px (feature) / 14px (compact) | 14px | 13px |
| Tag pill label | 12px / 500 (mono) | 11–12px / 500 (mono) | 10.5px / 500 (mono) |
| Capability title | 17px / 700 | 16px / 700 | 16px / 700 |
| Capability description | 14px / 400 | 13px / 400 | 13px / 400 |

Colors for all text: headings/names → `--ph-text-primary`; body/description → `--ph-text-secondary`; problem statements → `--ph-accent-dark`; eyebrows/accent labels → `--ph-accent`.

---

## 7. Data management

**Decision: use a dedicated `src/components/PortfolioHome/data/projects.js` file for the 4 project entries (Selected Projects × 3 + More Projects × 1). Everything else (Hero copy, Engineering Capabilities, Technical Notes list, Final CTA copy) stays as local constants inside its own component file.**

Rationale:
- The 4 projects share one exact shape (`ProjectCard` + `ProjectMedia` consume the same schema regardless of which section renders them) and are the only content that is genuinely reused across two different components (`SelectedProjects` and `MoreProjects`) — centralizing them avoids copy/paste drift and makes it trivial to move a project between tiers later (just change `tier`).
- Everything else is rendered by exactly one component, one time — putting it in a shared data file would add an indirection with no reuse benefit, which violates the project's own "no premature abstraction" convention.
- No CMS, no database, no state management library, no new dependency — this is a static JS array, imported at build time like any other module.

### 7.1 `data/projects.js` shape

```js
// src/components/PortfolioHome/data/projects.js

/**
 * @typedef {Object} ProjectLink
 * @property {string} label
 * @property {string=} to      // internal Docusaurus route (use with <Link to>)
 * @property {string=} href    // external URL (use with <Link href>, must open in new tab)
 * @property {boolean=} disabled // true => render as inert placeholder, see §4.4
 * @property {string=} todo    // human-readable note on what real data is missing
 *
 * @typedef {Object} ProjectMediaData
 * @property {'screenshot'|'result'|'video'|'youtube'} type
 * @property {string} typeLabel        // e.g. "PRODUCT SCREENSHOT"
 * @property {string} placeholderNote  // text shown inside the placeholder box
 * @property {string=} caption         // only for type: 'video'
 * @property {string=} durationLabel   // only for type: 'video', e.g. "0:30"
 *
 * @typedef {Object} ProjectData
 * @property {string} id
 * @property {'selected'|'more'} tier
 * @property {string} name
 * @property {string} problem
 * @property {string} solution
 * @property {string[]} tags
 * @property {ProjectMediaData} media
 * @property {ProjectLink[]} links
 */

/** @type {ProjectData[]} */
export const projects = [
  {
    id: 'counseling-map',
    tier: 'selected',
    name: '心理諮商地圖',
    problem: '問題：公共心理諮商資源分散、難以依地區與條件查詢。',
    solution: '解法：整理公共資料，做成可用地圖瀏覽、依距離排序與條件篩選的資源查詢入口。',
    tags: ['Next.js', 'Leaflet', '資料清理', '地理資訊', '公共資料產品化'],
    media: {
      type: 'screenshot',
      typeLabel: 'PRODUCT SCREENSHOT',
      placeholderNote: '建議補入畫面：地圖主畫面（篩選條件 + 資源列表 + 標記點）',
    },
    links: [
      { label: '查看案例', disabled: true, todo: '尚無獨立案例頁，待補' },
      { label: '開啟地圖 Demo', disabled: true, todo: '尚無公開 Demo 網址，待補' },
      { label: 'GitHub', disabled: true, todo: '尚無確認的專案 Repo 連結，待補' },
      { label: '透過 LINE 體驗', href: 'https://line.me/R/ti/p/@998enzsc' },
    ],
  },
  {
    id: 'landinfo-helper',
    tier: 'selected',
    name: '地政圖資小幫手',
    problem: '問題：地號圖資查詢分散在政府網站，手動截圖存檔耗時。',
    solution: '解法：串接地號輸入、網頁查詢、圖資擷取與 LINE 回傳，整條流程自動化。',
    tags: ['Playwright', 'BullMQ', 'Queue / Worker', 'Cloud Storage', 'LINE Push'],
    media: {
      type: 'result',
      typeLabel: 'RESULT PREVIEW',
      placeholderNote: '建議補入畫面：地號查詢結果、LINE 回傳畫面、自動化流程示意圖',
    },
    links: [
      { label: '查看案例', to: '/docs/LINEOA-PORFOLIO/11-landinfo-project' },
      { label: '查看流程', to: '/docs/LINEOA-PORFOLIO/11-landinfo-project' },
      { label: 'GitHub', disabled: true, todo: '尚無確認的專案 Repo 連結，待補' },
    ],
  },
  {
    id: 'line-oa-portfolio',
    tier: 'selected',
    name: 'LINE OA 互動作品集',
    problem: '問題：履歷與作品分散在多個連結，面試官難以快速瀏覽。',
    solution: '解法：把履歷、作品導覽與可操作 Demo 整合進 LINE 對話入口，直接互動查看。',
    tags: ['FastAPI', 'LINE Messaging API', 'Webhook', 'Redis', 'Queue / Worker'],
    media: {
      type: 'video',
      typeLabel: 'VIDEO PREVIEW',
      placeholderNote: 'LINE 對話畫面',
      caption: '點擊播放 30 秒操作展示 · 首頁不自動播放',
      durationLabel: '0:30',
    },
    links: [
      { label: '查看案例', to: '/docs/LINEOA-PORFOLIO/overview' },
      { label: '播放 30 秒展示', disabled: true, todo: '尚無影片檔，待補後改為開啟播放器/Modal' },
      { label: '立即體驗', href: 'https://line.me/R/ti/p/@998enzsc' },
    ],
  },
  {
    id: 'figurine-recognition',
    tier: 'more',
    name: '公仔辨識系統',
    problem: '',
    solution: '使用影像辨識流程識別公仔，是 AIoT 訓練期間完成的真實成果，可完整觀看專案影片與原始碼。',
    tags: ['影像辨識', 'AIoT', 'Python'],
    media: {
      type: 'youtube',
      typeLabel: 'YOUTUBE',
      placeholderNote: 'YouTube 展示影片縮圖',
    },
    links: [
      { label: '觀看專案影片', disabled: true, todo: '尚無 YouTube 連結，待補' },
      { label: 'GitHub', disabled: true, todo: '尚無確認的專案 Repo 連結，待補' },
    ],
  },
];
```

Note: `figurine-recognition.problem` is intentionally empty — the confirmed design does not show a "problem" line for this card (More Projects uses only a single description line, see §4.3). `ProjectCard` must conditionally skip rendering the problem line when it is falsy (this only ever applies to the `more` tier item).

### 7.2 Hero copy — local to `PortfolioHero/index.js` (see §4.1, §6.3)

### 7.3 Engineering Capabilities — local array inside `EngineeringCapabilities/index.js`

```js
const capabilities = [
  { icon: 'workflow', title: '非同步系統設計', description: '以 Queue、Worker 與 Webhook 拆解長流程，確保任務可重試、可追蹤、不阻塞主流程。', evidence: '地政圖資小幫手' },
  { icon: 'refresh-cw', title: '資料與流程自動化', description: '將網頁查詢、資料擷取與整理串成自動化管線，取代人工重複操作。', evidence: '地政圖資小幫手 / 心理諮商地圖' },
  { icon: 'map-pin', title: '地圖與公共資料產品化', description: '把公共資料整理成地圖、距離排序與條件查詢，做成可直接使用的資源入口。', evidence: '心理諮商地圖' },
  { icon: 'scan-face', title: 'AI 與影像辨識應用', description: '將影像辨識流程整合進實際專案，產出可觀看、可驗證的辨識成果。', evidence: '公仔辨識系統' },
  { icon: 'package', title: '產品化後端', description: '把 API 服務、對話流程與系統整合，交付成使用者真正會用的產品，而不只是技術 Demo。', evidence: 'LINE OA 互動作品集' },
];
```

Icons: this project has no icon library dependency today (`package.json` has none). **Do not add one** (e.g. `lucide-react`) — that would violate "no new dependencies." Render icons as simple inline SVGs (a handful of small hand-authored paths for: workflow, refresh, map-pin, scan-face/AI, package, play, external-link, arrow-right, github, mail, menu, image, file-search) inside a tiny local `Icon` helper (e.g. `src/components/PortfolioHome/Icon.jsx`, a switch-on-name component returning inline `<svg>`), OR use text/Unicode-free minimal shapes if simpler. This must be called out as a deliberate substitution for Pencil's Lucide icons in the final report — visually approximate is acceptable, exact Lucide fidelity is not required.

### 7.4 Technical Notes list — local array inside `TechnicalNotes/index.js`

```js
const noteCategories = [
  '非同步任務設計筆記',
  'LINE Webhook 除錯紀錄',
  '地圖資料清理與地理資訊筆記',
  '部署與環境設定紀錄',
];
```

Per §2.5, none of these has a confirmed final document route. **Every item in this list, and the "前往技術筆記" CTA above it, must link to the same real, existing route: `/docs/intro`.** Add `{/* TODO: replace with per-category doc routes once the author confirms final file paths under docs/LINEOA-PORFOLIO/ (some candidates currently have " copy" in their filename and are not confirmed canonical) */}` directly above the array.

### 7.5 Final CTA copy — local to `FinalCallToAction/index.js`

- Title: `想看更多細節，或聊聊機會？`
- Buttons: `查看完整作品集` (internal, → `#selected-projects` anchor or `/docs/job-hunt-portfolio`; use the in-page anchor to match "查看作品" in the Hero and avoid duplicate meaning — see TASK-07), `查看履歷` (→ `/docs/job-hunt-portfolio`, real), `GitHub` (→ `https://github.com/hsilan-sui/sui-dev-notes`, real, external), `Email` (disabled, §2.5/§4.4).

---

## 8. RWD implementation

### 8.1 Breakpoints (reuse existing project convention — do not invent new numbers)

- **Desktop**: `≥ 997px` — matches the `max-width: 996px` breakpoint already used in `src/pages/index.module.css` today, and matches Infima's own `lg` breakpoint, which is also exactly where Docusaurus's navbar auto-collapses to its mobile hamburger. Using the same number keeps the homepage's own layout switch visually in sync with the navbar's switch.
- **Tablet**: `768px – 996px` — matches Infima's `md` breakpoint (768) as the lower bound, and reuses the existing `996px` upper bound from `index.module.css`.
- **Mobile**: `≤ 767px`.

Implement with standard `@media (max-width: 996px)` / `@media (max-width: 767px)` blocks per component's CSS module (mobile-first is not required — the existing `index.module.css` in this repo is desktop-first with `max-width` overrides, so follow that same convention for consistency).

### 8.2 Desktop rules (≥997px)
- Hero: 2-column grid (§5.2 PortfolioHero).
- Selected Projects: 1 feature row (media 600×380 beside content) + 1 compact row with `grid-template-columns: 1fr 1fr`.
- More Projects card: row layout, media 400×225 fixed beside content.
- Engineering Capabilities: 3-column grid (5 items auto-wrap to 3+2).
- All media placeholders render at the "Desktop" column of the tables in §6.1/§6.2.
- Content max-width 1312px, centered, 64px side padding (§6, `.container`).

### 8.3 Tablet rules (768–996px)
- Hero: single column, stacked (text block, then avatar+identity), per §5.2.
- Selected Projects: single column, all 3 `ProjectCard variant="compact"`, full-width media per §6.1/§6.2 "Tablet" column.
- Navbar: no homepage code needed — Docusaurus's existing responsive navbar already governs this range (it only fully collapses below 996px, so at the very top of this range (996px down to just under it) the desktop navbar may still show; this is existing site-wide behavior, not something this task changes or should try to change).
- CTA rows (Final CTA): must wrap onto a second row without overlapping — implement via `flex-wrap: wrap; justify-content: center` with `gap`, not fixed widths, so buttons never overlap regardless of exact viewport width inside this range.
- Engineering Capabilities: `grid-template-columns: repeat(2, 1fr)`.
- Content max-width: fluid to `100% − 80px` (40px side padding, per §6.1 table), no fixed 1312px ceiling needed since 768px never exceeds it.

### 8.4 Mobile rules (≤767px)
- Single column everywhere — no `grid-template-columns` other than `1fr`, no `flex-direction: row` anywhere in this breakpoint except small inline link/tag rows that are expected to wrap.
- Hero: **DOM order matters** — eyebrow/headline/intro/CTA/chips must precede the avatar block in markup (§5.2), not just be visually reordered with CSS `order`.
- CTA buttons: `width: 100%` for the two primary Hero/Final-CTA buttons; minimum touch target height `44px` (via vertical padding, matching the existing button padding of `13px`/`12px` top-bottom which already yields ≈44–48px total height — verify computed height ≥44px and adjust padding if a chosen font/line-height pushes it under that).
- `TechTags`: `flex-wrap: wrap` (real wrap, not manual rows).
- `ProjectCard` links row: switch from a horizontal `Links` row to `flex-direction: column; gap: 8px` (one link per line) — this is a confirmed, deliberate difference from Desktop/Tablet (see §6.1 Selected Projects mobile card structure), done for touch/line-length reasons.
- Media: never crop below the point where the placeholder text/icon becomes unreadable — use the exact Mobile dimensions in §6.1/§6.2; do not shrink further.
- Engineering Capabilities: `grid-template-columns: 1fr`.
- No element may cause horizontal scroll: verify every fixed-width value in this breakpoint's CSS is ≤ `350px` (the Mobile content width at 390px viewport minus 20px×2 padding) or is expressed in relative units (`100%`, `fill` via flex/grid). Do not use `width: 100vw` anywhere (it does not account for the scrollbar and is a common horizontal-scroll bug source) — use `width: 100%` within the padded container instead.
- Footer: no homepage code — the real Docusaurus footer already renders below `<Layout>`'s children with its own responsive stacking; nothing to implement here.

---

## 9. Dark Mode

The design was authored in light mode. The site already has a working dark mode (`[data-theme='dark']` in `src/css/custom.css`). Do not rewrite the Docusaurus theme system, do not add a custom theme toggle, do not add `useColorMode` unless a specific below case truly requires JS branching (none currently do — everything is solvable with CSS variables).

### 9.1 Token strategy

Define a small set of CSS custom properties **scoped to `.portfolioHome`** inside `PortfolioHome/styles.module.css` (do not add these to the global `src/css/custom.css` — keep the blast radius contained to this feature):

```css
.portfolioHome {
  --ph-bg: var(--ifm-background-color);
  --ph-surface: var(--ifm-background-surface-color);
  --ph-bg-subtle: #F6EEE8;
  --ph-text-primary: var(--ifm-heading-color);
  --ph-text-secondary: var(--ifm-font-color-secondary);
  --ph-text-on-accent: #FFFDF8;
  --ph-accent: var(--ifm-color-primary);
  --ph-accent-dark: var(--ifm-color-primary-dark);
  --ph-accent-light: var(--ifm-color-primary-light);
  --ph-accent-wash: rgba(189, 63, 27, 0.08);
  --ph-border-soft: rgba(34, 48, 65, 0.12);
  --ph-panel-dark-bg: #1D2733;
  --ph-panel-dark-text: #EDF2F7;
  --ph-panel-dark-text-secondary: #B7C6D6;
  --ph-panel-dark-border: rgba(237, 242, 247, 0.12);
  --ph-overlay-dark: rgba(29, 39, 51, 0.75);
  --ph-font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

[data-theme='dark'] .portfolioHome {
  --ph-bg-subtle: rgba(255, 255, 255, 0.04);
  --ph-accent-wash: rgba(255, 156, 114, 0.12);
  --ph-border-soft: rgba(255, 255, 255, 0.14);
  /* Technical Notes panel: in light mode it's a deliberately dark accent band on
     a light page. In dark mode the whole page is already dark, so re-using the
     same fixed #1D2733 would look identical to the page background and the
     section would lose its visual separation. Use the slightly-lighter surface
     color instead so the panel still reads as an elevated block. */
  --ph-panel-dark-bg: var(--ifm-background-surface-color);
  --ph-panel-dark-border: rgba(255, 255, 255, 0.1);
}
```

Every other component's CSS module reads these via `var(--ph-*)` — because they are plain CSS custom properties (not CSS Modules class names), they inherit normally from the `.portfolioHome` root down through every nested component regardless of each file's own module scope.

### 9.2 Per-element dark mode behavior

- **Page background / surfaces**: `--ph-bg`, `--ph-surface` — already theme-aware via existing Infima variables, no extra work.
- **Project card border**: `var(--ph-border-soft)` — themed via the override above.
- **Muted/secondary text**: `var(--ph-text-secondary)` — already theme-aware (exact-matches `--ifm-font-color-secondary` in both modes).
- **CTA primary button**: background `var(--ph-accent)`, text `var(--ph-text-on-accent)` in both modes (white-on-orange stays readable in both themes since the accent color itself shifts lighter in dark mode per Infima's own dark palette — verify contrast, see §9.3).
- **CTA secondary/ghost button**: border `var(--ph-accent)`, text `var(--ph-accent)`, background transparent — theme-aware automatically.
- **Technical Notes dark panel**: see the code comment above — uses a fixed dark color in light mode, switches to `var(--ifm-background-surface-color)` in dark mode so it stays visually distinct from the page.
- **Media placeholder boxes**: background `var(--ph-surface)`, border `var(--ph-border-soft)`, icon/text `var(--ph-text-secondary)` — theme-aware.
- **Play button / duration badge / type label pill (overlay controls on `ProjectMedia`)**: keep a **fixed** dark translucent background (`var(--ph-overlay-dark)`) with white text/icon in both light and dark site themes. Rationale: these are video/photo-overlay UI conventions (like a real video player's scrubber controls), not page chrome — they sit on top of image/video content that will eventually be a real photo/video, and real media overlay controls conventionally stay dark-on-any-background rather than flipping with the site theme. Document this as a deliberate, non-bug choice.
- **LINE OA pillarbox background** (`--ph-bg-subtle`): themed via the override above so the letterbox area doesn't look like a light gray patch on an otherwise dark page in dark mode.

### 9.3 Contrast check (must pass, no automated tool required — verify by inspection against these known hex pairs)

- Light mode: `--ph-text-primary` (`#1D2733`) on `--ph-bg` (`#FFFDF8`) — very high contrast, passes WCAG AA easily.
- Dark mode: `--ph-text-primary` resolves to `--ifm-heading-color` dark value `#FFF7F2` on `--ph-bg` dark value `#111827` — very high contrast, passes.
- Light mode CTA: white (`#FFFDF8`) on accent `#BD3F1B` — passes AA for large text/buttons.
- Dark mode CTA: `--ph-text-on-accent` (`#FFFDF8`, kept fixed) on accent dark value `#FF9C72` — this is a light-on-light-orange combination and is the one pairing that needs a manual look. **If contrast looks insufficient in the dark-mode dev server check (TASK-10), swap the dark-mode CTA button text color to `--ifm-heading-color` (dark value, near-white-but-check) or to a fixed dark navy (`#1D2733`) instead of white, whichever the manual check shows reads better** — do not skip this check, record the decision made in the final report.
- Overlay controls (`--ph-overlay-dark` `rgba(29,39,51,0.75)` with white icon/text) — passes in both themes since the media box behind it is always light enough for the fixed dark pill to stand out (verify per §6.2/§6.1, all placeholder boxes are light-toned by design).

---

## 10. Task breakdown

Each task lists: purpose, preconditions, files it may touch, steps, acceptance criteria, verification command(s), and failure handling. Execute in order — later tasks assume earlier ones are done.

### TASK-01 — Baseline confirmation
- **Purpose**: confirm the working tree matches this spec's assumptions before writing any code.
- **Preconditions**: none.
- **Allowed files**: none (read-only task).
- **Steps**:
  1. Run `cat package.json` and confirm the available scripts are exactly: `docusaurus`, `dev`, `build`, `swizzle`, `deploy`, `clear`, `serve`, `write-translations`, `write-heading-ids`. There is **no** `lint`, `test`, or `typecheck` script — do not invent one, do not assume one exists.
  2. Confirm `git status` — `src/pages/index.js` may already show as modified from a prior WIP session; this is expected, this task will fully rewrite it.
  3. Confirm the files listed in §2 exist and read as described.
- **Acceptance criteria**: written confirmation (in the final report) that the above scripts list and file states match.
- **Verification command**: `cat package.json`.
- **Failure handling**: if `package.json` scripts differ from what's listed here, stop and record it as a Blocker before proceeding — later tasks' "Verification command" steps depend on this list being accurate.

### TASK-02 — Data model and shared primitives
- **Purpose**: create the foundation every other task builds on.
- **Preconditions**: TASK-01 done.
- **Allowed files**: `src/components/PortfolioHome/data/projects.js` (new), `src/components/PortfolioHome/styles.module.css` (new), `src/components/PortfolioHome/Icon.jsx` (new, per §7.3), `src/components/PortfolioHome/SectionHeading/*` (new), `src/components/PortfolioHome/TechTags/*` (new).
- **Steps**:
  1. Create `data/projects.js` exactly per §7.1.
  2. Create `styles.module.css` with the `.portfolioHome` token block (§9.1) and the `.container` rule (§6).
  3. Create `Icon.jsx` with inline SVGs for the icon names listed in §7.3 (plus `play`, `external-link`, `arrow-right`, `github`, `mail`, `menu`, `image`, `file-search`, `message-circle`).
  4. Create `SectionHeading` per §5.2.
  5. Create `TechTags` per §5.2, using real `flex-wrap: wrap`.
- **Acceptance criteria**: all 5 new files exist; `data/projects.js` exports exactly 4 objects with the ids `counseling-map`, `landinfo-helper`, `line-oa-portfolio`, `figurine-recognition`; no other component imports anything yet (nothing wired into `index.js` yet).
- **Verification command**: `node -e "const {projects} = require('./src/components/PortfolioHome/data/projects.js'); console.log(projects.length, projects.map(p=>p.id))"` — will only work once you either use `.mjs`/`type:module`-compatible syntax or run through Babel; if plain `node` cannot execute ES module `export` syntax in this repo, instead verify by visual code review plus proceeding to TASK-12's build check, which will fail loudly on any syntax error.
- **Failure handling**: if a project id is missing/typo'd, `SelectedProjects`/`MoreProjects` in later tasks will silently render an empty section — double-check the 4 ids against §7.1 exactly before moving on.

### TASK-03 — Hero
- **Purpose**: implement `PortfolioHero`.
- **Preconditions**: TASK-02 done.
- **Allowed files**: `src/components/PortfolioHome/PortfolioHero/*` (new).
- **Steps**: implement per §5.2 and §4.1, including the Mobile DOM-order requirement and the Mobile-shortened intro copy (§6.3). Use `<img src={useBaseUrl('/img/me.png')} />` for the avatar (§2.3) — not an icon placeholder. Wire CTA links per §4.1 (Primary → `#selected-projects` anchor, Secondary → `/docs/job-hunt-portfolio`, Ghost → GitHub, both real).
- **Acceptance criteria**: renders standalone without errors when temporarily mounted in `index.js` for a manual dev-server check; at 1440/768/390 viewport widths (via browser devtools) the layout matches §5.2's Desktop/Tablet/Mobile behavior description; avatar shows the real photo, not a broken image icon.
- **Verification command**: `npm run dev` (or `npm run build` once wired into `index.js` in a later task — this task alone can be spot-checked via dev server with a temporary import).
- **Failure handling**: if `/img/me.png` fails to resolve via `useBaseUrl`, confirm the `baseUrl` in `docusaurus.config.js` is `/dev-notes/` and that dev-server requests are going through that prefix — do not change `docusaurus.config.js` to work around it.

### TASK-04 — Selected Projects + Project Media
- **Purpose**: implement `SelectedProjects`, `ProjectCard`, `ProjectMedia` for `screenshot`, `result`, and `video` types.
- **Preconditions**: TASK-02, TASK-03 done.
- **Allowed files**: `src/components/PortfolioHome/SelectedProjects/*`, `src/components/PortfolioHome/ProjectCard/*`, `src/components/PortfolioHome/ProjectMedia/*` (all new).
- **Steps**: implement per §5.2, §6.1, §6.2, §7.1. Pay particular attention to §6.2 (16:9 pillarbox) — this is the exact issue that was corrected in the design review; do not implement `video` type as a wide/cropped box.
- **Acceptance criteria**: the section renders `心理諮商地圖` as a feature card and `地政圖資小幫手` + `LINE OA 互動作品集` as compact cards on desktop widths (≥997px); all three stack identically in the same order on tablet/mobile widths; the LINE OA video box never stretches its inner "phone" placeholder wider than ≈46% of the outer box width at any breakpoint; every link renders either a real `to`/`href` or a visibly disabled placeholder per §4.4 — zero `href="#"` anywhere.
- **Verification command**: `npm run dev`, resize devtools to 1440/768/390 and visually confirm against §6.1/§6.2 tables; also `grep -rn 'href="#"' src/components/PortfolioHome` must return nothing.
- **Failure handling**: if `onBrokenLinks: "throw"` fails the build in TASK-12 because of a project link, check it against §2.4/§2.5 — every `to=` must be one of the 3 confirmed real routes; anything else must be `disabled`, not `to`.

### TASK-05 — More Projects
- **Purpose**: implement `MoreProjects` (公仔辨識系統, `youtube` media type).
- **Preconditions**: TASK-04 done (reuses `ProjectCard`/`ProjectMedia`).
- **Allowed files**: `src/components/PortfolioHome/MoreProjects/*` (new).
- **Steps**: per §5.2, §4.3, §6.1 (400×225 / 640×360 / 314×177, all exact 16:9). Render the `更多作品陸續整理中` note as plain text, not a link.
- **Acceptance criteria**: 16:9 ratio holds exactly at all 3 breakpoints (verify `width / height` ≈ `1.777` within rounding); both links render disabled per §4.4 with correct `todo` text.
- **Verification command**: visual check via `npm run dev`, plus `grep -n "aspect-ratio: 16 / 9" src/components/PortfolioHome/ProjectMedia/styles.module.css` returns at least one match.
- **Failure handling**: none expected — this task has no real-data blockers beyond the two already-known-missing links.

### TASK-06 — Engineering Capabilities
- **Purpose**: implement the 5-item capability grid.
- **Preconditions**: TASK-02 done.
- **Allowed files**: `src/components/PortfolioHome/EngineeringCapabilities/*` (new).
- **Steps**: per §5.2, §7.3. Use real CSS Grid (not manually-split rows like the Pencil mockup had to do).
- **Acceptance criteria**: 3-column grid at desktop (auto-wraps 5 items to 3+2), 2-column at tablet (2+2+1), 1-column at mobile; every item shows an evidence pill referencing a real project name from §7.1's `name` fields (spelled identically, so a future reader can visually cross-reference).
- **Verification command**: visual check via `npm run dev` at 3 widths.
- **Failure handling**: none expected.

### TASK-07 — Technical Notes + Final CTA
- **Purpose**: implement the last two content sections.
- **Preconditions**: TASK-02 done.
- **Allowed files**: `src/components/PortfolioHome/TechnicalNotes/*`, `src/components/PortfolioHome/FinalCallToAction/*` (all new).
- **Steps**: per §5.2, §7.4, §7.5. All 4 note items + the "前往技術筆記" CTA link to `/docs/intro` (real) with the TODO comment from §7.4. Final CTA's `查看完整作品集` button links to the in-page `#selected-projects` anchor (same target as the Hero's primary CTA — confirm both use the exact same anchor id defined via `SectionHeading`'s `id` prop on `SelectedProjects`, so there is exactly one canonical anchor, not two different ones that happen to look similar).
- **Acceptance criteria**: no `href="#"` (an in-page anchor must be a real element id, e.g. `<Link to="#selected-projects">` targeting an element with `id="selected-projects"` — Docusaurus's broken-link checker does not validate in-page hash anchors, so this is a manual-review item, not a build-time check); Email item is disabled per §4.4.
- **Verification command**: `grep -rn "selected-projects" src/components/PortfolioHome` must show both the `id="selected-projects"` definition (in `SelectedProjects`, via `SectionHeading`) and at least 2 usages (Hero + Final CTA).
- **Failure handling**: if reusing `SectionHeading`'s `id` prop is awkward for `SelectedProjects` specifically, hardcode `id="selected-projects"` directly on `SelectedProjects`'s root `<section>` instead — either is acceptable, consistency of the anchor string is what matters.

### TASK-08 — Wire it all together + Desktop visual pass
- **Purpose**: assemble `PortfolioHome/index.js`, replace `src/pages/index.js`, and verify the Desktop (≥997px) result against §6/§8.2 in full.
- **Preconditions**: TASK-03 through TASK-07 done.
- **Allowed files**: `src/components/PortfolioHome/index.js` (new), `src/pages/index.js` (rewrite).
- **Steps**:
  1. `PortfolioHome/index.js` renders, in order: `PortfolioHero`, `SelectedProjects`, `MoreProjects`, `EngineeringCapabilities`, `TechnicalNotes`, `FinalCallToAction`, all wrapped in a root element with `className={styles.portfolioHome}`.
  2. Rewrite `src/pages/index.js` to: import `Layout`, `useDocusaurusContext` (keep, still useful for title/description), and the new `PortfolioHome`; render `<Layout title="..." description="..."><PortfolioHome /></Layout>`. Keep the existing `title`/`description` strings from the current file (`"Sui Hsilan Portfolio"` / `"Sui 的後端、自動化與 AI 專案整合站"`) unless TASK-11 decides to update them for consistency with the new Hero copy — if changed, keep them factual, no fabricated claims.
  3. Do not import `focusAreas`, `strengths`, `noteBuckets`, or `HomepageHeader` from the old implementation into the new one.
- **Acceptance criteria**: `npm run dev` shows the new homepage at desktop width matching §8.2 point-by-point; no console errors.
- **Verification command**: `npm run dev`, open `http://localhost:3003/dev-notes/` (per the configured `baseUrl`), visually diff against §6 tables at 1440px viewport width.
- **Failure handling**: any import error here means a prior task's file/export name doesn't match — fix the mismatch, do not paper over it by changing this task's import to something not defined in this spec.

### TASK-09 — Tablet + Mobile RWD pass
- **Purpose**: verify and finish responsive behavior end-to-end.
- **Preconditions**: TASK-08 done.
- **Allowed files**: any `*.module.css` file under `src/components/PortfolioHome/` (styles only — no new components in this task).
- **Steps**: with `npm run dev` running, resize the browser (or devtools device toolbar) to 768px and 390px and check every item in §8.3/§8.4's rules. Fix any CSS-only gaps found (e.g. an element not wrapping, a fixed width too wide for 390px).
- **Acceptance criteria**: all 13 items in the design review checklist (§13.1 below) pass at both breakpoints; no horizontal scrollbar appears at 390px (`document.documentElement.scrollWidth <= document.documentElement.clientWidth` when checked in devtools console).
- **Verification command**: manual devtools check (no automated visual-regression tool exists in this project — do not add one). If Codex's execution environment has no way to render a browser, perform a static-analysis substitute instead: `grep -rn "width: [0-9]" src/components/PortfolioHome/**/*.module.css` and manually confirm every fixed pixel width found is either inside a `@media (min-width: 997px)` block or is ≤ 350px (the mobile content width), per §8.4's overflow rule.
- **Failure handling**: if no browser rendering is available in the execution environment, complete the static-analysis substitute, note in the final report that visual confirmation was not possible, and flag it as a Blocker requiring human visual QA before this is considered fully done.

### TASK-10 — Dark Mode pass
- **Purpose**: verify §9 end-to-end.
- **Preconditions**: TASK-09 done.
- **Allowed files**: any `*.module.css` file under `src/components/PortfolioHome/` (styles only).
- **Steps**: toggle dark mode (Docusaurus's existing navbar dark-mode switch) with the dev server running; check every item in §9.2/§9.3. Specifically resolve the CTA-button-in-dark-mode contrast check called out in §9.3.
- **Acceptance criteria**: no unreadable text in dark mode anywhere on the page; Technical Notes panel is visibly distinct from the page background in both themes; media overlay controls (play button, duration badge, type label) remain legible in both themes.
- **Verification command**: manual toggle + visual check; if no browser is available, do a static-analysis substitute: `grep -rn "#[0-9a-fA-F]\{3,6\}" src/components/PortfolioHome/**/*.module.css` and confirm every literal hex color found is either (a) one of the fixed "same in both themes" values explicitly allowed by §9.2 (overlay controls, `--ph-bg-subtle` light value, `--ph-panel-dark-bg` light value) or (b) inside a `[data-theme='dark']` override block — any hardcoded hex used for body text or a background that is NOT one of those allowed exceptions is a bug, fix it to use a `var(--ph-*)` or `var(--ifm-*)` token instead.
- **Failure handling**: per §9.3, if the dark-mode CTA contrast check fails visually, apply the documented fallback (swap text color) and note the final decision in the report.

### TASK-11 — Remove superseded homepage code
- **Purpose**: clean up now-dead code without touching anything out of scope.
- **Preconditions**: TASK-08 confirms the new homepage fully replaces the old one's content.
- **Allowed files**: `src/pages/index.module.css` (delete its contents or delete the file entirely if nothing imports it anymore — confirm `src/pages/index.js` no longer has `import styles from './index.module.css'` before deleting).
- **Steps**:
  1. Confirm no remaining import of `src/pages/index.module.css` anywhere (should already be true after TASK-08's rewrite).
  2. Delete `src/pages/index.module.css` if unused, or empty it with a one-line comment noting it is intentionally empty, whichever is safer given the execution environment's file-deletion capability.
  3. Do **not** touch `src/components/HomepageFeatures/**` — confirmed unused by the homepage both before and after this change (§2.1), out of scope, leave it exactly as-is.
  4. Do **not** touch `src/components/ui/Highlight.jsx` — unrelated to the homepage.
- **Acceptance criteria**: no dangling import errors; `grep -rn "index.module.css" src/pages` returns nothing (if the file was deleted) or shows the file exists but is unimported.
- **Verification command**: `npm run build` (this is also TASK-12's main gate — running it here first catches import errors early).
- **Failure handling**: if deleting the file is not possible in the execution environment, leave it in place but empty its contents to a single comment line — do not leave dead animation/gradient CSS behind.

### TASK-12 — Final build, review, and report
- **Purpose**: prove the implementation is production-ready and produce the final report required by §14.
- **Preconditions**: TASK-01 through TASK-11 done.
- **Allowed files**: none (verification only — fix-forward into the relevant earlier task's files if something fails, do not add new files here).
- **Steps**:
  1. Run `npm run build`. This is the **only** automated gate this project has (no `lint`/`test`/`typecheck` scripts exist — confirmed in TASK-01). It also exercises Docusaurus's `onBrokenLinks: "throw"` check, which will fail the build if any `<Link to="...">` points to a non-existent route — this is the primary safety net against fabricated internal links.
  2. If the build fails, read the error, fix the specific file it points to, and re-run. Do not disable `onBrokenLinks` in `docusaurus.config.js` to make an error disappear — that file is out of scope for this task.
  3. Run `npm run clear` only if the build cache itself is suspected to be stale (optional, not required for success).
  4. Re-confirm §13's 10-point minimum completion list.
  5. Produce the final report per §14/§15 format below, explicitly separating any pre-existing issue encountered (e.g., anything already broken before this task started) from anything newly introduced by this implementation.
- **Acceptance criteria**: `npm run build` exits 0.
- **Verification command**: `npm run build`.
- **Failure handling**: if the build cannot be made to pass because of a genuinely out-of-scope blocker (e.g., a pre-existing broken link elsewhere in `docs/` unrelated to this change), document it precisely (file + error) as a **Pre-existing issue** in the final report and do not attempt to fix it (fixing unrelated docs content is out of scope, §11/§13).

---

## 11. Testing and validation commands (only real, existing commands)

From `package.json` (verified, do not add to this list):

```bash
npm run dev     # docusaurus start --port 3003 — local dev server, manual visual QA
npm run build   # docusaurus build — production build; also enforces onBrokenLinks: "throw"
npm run clear   # docusaurus clear — clears the build cache if needed
npm run serve   # docusaurus serve --port 3003 — serve the built output locally, optional extra check after `build`
```

There is **no** `npm run lint`, **no** `npm run test`, **no** `npm run typecheck` in this project. Do not run commands that don't exist, do not add new scripts to `package.json` to create them (`package.json` is out of scope for this task).

### Minimum completion gate (must all be true)

1. `npm run build` exits 0.
2. No React errors/warnings printed during `npm run dev` or `npm run build`.
3. No import in any new file points to a module/export that doesn't exist.
4. No broken/collapsed layout at any of the 3 breakpoints (390 / 768 / 1440px) — verified visually if a browser is available, or via the static-analysis substitutes in TASK-09/TASK-10 if not.
5. No horizontal overflow at 390px.
6. Dark mode text remains readable everywhere (§9.3).
7. All external links (`href=`) carry `target="_blank" rel="noopener noreferrer"`.
8. No file outside the "Allowed to modify/create" list in §0 was touched.
9. No new entry was added to `package.json` dependencies/devDependencies.
10. No `git commit`, no `git push`, no deploy command was executed.

If a pre-existing issue is discovered during `npm run build` (e.g., an already-broken link somewhere in `docs/` that has nothing to do with this homepage change), report it separately as **Pre-existing** — do not fix it as part of this task, and do not let it block reporting the homepage work as otherwise complete.

---

## 12. Out of scope (explicit — do not do any of this)

- Docusaurus docs sidebar reorganization (`sidebars.js`).
- Removing Docusaurus scaffolding/tutorial docs (`docs/tutorial-basics`, `docs/tutorial-extras`, etc.).
- Rewriting any existing technical notes content under `docs/`.
- Deployment of any kind (`npm run deploy`, GitHub Pages publish).
- `git push`, creating a commit.
- CI/CD changes.
- Dependency upgrades (of any package, including transitive) or `npm audit fix`.
- Introducing a CMS, database, or backend API.
- Producing a real edited video for the LINE OA preview.
- Auto-generating fake product screenshots (via AI image generation or otherwise) for any project.
- Modifying `design/portfolio-home.pen` or any other Pencil file.
- Adding a new icon library, font library, animation library, or any other new npm dependency.
- Building a custom Navbar or Footer component (§5.1).

---

## 13. Definition of Done

Codex may consider this task complete only when **all** of the following are true:

1. TASK-01 through TASK-12 are each completed or explicitly logged as partially-blocked with a documented reason (per §0 rule 12).
2. `npm run build` completes successfully.
3. The Desktop (≥997px), Tablet (768–996px), and Mobile (≤767px) rules in §8 are implemented in CSS.
4. Light and dark mode are both readable per §9.
5. Every placeholder (media boxes, disabled links) renders cleanly with zero layout shift and zero broken-image icons — confirmed no `<img>` tag points to a non-existent file, and no `<video>` tag exists anywhere without a real source (§6.2 explicitly avoids using a real `<video>` element for the still-missing LINE OA clip).
6. `package.json` dependencies/devDependencies are unchanged from before this task.
7. `git diff --stat` (or equivalent file-change listing) shows changes only within the "Allowed to modify/create" list in §0.
8. All relevant existing validation commands from §11 have been run, with their results (pass/fail) stated.
9. A file-change list has been output (§14.1).
10. A test-results-and-TODO summary has been output (§14.2).
11. A rollback method has been output (§14.3).

### 13.1 Design-fidelity checklist (from the original design review, re-verified against the real implementation)

1. No text overflow at any breakpoint.
2. No overlapping elements at any breakpoint.
3. No button overflows its container.
4. No horizontal scroll risk at 390px.
5. No project card is too narrow to read comfortably.
6. No media placeholder is cropped in a way that loses its meaning (specifically: the LINE OA phone screen stays pillarboxed inside its 16:9 box, never stretched wide — §6.2).
7. The 公仔辨識系統 YouTube thumbnail box stays exactly 16:9 at all 3 breakpoints.
8. The LINE OA video preview is clearly identifiable as a preview (type label + play affordance) without being visually louder than the rest of the section.
9. All three Selected Projects are easy to visually tell apart (different media type per card, per §4.2).
10. 公仔辨識系統 clearly surfaces both a YouTube entry point and a GitHub entry point (both currently disabled/TODO per §2.5 — structurally present, functionally inert until real links exist).
11. The Hero communicates the Backend/Automation/AI positioning within the first viewport at desktop width, without scrolling.
12. Visual language (color tokens, spacing scale, typography scale) stays consistent across Desktop/Tablet/Mobile.
13. The result is implemented as ordinary React components + CSS Modules + Docusaurus routing — nothing here depends on a runtime capability Docusaurus doesn't already have.

---

## 14. Final report format (Codex must output this at the end of TASK-12)

### 14.1 File changes
- List every created file (full path).
- List every modified file (full path) with a one-line summary of the change.
- List every deleted/emptied file (full path).
- Confirm: no file outside `src/pages/index.js`, `src/pages/index.module.css`, `src/components/PortfolioHome/**` was touched.

### 14.2 Test results and TODOs
- Output of `npm run build` (pass/fail, and the tail of the log if it failed).
- Explicit statement: "no lint/test/typecheck scripts exist in this project; not run."
- Full list of every `TODO:` comment introduced, with file + line, grouped by:
  - Missing real link/asset (repo URLs, YouTube URL, video file, email, per §2.5).
  - Deferred interaction (video play → modal/player wiring, §6.2).
  - Any Blocker per §0 rule 12 that prevented a task from being 100% completed, with the reason.
- Any **Pre-existing issue** found during the build that is unrelated to this task, clearly separated from anything this task introduced.

### 14.3 Rollback method
State the exact rollback path, e.g.:
```
git checkout -- src/pages/index.js src/pages/index.module.css
git clean -fd src/components/PortfolioHome
```
(State this without executing it — this task never runs destructive git commands itself; the rollback instructions are for the human to run later if needed.)

---

## Appendix A — Confirmed real links/assets quick reference

| Purpose | Value | Real? |
|---|---|---|
| GitHub (general) | `https://github.com/hsilan-sui/sui-dev-notes` | ✅ real |
| LINE OA | `https://line.me/R/ti/p/@998enzsc` | ✅ real |
| 求職入口 / résumé | `/docs/job-hunt-portfolio` | ✅ real |
| LINE OA 案例 | `/docs/LINEOA-PORFOLIO/overview` | ✅ real |
| 地政圖資案例／流程 | `/docs/LINEOA-PORFOLIO/11-landinfo-project` | ✅ real |
| 技術筆記總覽 | `/docs/intro` | ✅ real |
| 心理諮商地圖 案例／Demo／GitHub | — | ❌ missing, disabled/TODO |
| 地政圖資小幫手 GitHub | — | ❌ missing, disabled/TODO |
| 公仔辨識系統 YouTube／GitHub | — | ❌ missing, disabled/TODO |
| LINE OA 展示影片檔 | — | ❌ missing, static placeholder only |
| Email | — | ❌ missing, disabled/TODO |
| Hero 頭像 | `static/img/me.png` | ✅ real, use it |
| LINE OA QR | `static/img/line-oa-qr.png` | ✅ real, optional use |
