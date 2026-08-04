# 05 · Accessibility Specification — The Journal

This design was approved on visual/emotional grounds only; nothing in `design/blog-timeline.pen` specifies keyboard, screen-reader, or reduced-motion behavior (Pencil cannot represent those). Everything in this document is therefore **derived** by the Software Architect from the approved visuals plus ordinary WCAG 2.1 AA practice — it is binding for implementation, but if the site owner wants to challenge a specific rule here, that's a legitimate design conversation, unlike the frozen visual spec in `journal-02-ui-spec.md`.

---

## 1. Keyboard navigation & shortcuts

The Timeline + Card is one composite widget. Recommended keymap when focus is anywhere inside it:

| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | Move focus between: Same-Day Up (if present) → Prev → [into the Story Card's own focusable content: title link if any, tag links if tags are links, "繼續閱讀" link] → Next → Same-Day Down (if present) → out to the day-node list. Day-nodes with an entry are a `Tab`-reachable sequence (see §2); empty days are never `Tab` stops. |
| `←` / `→` | When focus is on the Prev/Next buttons or anywhere in the Card Nav Row: go to previous/next day with an entry (same effect as clicking Prev/Next). |
| `↑` / `↓` | When focus is on the Up/Down buttons: move within the current day's entries (same effect as clicking Up/Down). Only meaningful (and only rendered as focusable) when the day has >1 entry. |
| `Home` / `End` | When focus is within the day-node list: jump to the earliest / most recent day with an entry. |
| `Enter` / `Space` | Activate the focused control (day-node → go to that day's first entry; nav button → its action; "繼續閱讀" → follow the real permalink). |
| `Esc` | No special behavior required (no modal/overlay exists in this feature). |

## 2. Focus order

Top to bottom, left to right, matching visual order in `journal-02-ui-spec.md` §1:
1. (Global navbar — outside this feature's scope.)
2. Mini Header has no focusable elements (plain text).
3. Timeline: the day-node list, exposed as a horizontally-scrollable sequence of real `<button>` elements — one per day **that has an entry**. Empty days render as non-interactive decoration (`aria-hidden="true"`, `tabindex="-1"`, no `<button>` wrapper at all — see §4). This keeps the tab sequence to "number of real entries," not "number of calendar days," which for a sparse journal (see `journal-08-implementation-plan.md`) may be only a handful of stops even though hundreds of days are painted.
4. Same-Day Up button + caption (caption is not focusable, it's a `<span>`/`<p>` associated via `aria-describedby` on the Up button — see §6).
5. Prev button.
6. Story Card's own internal focusable content, in visual reading order (title is not a link by default per UI Spec — only make it focusable if it *is* wrapped in a link; tags are plain text per UI Spec §4, not links, so not focusable; "繼續閱讀" link is focusable).
7. Next button.
8. Same-Day Down button.
9. Nav Caption (not focusable — static text).
10. (Footer — outside this feature's scope.)

## 3. Reduced motion

Wrap every animation described in `journal-04-motion-spec.md` in a `prefers-reduced-motion: reduce` check. When active:
- Wave idle phase-drift (§2 of Motion Spec): **disabled entirely** — render the wave static at `PHASE = 0.6`.
- Card transitions (§4 of Motion Spec): replace the fade+translate with a plain **opacity crossfade only**, duration reduced to **150ms**, no `translateY`.
- Current Moment glow move (§3 of Motion Spec): instant (no transition) position change.
- Drag-release settle (§5 of Motion Spec): no decay glide — releasing the drag stops the scroll immediately at the release point.
- The hover/focus border-color micro-transitions (Interaction Spec §8–9) may remain, since color-only transitions at ~150–200ms are not a known motion-sickness trigger and are explicitly excluded from strict reduced-motion guidance by common practice — but if in doubt, disabling them too is an acceptable, more conservative choice.

## 4. Screen reader / semantics

- The Timeline Window is not a `<canvas>`/pure-decoration element with invisible click zones — build it as a real, semantic, horizontally-scrollable list: e.g. `<ol role="list">` (or a plain list of `<button>`s in a scroll container) with one item per **real entry's day**. The wave `<path>` (and empty-day dots, and companion dots) are purely decorative and must carry `aria-hidden="true"`; they sit visually behind/around the real buttons, not instead of them.
- Each day-node button gets an accessible name that states the date and, if relevant, that it's the Current Moment and/or has multiple entries, e.g. `aria-label="2026年8月4日，今天，共 2 篇"`. Do not rely on visual-only cues (glow, opacity) to convey "Current Moment" or "multiple entries" to assistive tech — the label must say so.
- The Current Moment's button additionally gets `aria-current="date"` (reuse this token even though it's not a literal `<nav>`; it is the semantically closest ARIA value for "the day we are currently viewing").
- Prev/Next/Up/Down buttons get explicit `aria-label`s, not just an icon: e.g. `aria-label="前一天"`, `aria-label="下一天"`, `aria-label="同一天的上一篇"`, `aria-label="同一天的下一篇"`. Disabled buttons (Interaction Spec §2–3) get `aria-disabled="true"` and `disabled` — both, so they're skipped by both mouse and assistive tech interaction models.
- The Story Card's transition (Motion Spec §4) must not cause screen readers to re-announce the whole card on every navigation as if it were a live region spamming updates. Use a single `aria-live="polite"` region that announces just the new entry's title on change (e.g. "現在顯示：雨天的清邁"), not the full body text.

## 5. Contrast

Verify every text/background pairing in `journal-07-design-tokens.md` against WCAG AA (4.5:1 for body text ≥ 14px equivalent, 3:1 for the large 128px/84px numeral and any text ≥ 24px/19px-bold). The approved palette is deliberately low-contrast/muted (Scandinavian mood, see PRD §4) — this is a real risk area:
- `$a-ink-secondary` (`#868D93`) on `$a-bg` (`#F4F5F6`) and on `$a-bg-card` (`#FAFBFB`) **must be measured**, not assumed, before shipping. If it fails 4.5:1 at the 12–13px sizes used for metadata/captions/tags, that is a real accessibility bug — flag it in the implementation report (`journal-09-task-breakdown.md` Definition of Done includes a contrast check) rather than silently darkening the token (which would violate the frozen palette) or silently shipping a failure. Escalate, don't unilaterally fix a frozen token.
- The "今天" pill text (`$a-accent` on `$a-accent-soft`) must also be measured for the same reason.

## 6. Touch target size

Visual circle sizes in `journal-02-ui-spec.md` §5 (30–38px) are **below** the commonly-recommended 44×44px minimum touch target on mobile. Do not enlarge the visible circles (that changes the frozen visual spec) — instead, pad the *hit area* using an invisible larger tap zone (e.g. `min-width/min-height: 44px` on the interactive element with the 30–38px circle centered inside via padding, or a `::before` pseudo-element hit-slop). This applies to all four nav buttons and to each day-node button on touch devices.

## 7. Color as the only signal — explicit exceptions to check

Per §4 of the Interaction Spec, "Current Moment" and "multiple entries" are communicated visually via opacity/glow/a tiny extra dot — all of which are hard to perceive for low-vision users. §4 of this document's `aria-label` rule is the primary mitigation (the *information* is always available non-visually). No further visual redundancy (e.g. a text badge) should be added on-screen for sighted users, since that would reintroduce the "News Card"/date-picker labeling this design explicitly avoids — the accessible name carries the information that the visual design deliberately keeps quiet for sighted users. This is an intentional, documented trade-off, not an oversight.
