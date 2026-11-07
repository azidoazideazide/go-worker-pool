# Design Guidelines: Go Worker Pool

This document gives the short rules for the visual system, the Go color tokens, layout, motion, and accessibility. `DESIGN.md` at the repository root is the full source of truth. `src/styles/tokens.css` holds the values.

## 1. Visual Direction

- The home page is a precision Go runtime telemetry board in the first view. It has three separate regions in the picture (**Stage**, **Readout**, and **Controls**), followed by a modular system-design tutorial (`HomeTutorial.astro`) below the controls.
- The stage shows four numbered zones: `01 Producer`, `02 Channel`, `03 Workers`, `04 Results`. Each zone has a Go code caption.
- Each worker is an SVG Go gopher. Its pose shows the worker state.
- Every label uses the words in `GLOSSARY.md`.
- Inside the picture frame, one hint line in the stage head is permitted.
- Each lesson page uses a quiet reading column (`--reading-max`, `42rem`) and may include static HTML and CSS teaching diagrams (`src/components/diagrams/`). They render at build time, need no JavaScript or third-party library, and keep real text sizes on a 390px phone. A lesson places one with an HTML comment such as `<!-- diagram: pipeline -->`. Do not load a diagram library from a CDN.

## 2. Go Color Palette (Light Mode and Dark Mode)

Every text pair meets at least a `4.5:1` contrast ratio. See `DESIGN.md` section 3.1 for the lowest pairs.

**Surfaces**

| Token | Role | Light (`[data-theme="light"]`) | Dark (`[data-theme="dark"]`) |
| :--- | :--- | :--- | :--- |
| `--bg-paper` | Page ground behind every panel | `#F4F8FA` | `#0B131E` |
| `--bg-panel` | Header, zone cards, worker cards, readout, and control decks | `#FFFFFF` | `#132030` |
| `--bg-stage` | Stage frame (the picture) behind the four zones | `#F7FAFC` | `#0E1824` |
| `--bg-inset` | Code captions, readout tiles, and empty docks | `#EEF4F7` | `#0F1B29` |
| `--bg-channel` | Channel pipe that holds the buffer slots | `#DCEFF5` | `#0F293A` |
| `--bg-slot` | One empty buffer slot | `#EDF7FA` | `#16354B` |
| `--bg-packet` | Body of a job packet | `#FFFFFF` | `#1A2D42` |
| `--grid-line` | Schematic grid lines on the stage | `#E4EDF2` | `#152434` |

**Ink and lines**

| Token | Role | Light (`[data-theme="light"]`) | Dark (`[data-theme="dark"]`) |
| :--- | :--- | :--- | :--- |
| `--ink` | Primary text, headings, and job IDs | `#0F172A` | `#F1F5F9` |
| `--ink-muted` | Secondary text, zone labels, and notes | `#475569` | `#A3B2C4` |
| `--ink-faint` | Third-level labels: slot indexes and empty-dock text | `#526175` | `#8B9BB0` |
| `--line` | Hairline borders and slot outlines | `#CBD5E1` | `#263B52` |
| `--line-strong` | Dashed empty docks, slider tracks, and the offline gopher outline | `#94A3B8` | `#3D5A78` |

**Go brand**

| Token | Role | Light (`[data-theme="light"]`) | Dark (`[data-theme="dark"]`) |
| :--- | :--- | :--- | :--- |
| `--go-blue` | Links, focus rings, active borders, and the primary button fill | `#006E9C` | `#5DC9E2` |
| `--go-cyan` | Go brand fill (Gopher Blue) | `#00ADD8` | `#00ADD8` |
| `--go-cyan-ink` | Text on top of `--go-cyan` | `#082F49` | `#082F49` |

**Job types**

| Token | Role | Light (`[data-theme="light"]`) | Dark (`[data-theme="dark"]`) |
| :--- | :--- | :--- | :--- |
| `--job-email` | EMAIL job badge fill | `#00ADD8` | `#00ADD8` |
| `--job-email-ink` | Icon ink on the EMAIL badge | `#082F49` | `#082F49` |
| `--job-webhook` | WEBHOOK job badge fill | `#7C5CC4` | `#A78BFA` |
| `--job-webhook-ink` | Icon ink on the WEBHOOK badge | `#FFFFFF` | `#1E1336` |
| `--job-image` | IMG job badge fill | `#FDDD00` | `#FDDD00` |
| `--job-image-ink` | Icon ink on the IMG badge | `#0F172A` | `#0F172A` |
| `--job-sync` | SYNC job badge fill | `#00A29C` | `#00C4B3` |
| `--job-sync-ink` | Icon ink on the SYNC badge | `#022C29` | `#022C29` |

**Worker and pipeline states**

| Token | Role | Light (`[data-theme="light"]`) | Dark (`[data-theme="dark"]`) |
| :--- | :--- | :--- | :--- |
| `--state-busy` | BUSY pill, busy worker border, and running chip | `#00657F` | `#22C3E6` |
| `--state-idle` | IDLE pill and the "Waiting on <-jobs" note | `#526175` | `#94A3B8` |
| `--state-ok` | Done tray, done check marks, and the done counter | `#136C34` | `#4ADE80` |
| `--state-alert` | TIMEOUT and ERROR pills, coral flash, and Failed tray | `#B0254F` | `#FB7185` |
| `--state-warn` | FULL badge, blocked producer, and Retry backoff tray | `#8F4205` | `#FBBF24` |
| `--state-off` | Inner ears of an offline gopher | `#94A3B8` | `#475569` |

**Progress**

| Token | Role | Light (`[data-theme="light"]`) | Dark (`[data-theme="dark"]`) |
| :--- | :--- | :--- | :--- |
| `--progress-track` | Unfilled part of a worker meter | `#E2E8F0` | `#1E2F42` |
| `--progress-fill` | Filled part of a worker meter | `#00ADD8` | `#00ADD8` |

**Gopher drawing**

| Token | Role | Light (`[data-theme="light"]`) | Dark (`[data-theme="dark"]`) |
| :--- | :--- | :--- | :--- |
| `--gopher-fur` | Gopher body and ears | `#6AD7E5` | `#6AD7E5` |
| `--gopher-fur-shade` | Belly and ear shading | `#3FB6C9` | `#3FB6C9` |
| `--gopher-snout` | Snout | `#F6D2A2` | `#F6D2A2` |
| `--gopher-nose` | Nose | `#5B3A29` | `#5B3A29` |
| `--gopher-eye` | Eye white | `#FFFFFF` | `#FFFFFF` |
| `--gopher-pupil` | Pupils | `#0F172A` | `#0B131E` |
| `--gopher-line` | Outline strokes | `#0F172A` | `#0B131E` |
| `--gopher-off` | Body fill of an offline (sleeping) gopher | `#CBD5E1` | `#334155` |

**Elevation and selection**

| Token | Role | Light (`[data-theme="light"]`) | Dark (`[data-theme="dark"]`) |
| :--- | :--- | :--- | :--- |
| `--shadow-1` | Resting cards (hairline-first, very soft) | `0 1px 2px rgb(15 23 42 / 0.06), 0 1px 1px rgb(15 23 42 / 0.04)` | `0 1px 2px rgb(0 0 0 / 0.35)` |
| `--shadow-2` | Lifted elements: a job packet in flight and the sticky mobile run bar | `0 8px 20px -10px rgb(15 23 42 / 0.28), 0 2px 4px -2px rgb(15 23 42 / 0.08)` | `0 10px 24px -12px rgb(0 0 0 / 0.7), 0 2px 4px -2px rgb(0 0 0 / 0.4)` |
| `--selection` | Text selection highlight | `rgb(0 173 216 / 0.22)` | `rgb(93 201 226 / 0.3)` |

**Derived tints**: `--state-busy-soft`, `--state-ok-soft`, `--state-alert-soft` (each `12%`), and `--state-warn-soft` (`14%`). Each is `color-mix(in srgb, var(--state-*) N%, transparent)`, so it follows the theme.

### 2.1 Token changes in this version

| Removed token | Use this token |
| :--- | :--- |
| `--job-cyan`, `--job-cyan-ink` | `--job-email`, `--job-email-ink` |
| `--job-coral`, `--job-coral-ink` | `--state-alert` (for errors) or `--job-webhook` (for a job type) |
| `--job-amber`, `--job-amber-ink` | `--job-image`, `--job-image-ink` (fill) or `--state-warn` (for text) |
| `--worker-busy` | `--state-busy` |
| `--worker-idle` | `--state-idle` |

New tokens: `--bg-stage`, `--bg-inset`, `--bg-packet`, `--grid-line`, `--ink-faint`, `--line-strong`, the job type tokens, the `--state-*` tokens, `--progress-fill`, the `--gopher-*` tokens, `--shadow-1`, `--shadow-2`, and `--selection`.

## 3. Typography

- **Sans (`--font-sans`)**: `'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`
- **Mono (`--font-mono`)**: `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
- **Scale**: `--text-3xs` (`0.625rem`), `--text-2xs` (`0.6875rem`), `--text-xs` (`0.75rem`), `--text-sm` (`0.8125rem`), `--text-md` (`0.875rem`), `--text-base` (`1rem`), `--text-lg` (`1.25rem`), `--text-h1` (`1.85rem`).
- Use `--text-3xs` only for packet type tags, retry badges, and preset meta.
- Use `font-variant-numeric: tabular-nums` for numbers that change.

## 4. Spacing, Radius, Layout, and Motion Tokens

- **Spacing (`--space-*`)**: `--space-1` (`0.25rem`), `--space-2` (`0.5rem`), `--space-3` (`0.75rem`), `--space-4` (`1rem`), `--space-6` (`1.5rem`), `--space-8` (`2rem`), `--space-10` (`2.5rem`), `--space-12` (`3rem`), `--space-16` (`4rem`). `--gutter` is `--space-6`, or `--space-3` below `40rem`.
- **Radius (`--radius-*`)**: `--radius-sm` (`0.25rem`), `--radius-md` (`0.375rem`), `--radius-lg` (`0.5rem`), `--radius-xl` (`0.75rem`), `--radius-pill` (`999px`).
- **Layout**: `--hit-target` (`44px`), `--content-max` (`1440px`), `--reading-max` (`42rem`), `--gopher-size` (`44px`, or `36px` below `40rem`).
- **Durations**: `--duration-fast` (`150ms`), `--duration-normal` (`200ms`), `--duration-shift` (`260ms`), `--duration-flight` (`420ms`), `--duration-alert` (`700ms`).
- **Easings**: `--ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`), `--ease-in-out` (`cubic-bezier(0.77, 0, 0.175, 1)`), `--ease-spring` (`cubic-bezier(0.22, 1, 0.36, 1)`).
- **Stacking**: `--z-flight` (`20`), `--z-sticky` (`30`).
- **Elevation**: `--shadow-1` for resting cards. `--shadow-2` only for a job packet in flight and the sticky mobile run bar.

## 5. Token Rules

- Define all hex color values only in `src/styles/tokens.css`.
- Do not write `#` followed by 3 to 8 hex characters anywhere else in `src/`. This includes inline SVG, comments, and Markdown. `pnpm check:tokens` fails on text such as `#104` or `#add`. Write "Job 104" in static text. Build `#104` at runtime with a template string.
- Inline SVG uses `fill: var(--token)` and `stroke: var(--token)` from CSS classes. Do not use `fill="..."` color attributes.
- You may add a semantic token. Add it to both themes, to `DESIGN.md`, and to this file in the same change.

## 6. Layout Rules

- The pool uses container queries (`container: pool`): one column below `40rem`, a two by two grid from `40rem` to `75rem`, and four columns (`11rem 1fr 1.2fr 11.5rem`) from `75rem`.
- Below `40rem`, the Run deck sticks to the bottom of the viewport and respects `env(safe-area-inset-bottom)`.
- No page may scroll horizontally at `390px`, `768px`, `1024px`, or `1440px`. Long code in a lesson scrolls inside its own `pre`.
- Retry backoff stays in the Producer zone. Failed stays in the Results zone. Do not add columns for them.

## 7. Motion Rules

- Animate only `transform` and `opacity`. Never use `transition: all`.
- Never animate from `scale(0)`. Entrances start at `scale(0.92)` to `scale(0.96)` with opacity `0`.
- Press feedback: `:active { transform: scale(0.97); }` on buttons and cards.
- **Lead**: the job packet. **Support**: buffer slot shifts and gopher state changes. **Decoration**: flow lines, pills, and counters. **Static**: containers. Lead and support start on the same frame.
- Every motion must survive interruption. After Send job spam, Step spam, Reset during a flight, preset changes, and fast slider drags, the flight layer must be empty within one flight and each job key must be in exactly one dock.
- One job keeps one packet element from send to result. Move it. Do not remove it and create a new one.
- Pause the loop when the picture is off screen or the tab is hidden.
- With `prefers-reduced-motion: reduce`: no auto-run, no flights, no idle loops. Step still works.

## 8. Accessibility and Interaction Rules

- Interactive buttons, switches, sliders, preset cards, and nav links must have a hit target of at least `44px` by `44px`.
- Every interactive control must show a `2px solid var(--go-blue)` outline on `:focus-visible`.
- Put hover styles only inside `@media (hover: hover) and (pointer: fine)`.
- Picture buttons use `touch-action: manipulation` and `user-select: none`.
- Never show a state by color only. Add a text pill, an icon, or a gopher pose.
- A visually hidden `aria-live="polite"` announcer reads the result of each control action.
- Each job packet has `role="img"` and an `aria-label`, for example `Job 104, send email, 2 seconds, retry 1 of 2`.
- The stage uses `data-dock`, `data-key`, `data-job`, `data-worker`, `data-state`, and `data-progress` attributes. See `DESIGN.md` section 10.

## 9. Truth Rules (Go Runtime)

The picture must show only states that Go can have:

- A worker is never Idle while the buffer holds a job. A parked receiver takes the job at once.
- A send to a parked worker is a handoff. The job does not go into the buffer.
- The producer is Blocked only when the buffer is full (or `cap` is `0`) and no worker waits.
- When a worker receives from a full buffer and the producer is blocked, the worker takes slot `[0]` and the blocked job goes into the last slot in the same step.
- A paused picture must show a clear `Paused` chip. Step must move the clock.

## 10. Checklist Before You Commit

1. `pnpm check:tokens` passes.
2. `pnpm build` passes.
3. Light and dark themes look correct at `390px`, `768px`, `1024px`, and `1440px`.
4. No horizontal scroll and no console errors.
5. All new words are in `GLOSSARY.md`.
