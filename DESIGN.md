---
name: Go Worker Pool
description: Precision telemetry board for one Go worker pool, with Go gophers as workers and a quiet lesson site.
---

# Design System: Go Worker Pool

This document is the source of truth for all visual decisions on the site. `src/styles/tokens.css` holds the values. `docs/design-guidelines.md` holds the short rules for agents.

## 1. Philosophy and Visual Direction

The site is a precision Go runtime telemetry board with a light nautical-technical feel. It is calm and exact like a Linear or Figma diagram. The Go gophers make it friendly.

- The home page keeps the interactive picture in the first screen (above the fold) with three regions:
  1. **Stage** (the picture): four numbered zones that show the pipeline.
  2. **Readout**: telemetry tiles and a short event log.
  3. **Controls**: decks for presets, run, pool size, and context.
- Below the controls on the home page, a modular tutorial section (`HomeTutorial.astro`) introduces what a worker pool is, compares **Sequential**, **Unbounded**, and **Worker pool** execution in one diagram (12 jobs, the picture's default 3 workers and buffer of 6), maps the four zones, and links to the four presets and lessons.
- The picture is the hero in the first view. Do not put a marketing hero above it.
- Inside the picture frame, one short hint line is permitted in the stage head, above the zones. The hint changes with the preset.
- The stage title row has one text link, "What is a worker pool?", to the plain-words guide (`#why`) below the picture. It is the only way into the guide from the first view.
- Every label uses the words in `GLOSSARY.md`.
- Each zone shows a small Go code caption, for example `jobs := make(chan Job, 6)`. The caption tells the visitor which Go line the zone shows.
- Each lesson page uses a quiet reading column (`--reading-max`, `42rem`) with short Go snippets and static HTML and CSS teaching diagrams (`src/components/diagrams/`). They render at build time, need no JavaScript or third-party library, and keep real text sizes on a 390px phone. A lesson places one with an HTML comment such as `<!-- diagram: pipeline -->`.

## 2. Layout

### 2.1 Stage zones

The stage shows the pipeline from left to right:

```
01 Producer  ->  02 Channel  ->  03 Workers  ->  04 Results
jobs <- job      chan Job        goroutines      chan Result
```

- **01 Producer**: the Send job button, the Auto-send switch, the outlet, and the Retry backoff tray (Resilience mode only).
- **02 Channel**: the buffer slots, the `len / cap` gauge, the FULL badge, and the front mark. Slot `[0]` is the front of the channel. The next receive takes the job in slot `[0]`.
- **03 Workers**: up to six worker cards. Each card has a gopher, a state pill, a job dock, a progress meter, and a note. In Resilience mode the zone also shows `context.WithTimeout(ctx, 4*time.Second)`, and each meter has a thin mark at the work time of the job.
- **04 Results**: the Done tray and the Failed tray (Resilience mode only).

The Retry and Failed routes stay inside existing zones. They do not add new columns. This keeps the screen clear.

### 2.2 Responsive layout

The pool uses a CSS container query (`container: pool`). It does not use viewport media queries.

| Pool width | Layout |
| :--- | :--- |
| `< 40rem` (phones, `390px`) | One column. The zones stack from top to bottom. Lane arrows point down. The Run deck sticks to the bottom of the viewport. |
| `40rem` to `75rem` (`768px`, `1024px`) | Two by two grid: Producer and Channel on row 1, Workers and Results on row 2. |
| `>= 75rem` (`1440px`) | Four columns: `11rem 1fr 1.2fr 11.5rem`. |

- Worker cards use three columns when the workers zone is `26rem` or wider. Below that, they use two columns.
- The buffer slots use a second container query (`container: slot`). A slot narrower than `3.5rem` shows a compact packet.
- No page may scroll horizontally at `390px`, `768px`, `1024px`, or `1440px`.

## 3. Colors (Semantic Go Tokens)

The palette starts from the Go brand colors: Gopher Blue `#00ADD8`, Light Blue `#5DC9E2`, Aqua `#00A29C`, Fuchsia `#CE3262`, and Yellow `#FDDD00` (Go brand book, https://go.dev/blog/go-brand/Go-brand-book-v1.0.pdf). State colors in light mode are darker than the brand colors so that text passes contrast.

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

**Derived tints** (defined once in `:root`, they follow the theme):

| Token | Value | Role |
| :--- | :--- | :--- |
| `--state-busy-soft` | `color-mix(in srgb, var(--state-busy) 12%, transparent)` | Busy pill and selected preset background |
| `--state-ok-soft` | `color-mix(in srgb, var(--state-ok) 12%, transparent)` | Done chip background |
| `--state-alert-soft` | `color-mix(in srgb, var(--state-alert) 12%, transparent)` | Alert pill, coral flash, and Failed chip background |
| `--state-warn-soft` | `color-mix(in srgb, var(--state-warn) 14%, transparent)` | Blocked outlet, FULL badge, and backoff chip background |

### 3.1 Contrast

Every text pair meets at least `4.5:1`. These are the lowest pairs:

| Pair | Light | Dark |
| :--- | :--- | :--- |
| `--ink-muted` on `--bg-channel` | `6.39:1` | `6.95:1` |
| `--ink-faint` on `--bg-inset` | `5.69:1` | `6.13:1` |
| `--go-blue` on `--bg-paper` | `5.30:1` | `9.70:1` |
| `--state-alert` on `--state-alert-soft` (over `--bg-inset`) | `4.85:1` | `5.51:1` |
| `--state-ok` on `--state-ok-soft` (over `--bg-inset`) | `4.96:1` | `7.83:1` |
| `--job-sync-ink` on `--job-sync` | `4.77:1` | `6.84:1` |
| `--job-webhook-ink` on `--job-webhook` | `5.02:1` | `6.42:1` |
| `--go-cyan-ink` on `--go-cyan` | `5.27:1` | `5.27:1` |

### 3.2 Color rules

- Use only the tokens in this document. `src/styles/tokens.css` defines them.
- Do not write raw hex values anywhere in `src/` outside `src/styles/tokens.css`. This includes inline SVG `fill` and `stroke`, comments, and Markdown. `pnpm check:tokens` matches `#` followed by 3 to 8 hex characters. Write "Job 104" in static text. Build `#104` at runtime with a template string.
- Never show state by color only. Each state also has a text pill, an icon, or a gopher pose.
- If you add a token, add it to both themes, to this document, and to `docs/design-guidelines.md`.

## 4. Typography

- **Sans (`--font-sans`)**: `'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`. Body text and headings.
- **Mono (`--font-mono`)**: `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. Zone labels, code captions, job IDs, numbers, and the event log.
- Numbers that change use `font-variant-numeric: tabular-nums` so they do not shift.

| Token | Size | Use |
| :--- | :--- | :--- |
| `--text-3xs` | `0.625rem` (10px) | Packet type tags, retry badges, and preset meta only |
| `--text-2xs` | `0.6875rem` (11px) | Zone labels and code captions |
| `--text-xs` | `0.75rem` (12px) | Pills, notes, and the event log |
| `--text-sm` | `0.8125rem` (13px) | Worker names, buttons, and deck labels |
| `--text-md` | `0.875rem` (14px) | Job IDs and control values |
| `--text-base` | `1rem` (16px) | Body text, line height `1.5` |
| `--text-lg` | `1.25rem` (20px) | Readout numbers |
| `--text-h1` | `1.85rem` | Page heading |

## 5. Spacing

Base unit: `4px` (`0.25rem`).

| Token | Value |
| :--- | :--- |
| `--space-1` | `0.25rem` (4px) |
| `--space-2` | `0.5rem` (8px) |
| `--space-3` | `0.75rem` (12px) |
| `--space-4` | `1rem` (16px) |
| `--space-6` | `1.5rem` (24px) |
| `--space-8` | `2rem` (32px) |
| `--space-10` | `2.5rem` (40px) |
| `--space-12` | `3rem` (48px) |
| `--space-16` | `4rem` (64px) |
| `--gutter` | `--space-6`; `--space-3` below `40rem` |

**Layout tokens**: `--hit-target` (`44px`), `--content-max` (`1440px`), `--reading-max` (`42rem`), `--gopher-size` (`44px`; `36px` below `40rem`).

## 6. Radius, Elevation, and Stacking

- `--radius-sm` (`0.25rem`): code captions, state pills, packet badges, retry badges, and the FULL badge.
- `--radius-md` (`0.375rem`): buttons, nav links, slot docks, the outlet, and readout tiles.
- `--radius-lg` (`0.5rem`): zone cards, the channel pipe, worker cards, preset cards, and code blocks.
- `--radius-xl` (`0.75rem`): the stage frame and the control decks.
- `--radius-pill` (`999px`): chips in trays, the switch, progress meters, and lane arrows.
- Structure comes from `1px solid var(--line)` hairlines. Use `--shadow-1` for resting cards. Use `--shadow-2` only for lifted things: a job packet in flight and the sticky mobile run bar.
- `--z-flight` (`20`): the flight layer. `--z-sticky` (`30`): the sticky header and the mobile run bar.
- Do not use glassmorphism, `backdrop-filter` blur cards, or neon glow.

## 7. Components

### 7.1 Job packet

One job is one packet. The packet keeps the same identity (`data-key`) from the producer to the result tray. The visitor can follow it.

```
+--------------------------------+
| [icon] #104  EMAIL   2s  r1/2  |
+--------------------------------+
  badge  ID    type   work retry
```

- **Badge**: a job-type icon on the job-type fill (`--job-email`, `--job-webhook`, `--job-image`, `--job-sync`).
- **ID**: `#104`, mono, `--ink`.
- **Type tag**: `EMAIL`, `WEBHOOK`, `IMG`, or `SYNC`.
- **Work time**: for example `2s`. This is the time the job needs. It never changes between attempts.
- **Retry badge**: `r1/2` means retry 1 of 2. It shows only after the first attempt.
- **Variants**: `slot` (vertical card in a buffer slot), `row` (inside a worker dock or the outlet), and `chip` (small pill in the Done, Failed, and Retry backoff trays). Done chips show a check. Failed chips show a cross. Backoff chips show a countdown ring.

### 7.2 Gopher worker

Each worker is a goroutine. Its card shows an SVG Go gopher. The gopher is based on the Go gopher by Renee French (CC BY 4.0, https://go.dev/doc/gopher/README). The footer gives credit.

| State | Pill | Gopher | Card | Note |
| :--- | :--- | :--- | :--- | :--- |
| Idle | `Idle` | Half-closed eyes, slow breath, slow blink | Quiet border | `Waiting on <-jobs` |
| Busy | `Busy` | Eyes open, pupils look at the job, small bob | `--state-busy` border, job in dock, meter fills | `2.8s / 4s` (Core) or `1.2s of ctx 4s` (Resilience) |
| Alert | `Timeout` or `Error` | Wide eyes, small pupils, brows up, `!` mark, one shake | Coral flash (`--state-alert-soft`) for `--duration-alert` | `deadline exceeded` or `err: HTTP 503` |
| Draining | `Draining` | Same as busy | Finishes the current job, then goes offline | `Exits after this job` |
| Offline | `Offline` | Closed eyes, gray body (`--gopher-off`), sleep marks | Dashed border, dimmed | `Not started` |

- The eyes use clip paths. The lids move with the `--lid` custom property. The pupils move with `--look-x` and `--look-y`. All of these change `transform` only.
- After an alert, the job goes back to the producer for a retry, or to Failed. The gopher then goes to Idle or Busy. The worker never stays in Alert.

### 7.3 Channel

- The channel is a pipe (`--bg-channel`) with `cap` slots (`--bg-slot`).
- The slot indexes read `[cap-1] ... [1] [0]` from left to right. Slot `[0]` is the front and has a stronger border.
- The gauge shows `len N / cap M` and one dot for each slot.
- When `len == cap`, the FULL badge shows (`--state-warn`).
- When `cap` is `0`, the channel shows `unbuffered: each send waits for a receiver`.

### 7.4 Producer outlet

- The outlet shows the next send time or the blocked job.
- When the producer is blocked on a full channel, the outlet shows `blocked on send` in `--state-warn`, and the blocked job waits there. This is the sender parked on the channel send queue.

### 7.5 Readout

- Tiles: `len(jobs)`, `busy`, and `done`. Resilience mode adds `retried`, `timed out`, and `failed`.
- The event log shows the last three events. The newest event is on top.
- A visually hidden `aria-live="polite"` announcer reads the result of each control action: preset loaded, send result (for example `blocked`), step result, run or pause, mode change, and buffer change. It does not read every event while the picture runs, because that is too much noise.

### 7.6 Controls

- **Presets**: four radio cards. Keys `1` to `4` select them.
- **Run**: Run or Pause, Step (`+0.5s`), Reset, and the model clock `T = 3.1s`.
- **Pool**: Workers slider (`1` to `6`) and Buffer slider (`0` to `6`, `cap(jobs)`).
- **Context**: `ctx timeout` slider and `Spike chance` slider. They are disabled in Core mode.
- **Mode**: a two-part switch, `Core` and `Resilience`, in the stage head.

## 8. Motion

### 8.1 Tokens

| Token | Value | Use |
| :--- | :--- | :--- |
| `--duration-fast` | `150ms` | Press feedback and color changes |
| `--duration-normal` | `200ms` | Pills, toggles, and tray changes |
| `--duration-shift` | `260ms` | Buffer slots move forward (FLIP) |
| `--duration-flight` | `420ms` | One job packet flies between zones |
| `--duration-alert` | `700ms` | Coral flash on timeout or error |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entrances, shifts, and feedback |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Movement on screen and idle loops |
| `--ease-spring` | `cubic-bezier(0.22, 1, 0.36, 1)` | Small pops: the alert mark and the landing of a packet |

### 8.2 Choreography

| Role | Elements | Rule |
| :--- | :--- | :--- |
| Lead | The job packet | It flies on a low arc from dock to dock. The eye follows it. |
| Support | Buffer slot shifts and gopher state changes | They start at the same time as the lead. They do not wait. |
| Decoration | Flow lines, pills, and counters | Short. They must not pull the eye from the lead. |
| Static | Zone cards, the stage frame, and decks | They never move. |

- **Together by default.** A packet leaves slot `[0]`, the other packets shift forward, and the gopher wakes, all on the same frame.
- **Survive interruption.** Send job, Step, Reset, preset changes, and fast slider drags can happen during a flight. The script cancels or retargets each flight. No orphan node stays in the flight layer. Each job key is in exactly one dock.
- **One packet, one identity.** A packet moves. It is never removed and created again between zones.

### 8.3 Motion rules

- Animate only `transform` and `opacity`.
- Never use `transition: all`. List each property.
- Never animate from `scale(0)`. Entrances start at `scale(0.92)` to `scale(0.96)` with opacity `0`.
- Buttons press to `scale(0.97)` on `:active`.
- The model step is fixed (`0.05s`). A long frame is split into steps so event order does not change.
- The picture pauses when it is off screen or when the tab is hidden.
- With `prefers-reduced-motion: reduce`, the picture does not auto-run, flights become instant, and loops stop. Step still works.

## 9. Interaction and Accessibility

- Every button, switch, slider thumb row, preset card, and nav link has a hit target of at least `44px` by `44px` (`--hit-target`).
- Every interactive control shows a `2px solid var(--go-blue)` outline on `:focus-visible`.
- Hover styles live only inside `@media (hover: hover) and (pointer: fine)`.
- Picture buttons use `touch-action: manipulation` and `user-select: none`.
- The Auto-send control is `role="switch"` with `aria-checked`.
- Presets and mode are native radio inputs, so arrow keys work.
- Each packet has `role="img"` and a full `aria-label`, for example `Job 104, send email, 2 seconds, retry 1 of 2`.
- Respect `env(safe-area-inset-bottom)` under the sticky run bar.

## 10. Script Contract (Data Attributes)

| Attribute | Element | Meaning |
| :--- | :--- | :--- |
| `data-dock` | Slot, worker, outlet, and tray containers; also on each packet | Dock ID, for example `slot-0`, `worker-2`, `outlet`, `backoff`, `done`, or `failed` |
| `data-key` | Packet | Stable identity of one job across all zones |
| `data-job`, `data-type` | Packet | Job ID and job type |
| `data-variant`, `data-status` | Packet | `slot`, `row`, or `chip`; `blocked`, `backoff`, `done`, or `failed` |
| `data-worker`, `data-state` | Worker card | Worker ID; `offline`, `idle`, `busy`, or `alert` |
| `data-alert`, `data-exiting` | Worker card | `timeout` or `error`; `true` while draining |
| `data-progress` | Worker meter | Worker ID of the meter. The script sets the fill with the `--p` custom property (`0` to `1`) and the work-time mark with `--tick`. |
| `data-slow` | Worker card | `true` when the attempt runs past its work time, or when the work time is longer than the deadline |
| `data-mode`, `data-running`, `data-full` | Pool root | Mode, run state, and full channel |
| `data-flight-layer` | Overlay | Holds flying packets only during a flight |

## 11. Anti-Patterns (Avoid AI Slop)

- Do not use `Inter`, `Roboto`, or `Arial` as the main voice.
- Do not add purple-to-blue gradients, neon glow, or blurred glass cards.
- Do not add a marketing hero, testimonials, or pricing grids.
- Do not add a caption paragraph beneath the picture.
- Do not add icons that do not carry meaning.
- Do not invent hex colors outside `src/styles/tokens.css`.
- Do not draw a worker that is idle while the buffer holds a job. That state is false in Go.

## 12. Do / Don't

**Do**
- Use the semantic tokens from `src/styles/tokens.css` only.
- Use the exact words from `GLOSSARY.md`.
- Keep the stage, readout, and controls separate and scannable.
- Make each motion explain one Go rule.

**Don't**
- Add decoration that does not explain the worker pool.
- Hardcode hex colors in `.astro`, `.ts`, `.md`, or `.css` files in `src/` outside `src/styles/tokens.css`.
- Freeze a worker in the middle of a job while the clock is paused without a clear `Paused` chip.
