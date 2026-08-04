# 10 · Review Checklist — The Journal

Use this for the final QA pass (`journal-09-task-breakdown.md` TASK-10) and for any later human code review. Each item should be checked against a **running dev server with real content**, not read off the code. Where an item references a spec section, re-read that section if the check fails — don't guess at the fix.

---

## UI consistency (vs. `journal-02-ui-spec.md`)

- [ ] Mini Header copy, sizes, and desktop `space_between` / mobile stacked layout match §2 exactly.
- [ ] Hero band is full-bleed (touches both viewport edges), has the top+bottom 1px hairline, background is `$a-bg-card` not `$a-bg` (these two are close but distinct — a common copy-paste slip).
- [ ] Numeral block matches §3.1 sizes/weights at both breakpoints; "今天" pill only shows on the Current Moment, not on every day viewed.
- [ ] Timeline Window height is exactly 110px/90px; day-nodes are exactly 7×7px **on every day, including the Current Moment** — if the Current Moment's dot is visibly larger than a neighbor's, that's a direct violation of PRD §7 and Interaction Spec §7, fix it immediately regardless of how it looks.
- [ ] Right-side track buffer is large enough that the glow/companion dot are never clipped by the Timeline Window (§3.2) — check this specifically on the actual Current Moment, not just in the abstract.
- [ ] Story Card corner-radius is 20px, no shadow, no border. Tags are plain text + "·" separators, not filled pill chips (this exact mistake is called out twice in the specs because it's the easiest way to accidentally regress toward "News Card").
- [ ] CTA is a plain text+icon link, not a filled/outlined button.
- [ ] Nav buttons are all outline circles, never filled, never with a drop shadow.
- [ ] No component in this feature uses a color, font, radius, or spacing value that isn't in `journal-07-design-tokens.md`.

## Responsive

- [ ] Desktop (≥997px), Mobile (≤596px) match their respective Pencil frames closely (spot check against the actual `.pen` file screenshots taken during design, or re-open Pencil and compare side-by-side).
- [ ] Tablet (597–996px) does not look broken — UI Spec §7 interpolation is a default, not a pixel contract, so "does not look broken" is the actual bar here, not pixel-matching.
- [ ] No horizontal scroll on the page itself at any width (the Timeline Window's internal horizontal scroll is expected and correct; the page body scrolling horizontally is a bug).
- [ ] Card hero image never overflows its rounded container (`overflow: hidden` present and working) at any width.
- [ ] Long real post titles (test with whichever of the four stub posts has the longest title) wrap without breaking the card layout or clipping.

## Motion consistency (vs. `journal-04-motion-spec.md`)

- [ ] Card transition on Prev/Next/Up/Down is fade + ~8px translate, ~600–900ms range, visibly `ease-out` (decelerating), never a hard cut, never a slide-from-side.
- [ ] No bounce/elastic/overshoot easing anywhere in this feature — scrub through every transition slowly (browser devtools "Animations" panel, or slow-motion screen recording) and confirm the curve never overshoots past its target value before settling.
- [ ] Timeline drag-release decelerates rather than stopping instantly.
- [ ] Wave idle drift (if shipped — see Motion Spec §2's documented-deferral escape hatch) is barely perceptible, never fast, never causes visible layout jank (check devtools Performance panel for long tasks while the drift runs at rest).
- [ ] Hover/focus color transitions on nav buttons are quick (~150–200ms) and are the *only* fast transitions in the feature — everything else is ≥600ms.

## Accessibility (vs. `journal-05-accessibility-spec.md`)

- [ ] Full keyboard walk-through: reach every control via `Tab`, operate day-nodes/nav buttons via `Enter`/`Space`, confirm arrow-key shortcuts work when documented.
- [ ] Focus-visible ring/state is present and distinguishable from hover-only styling (test with keyboard only, mouse unplugged mentally — i.e. actually tab through, don't just read the CSS).
- [ ] Empty days are confirmed absent from the Tab sequence and from the accessibility tree (`aria-hidden="true"`) via devtools.
- [ ] Each real day-node's accessible name includes the date, and "今天"/multi-entry status when applicable — read a few with a screen reader or the browser's accessibility inspector, don't just check that an `aria-label` attribute exists.
- [ ] `prefers-reduced-motion: reduce` (toggle at the OS or via devtools emulation) removes translate/glow-move/drift motion and shortens the card crossfade, per §3.
- [ ] Measure actual contrast ratios for `$a-ink-secondary` on `$a-bg` and on `$a-bg-card` at the small (11–13px) sizes used for captions/metadata/tags — if below 4.5:1, this is logged as a Blocker in the final report, not silently patched by darkening a frozen token.
- [ ] Touch targets for all four nav buttons and for day-nodes are effectively ≥44×44px (padded hit-area), even though the visible circles are smaller — check via devtools' mobile touch-target overlay if available, or by measuring the actual clickable bounding box.

## Performance

- [ ] `npm run build` succeeds with no new warnings attributable to this feature.
- [ ] No unnecessary re-renders of `WaveTimeline` on every animation frame of the idle drift (confirm via React DevTools profiler that the drift doesn't cascade a re-render of `StoryCard`/`JournalPage`'s entire subtree every frame — it should be isolated to whatever minimally needs to move).
- [ ] Page doesn't noticeably jank/stutter while dragging the timeline, even with the full real day-range (which, per Implementation Plan §3, may be hundreds of days) rendered.
- [ ] No new npm dependency was added (Implementation Plan §6) — confirm `package.json`/`package-lock.json` are unchanged except for the one narrowly-scoped, explicitly-reported exception if a font `<link>` was added (that's a config/markup change, not a dependency).

## Design Philosophy / Savoring feeling (vs. `journal-01-prd.md`)

- [ ] Only one Story Card is ever visible at a time — no grid, no list, no "related entries" rail appeared anywhere.
- [ ] The Timeline visually dominates the first screen a visitor sees — scroll position at page load should show Hero clearly larger/more prominent than the Card below it, not the reverse.
- [ ] Nothing on the page resembles a notification badge, a "new" tag, a trending indicator, a like/share button, or any other attention-economy UI pattern.
- [ ] The overall visual tone reads as quiet/muted/editorial (Kinfolk/MUJI/Scandinavian), not as a typical SaaS marketing page or blog theme — a genuinely useful gut check: would this page look at home linked from a design portfolio for "quiet personal sites," or would it look at home in a growth-marketing case study? It must be the former.

## Current Moment

- [ ] Current Moment day-node is the same size as every other real-entry day-node — re-verify this specifically, it is the single most likely regression across any future edit to this feature.
- [ ] Current Moment is derived from the most recent **real entry**, not from `new Date()` / literal today (Implementation Plan §3) — verify by checking the actual value used, not just that the page "looks right" (it could look right by coincidence if the most recent stub post happens to be recent-ish; verify the logic, not the visual).
- [ ] "今天" pill text only appears next to the day currently being viewed when that day *is* the Current Moment, and disappears when navigating elsewhere.

## Horizontal timeline

- [ ] Wave amplitude visibly grows from left (older) to right (most recent) — a flat, uniform-amplitude wave is a spec violation (Motion Spec §1).
- [ ] Timeline extends past the left edge of its viewport (older days are genuinely off-screen, not just visually implied) and is draggable/scrollable to reach them.
- [ ] Timeline never extends past the right edge / never allows scrolling past the Current Moment's resting position.
- [ ] No date text is printed directly on/under individual day-nodes anywhere (that would reintroduce the "date-picker" feeling explicitly rejected — PRD §6).

## Vertical timeline (same-day)

- [ ] Up/Down controls are present only on days with >1 real entry, and are entirely absent (not just hidden) on single-entry and empty days.
- [ ] Navigating vertically never changes the current day; navigating horizontally always resets to that new day's first entry (Interaction Spec §2–3) — verify both directions explicitly, they're easy to accidentally swap.
- [ ] The companion dot on a multi-entry day is a small hint only — clicking it does not do anything different from clicking the main day-node at that position (Interaction Spec §6).
