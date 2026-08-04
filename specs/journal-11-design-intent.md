# 11 · Design Intent Review — The Journal

This document exists for one purpose: so that six months from now, someone (the site owner, a future contributor, a future instance of an AI coding agent asked to "improve" this page) can read *why* the Journal looks and behaves the way it does, and recognize which parts are load-bearing versus which parts are merely today's implementation detail. Every other spec in this folder tells you *what* to build. This one tells you *what happens if you get it slightly wrong.*

---

## 這個 Journal 想傳達什麼？

It is trying to feel like **一本正在持續寫下去的日誌**, not a publishing platform. The three-way split of the site — Portfolio (work), Notes (technical knowledge), Journal (this) — is deliberate: this is the one place where the visitor is meant to slow down rather than scan for information. If a future change makes this page *faster to consume* (more entries visible at once, quicker transitions, denser information), it has moved the page in the wrong direction, even if that change is objectively "better UX" by conventional content-site metrics. This page is not optimized for engagement, retention, or scan-ability. It is optimized for the feeling of walking along a riverbank and noticing one lit moment at a time.

## 什麼叫做 Savoring？

Savoring is the deliberate rejection of **choice density**. A normal blog list shows you ten headlines and lets you pick; a feed shows you an infinite scroll and lets you skim. This page shows you **exactly one entry**, always, and makes moving to a different one cost a small, unhurried action (a click, a short wait for a fade) rather than a free, instant glance. That friction is not a performance shortcoming to be optimized away — it is the entire mechanism by which the page asks you to actually read the one thing in front of you instead of evaluating ten things at a glance. Any future feature request that says "let users see more than one entry at once, it's more efficient" is, definitionally, un-savoring this product, and should be treated as a new design conversation, not a build task.

## 什麼叫做 Current Moment？

It is the *anchor* the whole page orients around — the most recent real entry in the journal — and it is deliberately **not** framed as a UI selection state. "Selected," "active," "focused" are all words that describe a control being operated. "Current Moment" describes a place in time the visitor has arrived at. The practical, testable consequence of this distinction (see `journal-10-review-checklist.md` §Current Moment) is that **it is never visually bigger**. The moment you make it bigger, you've turned a place in time back into a button, and the whole "walking along a river, not clicking a menu" metaphor collapses. Size is a UI-affordance signal ("this is more clickable/important"); the Current Moment isn't more clickable than any other day with an entry — it's just where the visitor currently is standing.

## 什麼叫做 Breathing Timeline？

Two things, and it's important not to conflate them:

1. **Shape** — the timeline is a wave, not a ruler. This alone was the fix for "太像 Date Picker": a date-picker is a grid of equal, labeled, discrete cells; a breathing timeline is one continuous line whose only labeled point is the Current Moment (via the Hero numeral, not via the line itself).
2. **Motion** — the line is never perfectly still (Motion Spec §2). This is the harder, more skippable half, and it's the one most likely to get quietly dropped under implementation time pressure ("we'll ship the static version for now"). A permanently static wave is *visually* a wave but has lost the "breathing" half of the metaphor — it becomes a decorative squiggle instead of something alive. If time pressure forces a static v1 (Motion Spec §2 explicitly allows this as an honest, documented deferral rather than a janky animated version), that must be logged as a real, named gap in the final report — not silently accepted as "close enough."

## 哪些實作是不可改變的？(Non-negotiable, frozen)

- The layout skeleton: Header → Hero (Numeral + Timeline) → one Card → nav controls, in that order, on every breakpoint. (PRD §5, UI Spec §1.)
- Exactly one Story Card visible at any time. No grid/list view is ever added as an "alternate view toggle."
- The Current Moment's day-node size equals every other day-node's size. Always. (See above.)
- The color palette (Design Tokens §1) — this specific muted Scandinavian fog-blue set was chosen over two other fully-designed alternatives (a warm terracotta and a botanical green direction). Reverting to either of those without the site owner explicitly asking is not a "fix," it's an unrequested redesign.
- No pill/chip-style tag backgrounds on the Story Card, no card-level hover shadow, no filled CTA button. These three specific "un-do this" instructions were each given explicitly during design after seeing an earlier draft that had them — they are not oversights waiting to be "polished back in."

## 哪些動畫不能省略？(Which motions are not optional polish)

Ranked by how load-bearing each one is to the actual concept, not by implementation difficulty:

1. **Card fade + rise on navigation** (Motion Spec §4) — this is the single most important animation in the product. It is the literal mechanism of "emerging from time, like a memory," which is the PRD's explicit alternative to "reading an article." Cutting this to an instant swap turns the Journal back into an ordinary paginated blog with extra CSS. This must ship.
2. **Current Moment focus via opacity/glow, not scale** (Motion Spec §3) — not really an "animation" so much as a rendering rule, but it's listed here because it's the most common place an implementer will reach for a `transform: scale()` transition "for emphasis." Don't.
3. **Timeline drag-release deceleration** (Motion Spec §5) — secondary to #1, but it's what makes dragging the wave feel like water instead of a scrollbar. Acceptable to ship a simple exponential decay rather than hand-rolled spring physics (Motion Spec §5 explicitly allows the simpler version) — but some deceleration must exist; an instant stop-on-release is a regression toward "date-picker."
4. **Wave idle phase-drift** (Motion Spec §2) — genuinely optional-for-v1 with an explicit, honest deferral path (see above), because it is the most expensive to get right without causing jank, and jank is a worse outcome than a documented gap.

## 哪些留白不能被壓縮？(Which whitespace must not be compressed)

Not all spacing values are equally sacred — some are ordinary layout rhythm and can flex slightly if a real content edge case demands it (e.g. a very long title). Three specific spacing decisions are not ordinary rhythm and must not be "tightened up" for density:

1. **The Mini Header's smallness relative to the Hero** (UI Spec §2 vs §3 — 40/32px top padding on the header versus the Hero being the dominant band). This size relationship *is* the design decision that makes "Timeline is the first thing you see, not the article" true. A future request to "make the header more prominent / add a real nav menu here" directly undoes this.
2. **The Timeline's right-side buffer** (UI Spec §3.2, ≥90px/70px) — this is not decorative breathing room, it is a correctness constraint that prevents the Moment Glow from being clipped. It was a real bug caught during design QA (the glow and floating date-pill were originally clipped before this buffer was added) — do not shrink it to "tighten up" the Hero band.
3. **Card body's internal gap (22px) and the overall generosity of the Card's padding** (UI Spec §4) — this is the single component in the whole page a visitor spends the most time looking at, and it is the clearest, most literal expression of "MUJI/Kinfolk whitespace" in the entire build. Compressing it to fit more text per screen is exactly the "optimize for scanning" move this product exists to reject.

## 哪些 Motion 是體驗核心？(Which motion is the actual experience, not decoration)

If you can only ship one animated behavior in a time-constrained v1, ship the **Card fade + rise transition** (Motion Spec §4 / item #1 above). Every other motion in this spec — the wave's idle drift, the drag deceleration, even the hover color shifts — supports and reinforces the feeling: the Card transition *is* the feeling. It's the one moment where the product directly enacts its own thesis ("觀者不是在瀏覽，而是在慢慢走過自己的生命" — a memory surfacing, staying a while, sinking back) in something the visitor directly watches happen, every single time they move to a different moment. Get this one right before spending polish time anywhere else.
