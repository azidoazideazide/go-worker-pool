## Problem Statement

When a visitor opens Overview, the worker pool picture is wrapped inside a large rounded card that separates the stage head, the stage grid, and the readout into boxed compartments, followed by four more rounded cards for Presets, Run, Pool, and Context. Instead of reading as one precision telemetry board, the first view reads as a heavy stack of nested rounded rectangles. Important playback actions and live telemetry compete for space with four permanently expanded configuration cards, pushing the tutorial further down the page and cluttering the first screen.

## Solution

Revamp the picture on Overview into a single flat telemetry surface composed of two parts: the schematic stage grid and one flat status bar directly beneath it. Remove the outer rounded card around the picture. Extend the schematic grid background across both the stage head and the four numbered pipeline zones so the header and zones share one continuous surface. Replace the boxed readout panel and the four rounded control cards with a single flat game-style status bar directly under the stage. Keep Run, Step, Reset, the clock, the telemetry counts, and the recent-event line permanently visible on the bar. Turn Presets, Pool, and Context into buttons on the bar that open one flat configuration panel at a time on demand and take no card on the page when closed.

## User Stories

1. As a visitor, I want the picture on Overview to appear as one flat schematic surface without an outer rounded card, so that the first view feels like a clean telemetry board rather than nested boxes.
2. As a visitor, I want the stage head (title, running state chip, tutorial link, Core and Resilience mode switch, and hint line) to sit on the same schematic grid background as the four numbered zones, so that the header and the pipeline read as a single unified stage.
3. As a visitor, I want the four pipeline zones (01 Producer, 02 Channel, 03 Workers, and 04 Results) to remain clear and scannable on the shared stage grid, so that I can follow every job packet from send to result.
4. As a visitor, I want a single flat status bar directly under the stage that replaces the row of four rounded control decks, so that all live telemetry and controls live in one compact strip.
5. As a visitor, I want the Run and Pause button, the Step button, the Reset button, and the clock to stay directly visible on the status bar at all times, so that I can pause, step by half a second, or reset the picture with a single click without opening a menu.
6. As a visitor, I want the live readout counts for length of jobs, busy workers, and done jobs to stay visible on the status bar in both modes, so that I can monitor channel occupancy, worker activity, and completed results while the picture runs or steps.
7. As a visitor, I want the Resilience readout counts (retried, timed out, and failed) to appear inline on the status bar whenever Resilience mode is active, so that I can track retry and failure telemetry alongside the core counts.
8. As a visitor, I want the recent-event line to remain visible on the status bar without shifting the page height as events arrive, so that I can read the latest runtime event without layout jitter.
9. As a visitor, I want Presets, Pool, and Context to appear as compact trigger buttons on the status bar that are closed by default, so that unopened settings take zero card space on the page.
10. As a visitor, I want each trigger button for Presets, Pool, and Context to show a concise summary of its current state on the status bar even when closed, so that I can see the active preset, worker count, buffer capacity, and context deadline at a glance.
11. As a visitor, I want clicking the Presets button on the status bar to open the four named presets (1 Steady flow, 2 Backpressure, 3 Timeout & retry, and 4 Drain & idle), so that I can switch starting scenarios when needed.
12. As a visitor, I want clicking the Pool button on the status bar to open the Workers slider and the Buffer capacity slider, so that I can scale goroutines live or resize the channel buffer.
13. As a visitor, I want clicking the Context button on the status bar to open the context deadline slider and the spike chance slider, so that I can tune attempt timeouts and transient error rates.
14. As a visitor in Core mode, I want opening the Context panel to show the disabled sliders and the note explaining that Core mode has no deadlines and to switch to Resilience mode, so that I understand why context settings do not apply in Core mode.
15. As a visitor, I want opening one of Presets, Pool, or Context to automatically close whichever other panel was open, so that at most one configuration panel is open at any time.
16. As a visitor, I want clicking the active trigger button again, pressing the Escape key, or clicking outside the open panel to close the open configuration panel, so that I can dismiss settings effortlessly.
17. As a visitor using a keyboard, I want keys 1 through 4 to load the four presets immediately whether the Presets panel is open or closed, so that I can jump between scenarios with one keystroke.
18. As a visitor reading the tutorial below the picture, I want the "Try a preset" actions in the tutorial to load the chosen preset and scroll smoothly back to the picture even when the Presets panel on the status bar is closed, so that the tutorial and the picture stay connected.
19. As a visitor on a 390px phone, I want the stage zones to stack cleanly in one column with no horizontal scrolling and the status bar controls to stick to the bottom of the viewport as I scroll the stage, so that I can step, pause, or adjust settings from anywhere in the pipeline.
20. As a visitor on a 390px phone, I want an opened Presets, Pool, or Context panel to attach cleanly above the sticky bottom status bar within the viewport with full 44px touch targets, so that I can use every slider and preset on a narrow screen.
21. As a visitor using a screen reader or keyboard navigation, I want proper expanded-state attributes on the status bar trigger buttons, visible focus outlines on every control, and polite live-region announcements for every control action, so that the status bar is fully accessible.
22. As a maintainer, I want the glossary and design documentation updated to describe the shared stage grid and single flat status bar rather than the removed outer stage card and rounded control decks, so that project documentation remains accurate and consistent.

## Implementation Decisions

### No rounded card around the picture
- Remove the outer rounded container card, outer drop shadow, and outer rounded corners that previously wrapped the stage head, stage, and readout as a boxed panel.
- The picture sits directly inside the Overview page container as a flat schematic surface bounded by crisp 1px hairlines using existing line tokens, with zero outer border radius.
- Reduce rounded rectangles across the section so only the interior pipeline elements on the stage (the four numbered zone cards, worker cards, channel pipe, buffer slots, and job packets) and interactive controls retain their functional borders, and the overall section reads strictly as the grid and the one status bar.

### Shared stage grid
- The stage head and the stage share one continuous schematic grid background using the stage background surface token and the 24px schematic grid lines.
- The stage head is no longer painted with a solid panel background. It sits directly on the schematic grid above the four numbered zones, separated from the zones below by spacing or a 1px hairline while the grid lines continue behind both regions.
- All elements in the stage head remain intact in their existing roles: the "Worker pool" heading, the Running or Paused status chip with its pulsing dot when running, the "What is a worker pool?" anchor link to the tutorial section below, the two-option Core and Resilience mode switch, and the preset or mode hint paragraph.

### Single flat status bar and bar order
- Directly beneath the shared stage grid sits one flat horizontal status bar using the panel surface token and 1px hairline top and bottom borders with zero border radius.
- On wide viewports, the status bar arranges its clusters in one horizontal strip from left to right in the following fixed order:
  1. **Run cluster (left)**: The primary Run and Pause button, the Step ("+0.5s") button, the Reset button, and the model clock ("t = 0.0s").
  2. **Readout cluster (center, flexing to fill available width)**: The inline telemetry count cells followed by the recent-event line.
  3. **Control triggers cluster (right)**: The three disclosure trigger buttons in the order **Presets**, **Pool**, and **Context**.
- On medium container widths where a single row would crowd the text, the status bar splits cleanly into two flat hairline-divided rows within the same flat strip: the Readout cluster (telemetry counts and recent-event line) on the upper strip, and the interactive bar (Run cluster on the left, Presets, Pool, and Context trigger buttons on the right) on the lower strip.

### Run, Step, Reset, clock, and readout visible on the bar
- Run (toggling to Pause while running), Step ("+0.5s"), Reset, and the model clock ("t = 0.0s" in tabular numerals) are always visible directly on the status bar and are never tucked inside a popover or icon-only menu.
- The prose helper note about Step is omitted from the visible bar surface so the bar stays compact; the Step button retains its accessible label ("Step 0.5 seconds").
- The readout stays permanently visible on the bar:
  - **Telemetry counts**: Flat inline cells divided by 1px hairlines (without a nested rounded card border) showing length of jobs, busy, and done in Core mode, and adding retried, timed out, and failed with their semantic state colors in Resilience mode. All changing numbers use tabular numerals.
  - **Recent-event line**: Sits inline in the readout cluster on the status bar. It displays the recent events list with a compact fixed single-line height (showing the newest timestamped event prominently with ellipsis truncation on overflow and full text on hover title, while keeping the list structure for screen readers) so incoming events never change the height of the status bar.

### Presets, Pool, and Context opening from buttons
- Presets, Pool, and Context are represented by three buttons in the right-hand cluster of the status bar.
- Each trigger button displays its glossary name ("Presets", "Pool", "Context"), a compact monospace summary of its current state (for example, the active preset number on Presets, worker count and buffer capacity on Pool, and timeout seconds on Context), and a subtle chevron or indicator showing whether its panel is open.
- All three panels are closed on initial render. When closed, a control panel uses the HTML hidden state and occupies zero space and zero cards on the page.
- Activating a trigger button toggles its corresponding flat panel open or closed:
  - **Single-open rule**: At most one panel (Presets, Pool, or Context) can be open at a time. Opening one closes any other open panel and updates the expanded accessibility state on all three trigger buttons.
  - **Dismissal**: Clicking the open trigger button again, pressing Escape, or clicking outside the open panel and outside the trigger buttons closes the active panel. Pressing Escape returns keyboard focus to the trigger button that opened it.
  - **Panel surface and placement**: The open panel renders as a flat, hairline-bordered drawer strip attached flush to the status bar with zero outer rounded card framing.
  - **Presets panel contents**: Contains the four radio preset options (1 Steady flow, 2 Backpressure, 3 Timeout & retry, 4 Drain & idle) with their number badge, label, configuration metadata, and the "keys 1–4" hint, arranged in a flat grid (four columns on wide containers, two by two on narrower containers).
  - **Pool panel contents**: Contains the Workers range slider (1 to 6) with its live output value, the Buffer capacity range slider (0 to 6) with its live output value, and the concise note explaining that changing the buffer capacity restarts the pool.
  - **Context panel contents**: Contains the context deadline range slider (2s to 6s) with its live output value, the Spike chance range slider (0% to 50%) with its live output value, and the context note. The Context trigger button on the bar remains clickable in both Core and Resilience modes so visitors in Core mode can open the panel, see the disabled sliders, and read the note explaining that Core mode has no deadlines and to switch to Resilience mode to enable them.
- All underlying radio inputs and range inputs stay mounted in the DOM when their panel is hidden so programmatic synchronization, keyboard shortcuts, and external preset triggers continue to work without change.

### Keys 1–4 and tutorial preset triggers
- Pressing keys 1, 2, 3, or 4 (without modifier keys and when focus is not inside a range slider or editable field) loads the corresponding preset immediately, regardless of whether the Presets panel is currently open or closed.
- Using keys 1 through 4 or clicking a "Try a preset" row in the tutorial section below the picture updates the checked preset radio input, updates the summary text on the Presets status bar button, updates the stage hint, resets the pool state to that preset, and announces the loaded preset through the polite live region without forcing the Presets panel to open.

### Phone width
- Below 40rem container width (including 390px phones), the stage head and the four pipeline zones stack in a single vertical column on the shared schematic grid with downward lane arrows and zero horizontal overflow.
- Directly below the fourth zone sits the flat readout strip (the telemetry counts in a three-column hairline grid and the compact recent-event line).
- The control strip of the status bar (containing the Run, Step, and Reset buttons, the clock, and the Presets, Pool, and Context trigger buttons) sticks to the bottom of the viewport while the visitor scrolls the picture, respecting the bottom safe-area inset and using the lifted shadow token.
- On phone widths, the sticky control strip arranges the Run, Step, Reset, and clock controls on one compact row and the Presets, Pool, and Context trigger buttons on an adjacent row within the sticky bar so every button maintains at least a 44px by 44px touch target without overflowing 390px.
- When the visitor opens Presets, Pool, or Context on a phone, the open panel docks flush above the sticky control strip inside the viewport so the visitor can interact with the presets or sliders immediately without scrolling.

### Glossary and design documentation updates
- No new domain words are added and no existing UI labels are renamed. All labels continue to use the exact vocabulary established in the glossary.
- Update the glossary definitions for **Readout** and **Controls** so they describe the readout counts, recent-event line, visible Run controls, and expandable Presets, Pool, and Context buttons living together on the status bar under the stage, rather than describing a separate readout panel and four stacked control decks.
- Update the design system document and the design guidelines document to reflect:
  - The removal of the outer rounded card around the picture.
  - The shared schematic grid across both the stage head and the stage zones.
  - The single flat status bar directly under the stage holding Run, Step, Reset, the clock, the readout counts, the recent-event line, and the buttons that open Presets, Pool, and Context.
  - The phone-width sticky bottom control bar and upward-docked disclosure panel behavior.

## Testing Decisions

- **What makes a good test**: Tests must assert observable behavior, visual layout contracts, accessibility states, and runtime invariants from the visitor's perspective rather than testing internal CSS class names or private DOM helper functions.
- **Modules and seams to test**:
  - **Overview picture integration seam (browser verification)**: Render the Overview page across all four standard viewport widths (390px, 768px, 1024px, and 1440px) in both light and dark themes. Verify that:
    - The stage head and stage share the continuous schematic grid background and have no outer rounded card wrapper.
    - The status bar sits directly below the stage with Run, Step, Reset, clock, readout counts, recent-event line, and the Presets, Pool, and Context buttons visible.
    - Presets, Pool, and Context are closed initially, open one at a time when their button is clicked, close on second click, Escape, or outside click, and take no space on the page when closed.
    - Keys 1 through 4 and the tutorial "Try a preset" buttons load presets while the Presets panel is closed.
    - Sliders in Pool and Context update the pool state and button summaries, and Context sliders are disabled with the explanatory note when Core mode is active.
    - At 390px width, there is zero horizontal overflow, every interactive button meets the 44px by 44px minimum hit target, and the status bar control strip sticks to the bottom of the viewport with open panels appearing above the bar.
    - Packet flights, buffer slot shifts, gopher state transitions, and Go channel runtime invariants remain unbroken under rapid interaction.
  - **Design token and build seam**: Run the automated design token check to confirm no raw hex values exist outside the token stylesheet, and run the static build to confirm clean compilation.
  - **Pure model seam**: Run existing unit tests for the pool engine, CSS duration parser, and companion Go module to ensure no regressions.
- **Prior art**: Existing Node test suite for library utilities, the token verification script, the static site build pipeline, and headless browser checks at 390px, 768px, 1024px, and 1440px in light and dark themes.

## Out of Scope

- Changes to the system-design tutorial section below the picture on Overview.
- Changes to lesson pages, static teaching diagrams in lessons, the site header, or the site footer.
- Changes to the standalone Go program module or the pure pool engine rules.
- Adding new color tokens, spacing tokens, or font families.
- Introducing new domain terms outside the glossary.

## Further Notes

- Preserving all existing data attributes on the pool root, stage, zones, docks, worker cards, meters, readout tiles, event log, announcer, and control inputs ensures that the motion choreographer and tutorial preset buttons continue to work seamlessly with the new status bar layout.
