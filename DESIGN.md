---
name: Go Worker Pool
description: Technical harbor chart and quiet lesson site for a Go worker pool.
---

# Design System: Go Worker Pool

This document is the source of truth for all visual decisions on the site.

## 1. Philosophy and Visual Direction

Calm, technical, and precise. Prefer clear hierarchy and instrument-panel legibility over decoration.

- The home page presents a full-viewport harbor chart of one Go worker pool.
- Every label on the picture uses the words in `GLOSSARY.md`: `Worker pool`, `Channel`, `Buffer`, `Job`, and `Worker`.
- The picture has no caption beneath it.
- Each lesson page uses a quiet reading column (`42rem` maximum width) with one short Go program.

## 2. Colors (Semantic Go Tokens)

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
| `--job-cyan-ink` | Text on Job container 1 | `#FFFFFF` | `#082F49` |
| `--job-coral` | Job container 2 fill | `#CE3262` | `#F43F5E` |
| `--job-coral-ink` | Text on Job container 2 | `#FFFFFF` | `#0F172A` |
| `--job-amber` | Job container 3 fill | `#B45309` | `#FDDD00` |
| `--job-amber-ink` | Text on Job container 3 | `#FFFFFF` | `#0F172A` |
| `--worker-busy` | Busy worker badge and active border | `#007D9C` | `#00ADD8` |
| `--worker-idle` | Idle worker badge and quiet border | `#64748B` | `#64748B` |
| `--progress-track` | Unfilled progress bar inside a worker | `#E2E8F0` | `#1E293B` |

### Color Rules

- Use only the tokens listed above and defined in `src/styles/tokens.css`.
- Do not write raw hex values in components, layouts, pages, or component stylesheets.
- Keep high contrast between text and surface tokens in both light and dark modes.

## 3. Typography

- **Body and headings (`--font-sans`)**: `'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, sans-serif`
- **Program blocks, numbers, and chart labels (`--font-mono`)**: `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace`
- **Scale**:
  - Base body text: `16px` (`1rem`) with `1.5` line height
  - Page heading (`h1`): `1.85rem` (`29.6px`) with `1.2` line height
  - Readout and instrument controls: `0.85rem` to `0.9rem` in `--font-mono`
  - SVG chart labels: `11px` to `14px` in `--font-mono`

## 4. Spacing

Base unit: `4px` (`0.25rem`).

- `--space-1`: `0.25rem` (`4px`)
- `--space-2`: `0.5rem` (`8px`)
- `--space-3`: `0.75rem` (`12px`)
- `--space-4`: `1rem` (`16px`)
- `--space-6`: `1.5rem` (`24px`)
- `--space-8`: `2rem` (`32px`)
- `--space-10`: `2.5rem` (`40px`)
- `--space-12`: `3rem` (`48px`)
- `--space-16`: `4rem` (`64px`)

## 5. Radius and Elevation

- `--radius-sm`: `0.25rem` (`4px`) — buttons, links, inputs, and buffer slots
- `--radius-md`: `0.375rem` (`6px`) — harbor chart frame and instrument bar
- `--radius-lg`: `0.5rem` (`8px`) — large panels when needed
- Use `1px solid var(--line)` hairline borders for structure. Do not use heavy drop shadows or glassmorphism.

## 6. Motion and Accessibility

- `--duration-fast`: `150ms`
- `--duration-normal`: `200ms`
- Interactive buttons, selects, and range controls must have a minimum hit target of `44px` by `44px`.
- Every interactive control must show a `2px solid var(--go-blue)` outline on `:focus-visible`.
- Readout numbers use `aria-live="polite"` so assistive technology announces preset and step changes.
- SVG groups use `data-slot`, `data-job`, `data-worker`, and `data-progress` attributes.
- Respect `@media (prefers-reduced-motion: reduce)` by disabling smooth transitions when reduced motion is active.

## 7. Anti-Patterns (Avoid AI Slop)

- Do not use generic default fonts (`Inter`, `Roboto`, `Arial`) as the primary design voice.
- Do not add purple-to-blue gradients, neon glow effects, or blurred glass cards.
- Do not add decorative icons above headings or inside lesson paragraphs.
- Do not invent new hex colors outside `src/styles/tokens.css`.
- Do not add marketing hero banners, testimonials, or SaaS pricing grids.

## 8. Do / Don't

**Do**
- Use semantic tokens from `src/styles/tokens.css` exclusively.
- Use the exact terms from `GLOSSARY.md`.
- Keep the harbor chart and instrument bar scannable on one screen.

**Don't**
- Add decoration that does not explain the worker pool.
- Hardcode hex colors in `.astro`, `.ts`, or `.css` files outside `src/styles/tokens.css`.
