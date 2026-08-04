# 03 · Interaction Specification — The Journal

Describes *behavior*. For visual states referenced here, see `journal-02-ui-spec.md`. For timing/easing of every transition mentioned here, see `journal-04-motion-spec.md`. For keyboard/focus/touch-target rules, see `journal-05-accessibility-spec.md` (this document states *what* happens; that one states how it must remain operable).

---

## 1. Data model recap (needed to read this spec — full detail in `journal-08-implementation-plan.md`)

- `entries`: every real blog post, sourced from the existing Docusaurus blog plugin, sorted chronologically.
- `days`: every calendar day from the earliest entry's date to the most recent entry's date, inclusive — **not** limited to days that have an entry.
- `entriesByDay[date]`: zero, one, or more entries for a given calendar day.
- `currentMoment`: the most recent entry in `entries` (see PRD §7). On first page load, the visible Story Card is always `currentMoment`.

## 2. Horizontal navigation (between days)

- **Prev** moves to the nearest earlier day that has ≥1 entry. **Next** moves to the nearest later day that has ≥1 entry. Both skip empty days silently — an empty day is never a navigable stop.
- Moving to a new day always selects **the first entry of that day** (index 0 within `entriesByDay[date]`), regardless of which entry within the previous day was showing.
- **Next** is disabled (rendered at reduced opacity ~0.35, `aria-disabled="true"`, not clickable) when the current day is the most recent day with an entry. **Prev** is disabled the same way at the earliest day with an entry.
- Clicking directly on a day-node on the wave jumps straight to that day's first entry (same end-state as reaching it via repeated Prev/Next). Clicking an **empty** day-node does nothing (empty days are visually inert and not interactive — see §5).
- Dragging the timeline (see §4) and releasing does **not** by itself change the Story Card; it only repositions the wave/viewport. The Story Card changes only on an explicit click/tap on a day-node, or Prev/Next, or a keyboard step (see Accessibility Spec §Keyboard).

## 3. Vertical navigation (between entries on the same day)

- Rendered only when the current day's `entriesByDay[date].length > 1`. When length is 1, both Up and Down controls are absent from the DOM (not merely hidden — see Accessibility Spec §Focus order, they must not be tab-stops when absent).
- **Down** moves to the next entry in that day's list (`index + 1`). **Up** moves to the previous (`index - 1`).
- Down is disabled at the last entry of the day; Up is disabled at the first. Neither wraps to the next/previous *day* — reaching the end of a day's entries vertically is a dead end by design (crossing days is a horizontal action only; this separation of axes is intentional, not a missing feature).
- The caption **"同一天，還有 {n} 篇"** where `{n} = entriesByDay[date].length - 1` (count of *other* entries, not total) sits above the Up control and updates live if the index within the day changes.

## 4. Timeline drag / scroll behavior

- The Timeline Window supports horizontal drag (mouse) and native touch scroll (touch/trackpad), independent of which entry is currently showing.
- Dragging follows the pointer 1:1 while active. On release, the wave continues moving with its released velocity and decelerates — see Motion Spec §Timeline settle for the exact easing/oscillation behavior (it must **not** snap to a stop instantly, and must **not** use scroll-snap-to-nearest-day).
- There is no minimum/maximum hard stop on the left (older) side beyond the actual data range — dragging past the earliest day simply reaches the end of the track (normal scroll-boundary behavior, e.g. CSS `overflow-x: auto` bounce or a soft rubber-band, whichever the implementation's scroll mechanism provides natively; do not build a custom infinite-scroll illusion).
- On the right (most recent) side, the track is never draggable *past* the Current Moment's node plus its buffer — see UI Spec §3.2 buffer rule, which exists exactly so the resting position always shows the glow fully.

## 5. Empty days (no entry)

- Rendered as a day-node at the same 7×7px size, but at a fixed low opacity distinct from the fade curve used for real entries (recommend a flat ~0.12, i.e., visually indistinguishable from "very old" but not part of the recency fade math — implementers should treat "no entry" as its own opacity constant, not as index `-1` in the fade formula).
- Not clickable, not focusable, `aria-hidden="true"` (a screen reader has no reason to announce hundreds of empty days — see Accessibility Spec).
- Never receive a companion dot (§6) and never render tooltips or any hover text — hovering an empty day does nothing.

## 6. Multiple articles in one day

- Any day with ≥2 entries renders a companion dot (5×5px, ~9.5px above the main node) in addition to the main day-node. This is a **hint**, not a control — it is not independently clickable; clicking anywhere in that node's hit-area (main dot + companion + reasonable surrounding padding, see Accessibility Spec §Touch target) performs the same action as clicking a single-entry day: jump to that day's first entry. Reaching the *other* entries for that day is always done via the vertical Up/Down controls (§3), never by clicking the companion dot itself.

## 7. Current Moment behavior

- On initial page load: Story Card shows `currentMoment` (most recent entry overall), horizontal Prev/Next positioned accordingly, vertical controls present only if that day has multiple entries.
- The Current Moment's day-node is visually distinguished only by (a) full opacity, (b) `$a-accent` fill instead of `$a-timeline-line`, and (c) the Moment Glow behind it — **never** by size. If any implementation makes the Current Moment's dot larger than 7×7px (or 5×5px on its companion, if any), that is a bug — see `journal-10-review-checklist.md`.
- If, after navigating away (Prev/Next/Up/Down/direct click), a user returns to the day that matches `currentMoment`'s date, that day's card is shown as normal — there is no special "return to now" affordance beyond ordinary navigation (no dedicated "Today" button/shortcut exists in the approved design; do not add one).

## 8. Hover (desktop / pointer devices only)

- Day-nodes with an entry: on hover, opacity animates toward 1 if it wasn't already (a small, non-committal preview cue) and the pointer becomes a pointer/hand cursor. No tooltip, no date label appears on hover — the design explicitly rejects date-picker affordances (see PRD §6).
- Nav circle buttons (Prev/Next/Up/Down): on hover, the 1px border transitions toward `$a-ink-secondary` (from `$a-border`) and the icon color deepens slightly toward `$a-ink`. No background fill on hover, no scale-transform on hover (would read as a "bouncy button," rejected by Motion Philosophy).
- The Story Card itself has no hover state — it is not a clickable card-as-a-whole (only the explicit "繼續閱讀" link inside it is a link). Do not add a whole-card hover-lift/shadow; that is News-Card language this design rejects (UI Spec §4).

## 9. Focus (keyboard, non-pointer)

See `journal-05-accessibility-spec.md` for the authoritative focus-order and keyboard-map. Interaction-level rule that belongs here: every control that has a hover state above also has an equivalent, equally visible **focus-visible** state using the same visual treatment (border/icon color shift) plus a focus ring. Focus must never be styled identically to hover only via `:hover` — implement `:focus-visible` explicitly.

## 10. Touch (mobile)

- Horizontal drag on the Timeline Window is a native touch-scroll gesture, not a custom swipe-detector — this keeps it interruptible mid-gesture and compatible with the browser's own momentum scrolling, which already satisfies the "decelerates like water" feeling without hand-rolled physics on touch devices. (Motion Spec's custom-eased settle animation applies to *pointer drag-release on non-touch input*; touch input may rely on the platform's native momentum scroll, and that is an accepted, documented substitution — not a shortfall.)
- Tapping a day-node behaves identically to a desktop click.
- All icon-buttons (Prev/Next/Up/Down) must meet the touch-target minimum in `journal-05-accessibility-spec.md` even though their *visual* circle is smaller (36px/34px/30px) — pad the hit-area, do not enlarge the visible circle (that would violate the frozen UI Spec sizes).

## 11. Scroll (page-level, not timeline-level)

- The page itself has no scroll-driven effects (no parallax, no reveal-on-scroll for the Card, no sticky header-shrink-on-scroll). The Hero band is not `position: sticky` — the site owner's earlier note that "Timeline 永遠保持在畫面上方" described its role in the *layout order* (always first, always dominant), not a request for scroll-pinning. If this is ever revisited, it must go back through a design step — do not silently add `position: sticky` during implementation.
