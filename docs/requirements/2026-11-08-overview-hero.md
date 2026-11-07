# Overview hero

Date: 2026-11-08

The first section of **Overview** (`/`) is the **picture** (`PoolPicture`). This file is the requirements for revamping that section only.

## Scope

In scope:

- The picture on Overview: stage head, stage, readout, and controls (Presets, Run, Pool, and Context).

Out of scope:

- The system-design tutorial under the picture (`HomeTutorial`).
- Lesson pages, the site header, and the Go program in `processor/`.
- New colors, spacing, or font families. Use the tokens already in `src/styles/tokens.css`.
- New words. Labels stay the words in `GLOSSARY.md`.

## Requirements

1. **One surface, no card around the picture.** Remove the rounded rectangle that wraps the stage head, the stage, and the readout. The stage head and the readout are not panels inside a box.

2. **The stage head shares the stage grid.** The title row (Worker pool, the running state, Core / Resilience, and the hint) uses the same grid background as the stage.

3. **One status bar directly under the stage.** It is a single flat strip, in the manner of a game status bar. It replaces the row of rounded control decks.

4. **The readout stays visible on the bar.** That is `len(jobs)`, busy, done, the Resilience counts, and the recent-event line.

5. **Run stays on the bar, with its buttons showing.** Run, Step, and Reset, and the clock, sit on the status bar. They are not tucked behind an icon.

6. **Presets, Pool, and Context open from the bar.** Each is a button or icon on the bar. Activating it opens that control: the four presets, the worker and buffer sliders, or the timeout and spike sliders. Closed, that control takes no card on the page.

7. **Fewer rounded rectangles.** The section should read as the grid and the one bar. It should not read as a stack of rounded cards.
