# Design Guidelines: Go Worker Pool

This document defines the visual system, Go color tokens, layout rules, and accessibility standards for the site. See `DESIGN.md` at the repository root and `src/styles/tokens.css` for the complete token contract.

## 1. Visual Direction

- The home page presents a full-viewport harbor chart of one Go worker pool.
- Every label on the picture uses the words in `GLOSSARY.md`: `Worker pool`, `Channel`, `Buffer`, `Job`, and `Worker`.
- The picture has no caption beneath it.
- Each lesson page uses a quiet reading column (`42rem` maximum width) with one short Go program.

## 2. Go Color Palette (Light Mode and Dark Mode)

Every text token meets at least a `4.5:1` contrast ratio against its surface.

| Token | Role in the site and the picture | Light mode (`[data-theme="light"]`) | Dark mode (`[data-theme="dark"]`) |
| :--- | :--- | :--- | :--- |
| `--bg-paper` | Page ground and chart paper | `#F4F8FA` | `#0B131E` |
| `--bg-panel` | Header, instrument bar, and worker cards | `#FFFFFF` | `#132030` |
| `--bg-channel` | Water inside the channel | `#DCEFF5` | `#0F293A` |
| `--bg-slot` | Empty buffer slot inside the channel | `#EDF7FA` | `#16354B` |
| `--ink` | Primary text, headings, and chart outlines | `#0F172A` | `#F1F5F9` |
| `--ink-muted` | Secondary text, axis labels, and idle text | `#475569` | `#94A3B8` |
| `--line` | Hairline borders and buffer slot outlines | `#CBD5E1` | `#263B52` |
| `--go-blue` | Links, focus rings, and active control borders | `#006E9C` | `#5DC9E2` |
| `--go-cyan` | Primary Go brand fill and progress bar fill | `#00ADD8` | `#00ADD8` |
| `--go-cyan-ink` | Text placed on top of `--go-cyan` | `#082F49` | `#082F49` |
| `--job-cyan` | Job container 1 fill | `#007D9C` | `#00ADD8` |
| `--job-coral` | Job container 2 fill | `#CE3262` | `#F43F5E` |
| `--job-amber` | Job container 3 fill | `#B45309` | `#FDDD00` |
| `--worker-busy` | Busy worker badge and active border | `#007D9C` | `#00ADD8` |
| `--worker-idle` | Idle worker badge and quiet border | `#64748B` | `#64748B` |
| `--progress-track` | Unfilled progress bar inside a worker | `#E2E8F0` | `#1E293B` |

## 3. Typography

- **Body and headings (`--font-sans`)**: `'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif`
- **Program blocks, numbers, and chart labels (`--font-mono`)**: `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace`
- Base font size is `16px` with `1.5` line height.

## 4. Spacing, Radius, and Motion Tokens

- **Spacing (`--space-*`)**: `--space-1` (`0.25rem`), `--space-2` (`0.5rem`), `--space-3` (`0.75rem`), `--space-4` (`1rem`), `--space-6` (`1.5rem`), `--space-8` (`2rem`), `--space-10` (`2.5rem`), `--space-12` (`3rem`), `--space-16` (`4rem`).
- **Radius (`--radius-*`)**: `--radius-sm` (`0.25rem`), `--radius-md` (`0.375rem`), `--radius-lg` (`0.5rem`).
- **Motion (`--duration-*`)**: `--duration-fast` (`150ms`), `--duration-normal` (`200ms`).
- Define all hex color values only in `src/styles/tokens.css`.

## 5. Accessibility and Motion Rules

- Interactive buttons, selects, and range controls must have a minimum hit target of `44px` by `44px`.
- Every interactive control must show a `2px solid var(--go-blue)` outline on `:focus-visible`.
- Readout numbers use `aria-live="polite"` so assistive technology announces preset and step changes.
- SVG groups use `data-slot`, `data-job`, `data-worker`, and `data-progress` attributes so scripts can move jobs with CSS `transform`.
- Respect `@media (prefers-reduced-motion: reduce)` by disabling smooth transitions when reduced motion is active.
