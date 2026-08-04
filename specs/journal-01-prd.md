# 01 · PRD — The Journal

Status: **Approved / Frozen design.** This document plans implementation of an already-approved design. It does not propose new design.
Source of truth: `design/blog-timeline.pen`, board **"Journal C — Timeline as Hero"** (Desktop 1440) and **"Mobile Journal — Wave Timeline"** (390), confirmed by the site owner on this date.
Author: Claude Code, acting as Software Architect (not Product Designer) for this document.

---

## 1. Product Goal

Replace the current stock-Docusaurus blog list (`/blog`) with **a Journal**: a single-focus, slow-reading surface for personal writing, built on top of the *existing* Docusaurus blog plugin and *existing* Markdown posts. No new CMS, no new content format, no new data source. Only the list/index experience changes.

The goal is not more traffic, more clicks, or more pageviews. The goal is that a visitor opens the page, sees the shape of the author's time before they see any words, and feels invited to stay on one entry rather than scan many.

## 2. Target Users

- **The site owner**, writing for themselves first. The Journal is one of three sections of a personal site: **Portfolio** (work), **Notes** (`docs/`, technical knowledge base), **Journal** (this spec) — poems, essays, travel notes, film/book reflections, life observations. It is explicitly **not** the technical blog; `docs/` already serves that role.
- **A small number of visitors** who land on the Journal from the Portfolio or from a direct link, reading one entry, maybe two. Not a returning daily-active audience, not an SEO funnel, not a newsletter growth surface.

## 3. Journal Philosophy

> "A Journal for Savoring Moments." Every entry is a moment in a life, not a unit of content. The interface should never ask users to look — it should quietly invite them to stay.

This rules out, explicitly, by the site owner's own words during design:
- Not a blog (Medium / Dev.to / Hashnode visual language).
- Not a social feed (Plurk's *UI* — avatars, bubbles, chat chrome — is explicitly rejected; only Plurk's *horizontal-timeline reading motion* is the reference).
- Not a "tech product" surface — no dashboards, no metrics, no gamified engagement patterns.

## 4. Design Philosophy

Reference mood (explicitly given, not to be reinterpreted): **Kinfolk, MUJI, Aesop, Apple Editorial, Monograph, Are.na, contemporary Japanese editorial design, Scandinavian editorial design.**

Keywords that must be legible in the shipped UI: *Savoring, Silence, Memory, Breathing, Walking, Time, Moment, Pause, Reflection, Stillness, Poetry.*

Concretely, this means:
- Generous whitespace is a feature, not unused space to be filled.
- One dominant idea per screen (see §5–7). No competing focal points.
- Nothing is emphasized by being large or loud. Emphasis is created by *focus* (opacity, glow, stillness), never by *scale* alone on the timeline, and never by color-blocking or drop shadows on the card.
- Motion is slow (600–900ms), eases out, never bounces, never feels "app-like." See `journal-04-motion-spec.md`.

## 5. Savoring Concept

"Design for savoring, not scrolling." Operationally, this constrains three things that a normal blog list would do differently:

1. **One article visible at a time**, never a grid or list of many summaries competing for attention (see UI Spec §Article Card — there is exactly one Story Card on screen at any moment).
2. **Transitions read as emergence, not navigation.** An entry does not "load" or "slide in" — it fades and rises gently into place, as if surfacing from memory, and the previous entry sinks back rather than being replaced instantly. See Motion Spec.
3. **The timeline is the anchor, not a control.** A user's attention should land on the wave first, on the numeral second, on the entry third — in that order — every time the page is opened. This ordering is enforced by layout scale and position (see UI Spec §Hero), not by copy or CTAs.

## 6. Horizontal Timeline

The horizontal axis is **calendar time across different days**. It is a continuous wave (not a straight ruler, not a date-picker), rendered as a single smooth SVG path with day-nodes sitting on it. Full behavioral and numeric spec: `journal-02-ui-spec.md` §Timeline and `journal-04-motion-spec.md` §Wave.

Non-negotiable properties (carried over verbatim from the approved design, do not re-derive or "improve"):
- Every calendar day in the journal's date range gets a node — including days with **no** entry (rendered inert/very faint). The timeline represents the passage of time itself, not a sparse index of "days that have content." See `journal-08-implementation-plan.md` §Data Model for how this reconciles with real, sparse blog-post dates.
- Wave amplitude is small and grows gently toward the most recent moment (a tidal build-up toward "now"), never toward the oldest. Amplitude range 6–16px on desktop, 4–11px on mobile. Never exaggerated ("風吹草地／水面／呼吸／心率／海浪，非常克制" — restrained, per the site owner).
- The wave visually overflows past the left edge of its viewport (older days extend beyond what's visible) and is horizontally draggable/scrollable. It never overflows on the right — the most recent moment is always the resting right edge.
- No date-picker affordances: no grid, no month/week gridlines, no per-node date labels printed on the timeline itself. The only date text on screen lives in the Hero numeral (§7) and inside the Story Card's metadata row.

## 7. "Current Moment" (not an "active state")

The most recent journal entry in the data set is the **Current Moment** — deliberately not called "selected," "active," or "focused" anywhere in copy, code comments, or component names, because those words describe UI state, not the intended feeling.

- The Current Moment's day-node is drawn at the **same size** as every other day-node. It is never enlarged. Never render it as a bigger dot — that would turn it back into a "selected pill," which is exactly the date-picker feeling this design rejects.
- Focus is created by three things acting together: (a) the wave's amplitude is at its local maximum near the Current Moment, (b) the node's opacity is fully solid while nodes further in the past fade progressively (memory fading), and (c) a soft, blurred, low-contrast glow sits behind it.
- If the *literal* calendar "today" is later than the most recent post (the ordinary case — nobody posts every single day), the Current Moment is still the most recent real post, not a fabricated "today" node. See `journal-08-implementation-plan.md` §Data Model.

## 8. Motion Philosophy

Full spec in `journal-04-motion-spec.md`. The one-line rule that governs every animation decision in this product: **design for contemplation, never for attention.** No bounce, no elastic easing, no gamified micro-feedback, no motion faster than ~600ms or with any hint of urgency. If a proposed animation could plausibly appear in a SaaS onboarding flow or a notification badge, it does not belong here.
