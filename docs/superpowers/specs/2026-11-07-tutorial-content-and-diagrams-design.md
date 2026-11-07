# Tutorial Content, Progressive Learning Path, and Mermaid Diagrams Design

Date: 2026-11-07
Branch: `feat/tutorial-content-and-ui`

## 1. Problem Statement

The current site opens directly into the interactive worker-pool telemetry board (`<PoolPicture />`) without explaining what this website is, what a worker pool does, or why software systems need one. In addition:

1. **No onboarding for general or non-technical visitors**: The home page has no conceptual introduction comparing a worker pool with sequential processing or unbounded concurrency.
2. **Mismatched navigation and lesson order**: The navbar (`Picture`, `Setup`, `Design`, `Syntax`, `Resilience`) puts terminal CLI setup (`Lesson 1: Setup`) before the conceptual design (`Lesson 2: Design`), which blocks readers who want to understand the concept before writing Go code.
3. **Lack of structural diagrams in lessons**: Lesson pages rely only on text tables and code blocks, with no visual flowcharts, state diagrams, or sequence diagrams to make component relationships visible.

## 2. Design Goals

1. **Keep the animation in the first view (above the fold)** on the home page while adding a modular, maintainable tutorial showcase right below it.
2. **Two-stage progressive difficulty curve**:
   - **Stage 1 (For Everyone — System Design & Concepts)**: Plain-language explanations using a short conveyor-belt and gopher-team analogy with real background jobs (`EMAIL`, `WEBHOOK`, `IMG`, `SYNC`), paired with Mermaid diagrams.
   - **Stage 2 (For Software Engineers — Go Deep Dive)**: Focused Go concurrency syntax (`go`, `chan`, `range`, `close`, `sync.WaitGroup`, `select`) and hands-on module implementation in `processor/` with `context.WithTimeout`, graceful shutdown, and `go test -race ./...`.
3. **Hybrid ASD-STE100 writing style**:
   - **STE100-Inspired** (short sentences, active verbs, concrete background-job examples, bold `GLOSSARY.md` terms) for tutorial introductions and prose.
   - **Strict ASD-STE100** (one idea per sentence, strict glossary terms, zero ambiguity) for UI labels, diagram captions, rule lists, and checklists.
4. **Strict visual system & responsive compliance**:
   - Use only CSS custom properties from `src/styles/tokens.css` (`pnpm check:tokens` must pass).
   - Maintain responsive layouts across `390px`, `768px`, `1024px`, and `1440px` with zero horizontal page scroll and `44px` minimum hit targets.

---

## 3. Information Architecture & Navigation (Combo 1)

### 3.1 Navbar Links (`src/components/SiteHeader.astro`)

| Order | Navbar Label | Route | Target Reader | Kicker / Stage |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Overview** | `/` | Everyone | Interactive Picture + System Design Intro |
| 2 | **Concepts** | `/lessons/design/` | Everyone | `Lesson 1 · System Design` |
| 3 | **Resilience** | `/lessons/resilience/` | Everyone & Engineers | `Lesson 2 · System Design` |
| 4 | **Go Syntax** | `/lessons/syntax/` | Software Engineers | `Lesson 3 · Go Concurrency` |
| 5 | **Build It** | `/lessons/setup/` | Software Engineers | `Lesson 4 · Go Implementation` |

Keeping the existing lesson file slugs (`design`, `resilience`, `syntax`, `setup`) while updating their front-matter `order` (`1` to `4`), `title`, `stage`, and `description` preserves existing URLs and updates the lesson pager automatically.

### 3.2 Content Schema Update (`src/content.config.ts`)

Add an optional `stage` field to the `lessons` collection schema so each lesson page displays both its lesson number and its difficulty stage in `.lesson-kicker`:

```ts
schema: z.object({
	title: z.string(),
	description: z.string(),
	order: z.number(),
	stage: z.string().optional(),
})
```

---

## 4. Home Page (`src/pages/index.astro`) & Modular Layout

### 4.1 First View vs. Below the Fold

1. **First View (Above the Fold)**:
   - `<PoolPicture />` remains the first element inside `<main class="layout-full">`.
   - The stage header keeps its compact layout so the interactive pipeline (`01 Producer`, `02 Channel`, `03 Workers`, `04 Results`), readout, and controls stay immediately visible and playable in the first screen.
2. **Below the Fold (`<HomeTutorial />`)**:
   - Placed below `<PoolPicture />` in `src/pages/index.astro`.
   - Built as a standalone, data-driven component (`src/components/HomeTutorial.astro`) with independent section blocks and CSS Grid layout classes so sections can be reordered, split into columns, or moved without touching `PoolPicture.astro`.

### 4.2 Modular Sections in `HomeTutorial.astro`

- **Section 01 — What Is a Worker Pool & Why It Matters**:
  - Plain-English introduction using real background jobs (`EMAIL`, `WEBHOOK`, `IMG`, `SYNC`) moving on a short 6-slot conveyor belt (**Channel Buffer**) to a fixed team of 3 gopher **Workers**.
  - Three comparison cards:
    1. **Sequential (One by One)**: 1 worker runs 1 job at a time. Safe memory, but 100 jobs wait in a long line.
    2. **Unbounded (All at Once)**: 1,000 jobs spawn 1,000 workers at once. Memory, CPU, and database connections overload and crash.
    3. **Worker Pool (Bounded)**: Fixed workers + fixed channel buffer. Fast parallel work, predictable memory, and **Backpressure** when full.
  - Includes **Diagram 1** (*Sequential vs. Unbounded vs. Worker Pool*).
- **Section 02 — How to Read the 4 Zones**:
  - Four scannable cards mapping `01 Producer`, `02 Channel`, `03 Workers`, and `04 Results` from the everyday conveyor-belt concept to the exact Go code caption shown in the stage above.
- **Section 03 — Four Guided Experiments & Learning Path**:
  - Interactive guide explaining what to watch in each of the 4 presets (**1 Steady flow**, **2 Backpressure**, **3 Timeout & retry**, **4 Drain & idle**) with jump buttons that select the preset and scroll up to the stage, plus cards linking to the 4 lessons (**Concepts**, **Resilience**, **Go Syntax**, **Build It**).

---

## 5. Mermaid Diagrams Design (`src/components/MermaidDiagram.astro`)

### 5.1 Four Core Diagrams

1. **Diagram 1 (`comparison` — Home Page `Overview`)**:
   - *Sequential vs. Unbounded vs. Worker Pool* flowchart showing why bounded concurrency protects a system.
2. **Diagram 2 (`pipeline` — Lesson 1 `Concepts`)**:
   - *Worker Pool Structure & Channel Rules* flowchart showing `01 Producer`, `Handoff` (when a worker is `Idle`), `02 Channel Buffer` (`Slot [N-1]` tail to `Slot [0]` front), `Blocked` producer (`Backpressure`), `03 Workers`, and `04 Results` (`Done`, `Retry backoff`, `Failed`).
3. **Diagram 3 (`states` — Lesson 1 `Concepts`)**:
   - *Worker Lifecycle State Diagram* showing transitions between `Offline`, `Idle` (parked on `<-jobs`), `Busy` (running a job), `Alert` (`Timeout` or `Transient error`), and `Draining` (finishes current job then exits).
4. **Diagram 4 (`resilience` — Lesson 2 `Resilience`)**:
   - *Attempt, Context Deadline, Retry Backoff, and Dead-Letter Flow* sequence/flowchart showing how one job runs with `context.WithTimeout`, finishes to `Done`, or triggers `Alert` $\rightarrow$ `Retry backoff` (exponential wait + jitter) $\rightarrow$ `Retry` (attempts 1–2) or `Failed` / dead-letter queue (after attempt 3).

### 5.2 Token-Safe Static Rendering + Viewable Mermaid Source

To respect all repository constraints (`No new npm dependencies unless asked`, `No raw hex colors outside src/styles/tokens.css`, `Zero horizontal scroll at 390px–1440px`, and `Light/Dark theme support`) without requiring `@astrojs/mdx`:

- `src/components/MermaidDiagram.astro` accepts `id` (`'comparison' | 'pipeline' | 'states' | 'resilience'`), `title`, and `caption`.
- It renders:
  1. A precision, responsive SVG schematic of that Mermaid diagram styled exclusively with CSS variables from `src/styles/tokens.css` (`--bg-panel`, `--bg-stage`, `--bg-inset`, `--bg-channel`, `--ink`, `--ink-muted`, `--line`, `--go-blue`, `--go-cyan`, `--state-ok`, `--state-warn`, `--state-alert`, `--state-busy`).
  2. A clean, collapsible `<details class="diagram-source">` drawer (`View Mermaid syntax`) containing the exact ```` ```mermaid ```` definition so visitors can inspect or copy the raw Mermaid code.
- In Markdown lessons (`src/content/lessons/*.md`), standard ```` ```mermaid ```` fenced blocks are also kept in the Markdown so GitHub renders them natively, while `src/pages/lessons/[slug].astro` renders the corresponding `<MermaidDiagram />` figures cleanly without duplicating raw code blocks.

---

## 6. Lesson Content Upgrades (Stage 1 $\rightarrow$ Stage 2)

1. **Lesson 1: `Concepts` (`src/content/lessons/design.md`, `order: 1`, `stage: "System Design"`)**:
   - Written for general readers first, then connected to Go runtime truth rules.
   - Explains what a worker pool is, how the 4 zones work together, why a handoff skips the buffer, how buffer slots move from tail to front (`Buffer [0]`), why backpressure protects the system, and how worker states behave.
   - Embeds **Diagram 2 (`pipeline`)** and **Diagram 3 (`states`)**.
2. **Lesson 2: `Resilience` (`src/content/lessons/resilience.md`, `order: 2`, `stage: "System Design"`)**:
   - Starts with a plain-English explanation of why jobs fail in production (slow webhooks, network blips, database resets) before showing the Go code.
   - Explains the 4 protections: **Context deadline** (`Timeout`), **Transient error** filtering, **Retry backoff** with **Jitter**, and maximum **Attempts** leading to **Failed** (dead-letter queue), plus why workers must never send retries directly back into `jobs` (deadlock prevention).
   - Embeds **Diagram 4 (`resilience`)**.
3. **Lesson 3: `Go Syntax` (`src/content/lessons/syntax.md`, `order: 3`, `stage: "Go Concurrency"`)**:
   - Bridges Stage 1 concepts into Go concurrency syntax for software engineers.
   - Covers `go` goroutines, buffered vs. unbuffered channels (`len` and `cap`), blocking send/receive, channel direction (`<-chan`, `chan<-`), `for job := range jobs` and `close(jobs)`, `sync.WaitGroup` fan-in shutdown, and `select` with `ctx.Done()`.
4. **Lesson 4: `Build It` (`src/content/lessons/setup.md`, `order: 4`, `stage: "Go Implementation"`)**:
   - Hands-on guide to building and testing the companion Go program in `processor/`.
   - Covers module setup, `Job` and `Result` types, wiring the worker pool in `main.go`, graceful shutdown with `signal.NotifyContext`, and verifying concurrency safety with `go test -race ./...`.

---

## 7. Documentation & Verification Rules

- Update `GLOSSARY.md` to include any new navigation or comparison terms (`Overview`, `Concepts`, `Sequential`, `Unbounded`).
- Update `DESIGN.md` and `docs/design-guidelines.md` to document the `<HomeTutorial />` region below the picture and the `<MermaidDiagram />` component.
- Verification commands required before completion:
  - `pnpm check:tokens`
  - `pnpm build`
  - Check responsive layout and light/dark themes at `390px`, `768px`, `1024px`, and `1440px`.
