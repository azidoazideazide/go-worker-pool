# Go Worker Pool Site (First Build) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **GROK-ONLY EXECUTION GATE:** This plan must be executed **only** by a Grok controller session dispatching **only** Grok subagents (for example `xai/grok-code-fast-1` for mechanical implementation tasks and `xai/grok-4` for integration and code review tasks). Do not dispatch non-Grok models.

**Goal:** Build the static Astro frame, Go light/dark harbor chart picture with presets, three title-only lesson pages, empty `processor/go.mod`, and updated documentation for the `go-worker-pool` project.

**Architecture:** The repository holds two parts that do not call each other: a static Astro 7 site at the repository root (published to GitHub Pages under `/go-worker-pool/`) and a Go module in `processor/`. The home page renders a full-viewport SVG harbor chart picture driven by a pure TypeScript preset state (`normal`, `full`, `idle`) and five inert controls ready for the learner's next step. One Astro Content Collection (`lessons`) renders three title-only pages (`Setup`, `Design`, `Syntax`).

**Tech Stack:** Astro `^7.4.7` (static output, Content Layer `glob` loader), TypeScript, semantic HTML5/SVG, CSS custom properties (Go brand light and dark palettes), Go `1.23` (`processor/go.mod` only).

## Global Constraints

- **Grok-only models:** Every implementer subagent and task reviewer subagent must explicitly specify a Grok model (`xai/grok-code-fast-1` or `xai/grok-4`).
- **Two parts never call each other:** The Astro site at the root and the Go program in `processor/` must never import or call each other at build time or run time.
- **No Go implementation yet:** Task 1 creates `processor/go.mod` only. Do not create any `.go` files.
- **No motion loop yet:** Task 5 wires the preset selector (`normal`, `full`, `idle`) so switching presets updates the SVG picture and readout numbers. Keep the five simulation controls (`Workers`, `Buffer`, `Job time`, `Step`, `Reset`) visible and inert (`disabled`) so the learner writes the motion script in a later step.
- **Static output and `sitePath()`:** Keep `output: 'static'` and `base: '/go-worker-pool'` in `astro.config.mjs`. Build every internal link and asset URL with `sitePath()` from `src/lib/site-path.ts`.
- **Glossary language:** Every label and heading in the UI and docs must use the `GLOSSARY.md` terms (`Worker pool`, `Job`, `Worker`, `Channel`, `Buffer`, `Picture`, `Program`, `Lesson`, `Site`, `Visitor`, `Motion`, `Preset`, `Theme`). Never use avoided terms (`cargo`, `canal`, `dock`, `visualizer`, `simulation`, `demo`, `queue`, `backlog`, `catalog`, `entry`).
- **Go light and dark theme tokens:** `src/styles/site.css` must define all 16 Go color tokens for both `[data-theme="light"]` and `[data-theme="dark"]`, meet `4.5:1` text contrast, enforce `44px` minimum control height, show `:focus-visible` outlines, and respect `@media (prefers-reduced-motion: reduce)`.
- **ASD-STE100 prose:** All documentation and UI text must use short active-voice sentences in the present tense without contractions.

---

### Task 1: Project Base Configuration and Empty Go Module

**Model:** `xai/grok-code-fast-1` (implementer) / `xai/grok-4` (reviewer)

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Modify: `src/lib/site-path.ts`
- Create: `processor/go.mod`

**Interfaces:**
- Consumes: none (foundational configuration task)
- Produces:
  - `astro.config.mjs` with `site: 'https://azidoazideazide.github.io'`, `base: '/go-worker-pool'`, `output: 'static'`
  - `sitePath(path?: string): string` in `src/lib/site-path.ts`
  - `processor/go.mod` declaring `module github.com/azidoazideazide/go-worker-pool/processor`

- [ ] **Step 1: Verify the current base path fails the `/go-worker-pool` check**

Run:
```bash
node -e "import fs from 'node:fs'; const cfg = fs.readFileSync('astro.config.mjs', 'utf8'); if (!cfg.includes(\"base: '/go-worker-pool'\")) { console.error('FAIL: base is not /go-worker-pool'); process.exit(1); }"
```
Expected: `FAIL: base is not /go-worker-pool` (exit code 1)

- [ ] **Step 2: Update `package.json`, `astro.config.mjs`, `src/lib/site-path.ts`, and create `processor/go.mod`**

Write `package.json`:
```json
{
  "name": "go-worker-pool",
  "type": "module",
  "version": "0.1.0",
  "engines": {
    "node": ">=22.23.4"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^7.4.7"
  }
}
```

Write `astro.config.mjs`:
```js
// @ts-check
import { defineConfig } from 'astro/config';

// Project site: https://azidoazideazide.github.io/go-worker-pool/
// `base` matches the GitHub repository name.
export default defineConfig({
	site: 'https://azidoazideazide.github.io',
	base: '/go-worker-pool',
	output: 'static',
});
```

Write `src/lib/site-path.ts`:
```ts
/** Path under the GitHub Pages project-site base (/go-worker-pool/), keeping slashes aligned. */
export function sitePath(path = ''): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	const suffix = path.replace(/^\//, '');
	return suffix ? `${base}/${suffix}` : `${base}/`;
}
```

Write `processor/go.mod`:
```go
module github.com/azidoazideazide/go-worker-pool/processor

go 1.23
```

- [ ] **Step 3: Run verification for Task 1**

Run:
```bash
node -e "import fs from 'node:fs'; const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); const cfg = fs.readFileSync('astro.config.mjs', 'utf8'); const mod = fs.readFileSync('processor/go.mod', 'utf8'); if (pkg.name !== 'go-worker-pool') throw new Error('bad pkg.name'); if (!cfg.includes(\"base: '/go-worker-pool'\")) throw new Error('bad base'); if (!mod.includes('module github.com/azidoazideazide/go-worker-pool/processor')) throw new Error('bad go.mod'); console.log('PASS: Task 1 verified');"
```
Expected: `PASS: Task 1 verified`

- [ ] **Step 4: Commit Task 1**

```bash
git add package.json astro.config.mjs src/lib/site-path.ts processor/go.mod
git commit -m "chore: set base to /go-worker-pool and initialize processor/go.mod"
```

---

### Task 2: Glossary, ADR, Design Guidelines, README, and AGENTS

**Model:** `xai/grok-code-fast-1` (implementer) / `xai/grok-4` (reviewer)

**Files:**
- Modify: `GLOSSARY.md`
- Create: `docs/adr/0001-separate-site-and-program.md`
- Create: `docs/design-guidelines.md`
- Modify: `README.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: `/go-worker-pool` base path and `processor/go.mod` module path from Task 1
- Produces:
  - Complete domain vocabulary in `GLOSSARY.md` (`Motion`, `Preset`, `Theme` added)
  - Architecture Decision Record in `docs/adr/0001-separate-site-and-program.md`
  - 16-token Go light/dark color specification in `docs/design-guidelines.md`
  - Updated repository documentation in `README.md` and `AGENTS.md`

- [ ] **Step 1: Verify the new docs and glossary terms are not present yet**

Run:
```bash
node -e "import fs from 'node:fs'; if (!fs.existsSync('docs/design-guidelines.md') || !fs.existsSync('docs/adr/0001-separate-site-and-program.md')) { console.error('FAIL: design guidelines or ADR missing'); process.exit(1); }"
```
Expected: `FAIL: design guidelines or ADR missing` (exit code 1)

- [ ] **Step 2: Write `GLOSSARY.md`, `docs/adr/0001-separate-site-and-program.md`, `docs/design-guidelines.md`, `README.md`, and `AGENTS.md`**

Write `GLOSSARY.md`:
```markdown
# Worker pool

The public site teaches one Go worker pool. The site shows a picture of that pool. The program is the pool you run, and the site does not run the program.

## Language

**Worker pool**:
A fixed set of workers that take jobs from one channel.
_Avoid_: catalog, producer-consumer, cargo system

**Job**:
One piece of work that takes a set amount of time.
_Avoid_: cargo, task, entry

**Worker**:
One member of the pool. A worker takes one job at a time.
_Avoid_: dock, consumer

**Channel**:
The queue of jobs waiting for a worker.
_Avoid_: canal, queue

**Buffer**:
The maximum number of jobs that can wait in the channel.
_Avoid_: queue length, backlog

**Picture**:
The harbor drawing of the worker pool on the home page.
_Avoid_: visualizer, simulation, demo

**Program**:
The Go module in this repository that implements the worker pool.
_Avoid_: service, backend, code

**Lesson**:
One explanation page about the worker pool.
_Avoid_: entry, post, article

**Site**:
The published pages for the worker pool.
_Avoid_: repository, README, program

**Visitor**:
A person who reads the site and does not run the program.
_Avoid_: user, reader, audience

**Motion**:
The movement of jobs across the channel and progress bars inside the workers.
_Avoid_: animation loop, visualizer, simulation

**Preset**:
One named starting state of the worker pool in the picture, such as normal run, full buffer, or all workers idle.
_Avoid_: demo mode, sample scenario

**Theme**:
The light mode or dark mode Go color palette applied to the site and the picture.
_Avoid_: skin, mode switch
```

Write `docs/adr/0001-separate-site-and-program.md`:
```markdown
# ADR 0001: Keep the site and the program separate

## Status
Accepted

## Context
This repository holds a static Astro site on GitHub Pages and a Go program that implements a worker pool. A visitor opens the site in a browser. GitHub Pages serves only static files and cannot run a Go process.

## Decision
Keep the site at the repository root and place the Go program in `processor/`. The site draws a picture of the worker pool in the browser. The site never calls or runs the Go program. A lesson page may quote the Go program.

## Consequences
- GitHub Pages builds and serves the site without a server.
- You can write and run the Go program locally with `go run`.
- You must keep the picture and the Go program aligned manually as you add features.
```

Write `docs/design-guidelines.md`:
```markdown
# Design Guidelines: Go Worker Pool

This document defines the visual system, Go color tokens, layout rules, and accessibility standards for the site.

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
| `--go-blue` | Links, focus rings, and active control borders | `#007D9C` | `#5DC9E2` |
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

## 4. Accessibility and Motion Rules

- Interactive buttons, selects, and range controls must have a minimum hit target of `44px` by `44px`.
- Every interactive control must show a `2px solid var(--go-blue)` outline on `:focus-visible`.
- Readout numbers use `aria-live="polite"` so assistive technology announces preset and step changes.
- SVG groups use `data-slot`, `data-job`, `data-worker`, and `data-progress` attributes so scripts can move jobs with CSS `transform`.
- Respect `@media (prefers-reduced-motion: reduce)` by disabling smooth transitions when reduced motion is active.
```

Write `README.md`:
```markdown
# go-worker-pool

Static Astro lesson site and Go worker pool module.

Live site: https://azidoazideazide.github.io/go-worker-pool/

## Two parts in one repository

1. **Site (`/`)**: A static Astro site that shows a harbor chart picture of a Go worker pool on the home page and three lesson pages (`Setup`, `Design`, `Syntax`).
2. **Program (`processor/`)**: A standalone Go module (`github.com/azidoazideazide/go-worker-pool/processor`) that you run in a terminal.

The site and the program do not call each other. See `docs/adr/0001-separate-site-and-program.md`.

## Work on the site locally

    pnpm install
    pnpm run dev

The local dev server serves the site at:

http://localhost:4321/go-worker-pool/

`pnpm run build` compiles `src/` into `dist/`. `pnpm run preview` serves `dist/` locally.

## Work on the Go program locally

    cd processor
    go mod tidy

Add your worker pool program in `processor/` as you work through the lessons.

## Repository layout

    src/pages/              Home page and lesson route
    src/content/lessons/    Markdown files for Setup, Design, and Syntax
    src/components/         Header and harbor chart picture
    src/lib/                Base path helper and worker pool presets
    src/styles/             Go light and dark theme tokens and layout rules
    processor/              Standalone Go module for the worker pool
    docs/                   Design guidelines, ADR, and session notes
```

Write `AGENTS.md`:
```markdown
# Agent notes

This repository publishes a static lesson site about a Go worker pool to GitHub Pages for the account `azidoazideazide` and stores the companion Go module in `processor/`.

- The live URL is a project site: `https://azidoazideazide.github.io/go-worker-pool/`.
- Keep the repository public. On GitHub Free, a private repository cannot serve GitHub Pages.
- `astro.config.mjs` sets `site` to `https://azidoazideazide.github.io`, `base` to `/go-worker-pool`, and `output` to `static`.
- Build internal links and `public/` asset URLs with `sitePath()` from `src/lib/site-path.ts`. `import.meta.env.BASE_URL` has no trailing slash, so string-concatenating it drops the slash before the next segment.
- Leave the output static. Do not add a server adapter, API routes, or server rendering.
- Keep the site and the Go program (`processor/`) separate. The site must never import or call the Go program (`docs/adr/0001-separate-site-and-program.md`).
- Use the words defined in `GLOSSARY.md` across all labels, headings, and documentation.
- Follow the Go light and dark color tokens and accessibility rules in `docs/design-guidelines.md`.
- `.github/workflows/deploy.yml` builds the site and deploys the `dist/` artifact. Pages source is GitHub Actions.
- Do not commit secrets, `.env` files, or `node_modules`.
- Add client JavaScript only on the page or component that needs it.
```

- [ ] **Step 3: Run verification for Task 2**

Run:
```bash
node -e "import fs from 'node:fs'; const g = fs.readFileSync('GLOSSARY.md', 'utf8'); const adr = fs.readFileSync('docs/adr/0001-separate-site-and-program.md', 'utf8'); const dg = fs.readFileSync('docs/design-guidelines.md', 'utf8'); const rm = fs.readFileSync('README.md', 'utf8'); const ag = fs.readFileSync('AGENTS.md', 'utf8'); if (!g.includes('**Motion**:') || !g.includes('**Preset**:') || !g.includes('**Theme**:')) throw new Error('missing glossary terms'); if (!adr.includes('ADR 0001')) throw new Error('bad adr'); if (!dg.includes('--go-cyan') || !dg.includes('#00ADD8')) throw new Error('bad design guidelines'); if (!rm.includes('/go-worker-pool/')) throw new Error('bad readme'); if (!ag.includes('docs/design-guidelines.md')) throw new Error('bad agents.md'); console.log('PASS: Task 2 verified');"
```
Expected: `PASS: Task 2 verified`

- [ ] **Step 4: Commit Task 2**

```bash
git add GLOSSARY.md docs/adr/0001-separate-site-and-program.md docs/design-guidelines.md README.md AGENTS.md
git commit -m "docs: add glossary terms, ADR 0001, Go design guidelines, and updated README/AGENTS"
```

---

### Task 3: Go Theme Palette, Shared Layout, and Header

**Model:** `xai/grok-code-fast-1` (implementer) / `xai/grok-4` (reviewer)

**Files:**
- Modify: `src/styles/site.css`
- Modify: `src/layouts/Base.astro`
- Modify: `src/components/SiteHeader.astro`

**Interfaces:**
- Consumes:
  - `sitePath()` from `src/lib/site-path.ts`
  - 16 Go color tokens from `docs/design-guidelines.md`
- Produces:
  - `Base.astro` accepting `{ title: string; description: string; layout?: 'full' | 'lesson' }` and setting `html[data-theme]` before first paint
  - `SiteHeader.astro` rendering the `Worker pool` mark, links to `/go-worker-pool/`, `/go-worker-pool/lessons/setup/`, `/go-worker-pool/lessons/design/`, `/go-worker-pool/lessons/syntax/`, and a `#theme-toggle` button
  - `src/styles/site.css` styling both light and dark modes, the full-viewport first screen, the `42rem` lesson column, and the harbor chart elements

- [ ] **Step 1: Verify `src/styles/site.css` does not define the Go theme tokens yet**

Run:
```bash
node -e "import fs from 'node:fs'; const css = fs.readFileSync('src/styles/site.css', 'utf8'); if (!css.includes('--go-cyan')) { console.error('FAIL: --go-cyan missing in site.css'); process.exit(1); }"
```
Expected: `FAIL: --go-cyan missing in site.css` (exit code 1)

- [ ] **Step 2: Write `src/styles/site.css`, `src/layouts/Base.astro`, and `src/components/SiteHeader.astro`**

Write `src/styles/site.css`:
```css
:root,
html[data-theme='light'] {
	color-scheme: light;
	--bg-paper: #f4f8fa;
	--bg-panel: #ffffff;
	--bg-channel: #dceff5;
	--bg-slot: #edf7fa;
	--ink: #0f172a;
	--ink-muted: #475569;
	--line: #cbd5e1;
	--go-blue: #007d9c;
	--go-cyan: #00add8;
	--go-cyan-ink: #082f49;
	--job-cyan: #007d9c;
	--job-cyan-ink: #ffffff;
	--job-coral: #ce3262;
	--job-coral-ink: #ffffff;
	--job-amber: #b45309;
	--job-amber-ink: #ffffff;
	--worker-busy: #007d9c;
	--worker-idle: #64748b;
	--progress-track: #e2e8f0;
	--font-sans: 'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
	--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}

html[data-theme='dark'] {
	color-scheme: dark;
	--bg-paper: #0b131e;
	--bg-panel: #132030;
	--bg-channel: #0f293a;
	--bg-slot: #16354b;
	--ink: #f1f5f9;
	--ink-muted: #94a3b8;
	--line: #263b52;
	--go-blue: #5dc9e2;
	--go-cyan: #00add8;
	--go-cyan-ink: #082f49;
	--job-cyan: #00add8;
	--job-cyan-ink: #082f49;
	--job-coral: #f43f5e;
	--job-coral-ink: #082f49;
	--job-amber: #fddd00;
	--job-amber-ink: #0f172a;
	--worker-busy: #00add8;
	--worker-idle: #64748b;
	--progress-track: #1e293b;
}

* {
	box-sizing: border-box;
}

html,
body {
	margin: 0;
	padding: 0;
	min-height: 100%;
	font-family: var(--font-sans);
	font-size: 16px;
	line-height: 1.5;
	color: var(--ink);
	background-color: var(--bg-paper);
}

a {
	color: var(--go-blue);
	text-decoration: underline;
	text-underline-offset: 0.2em;
}

a:hover {
	text-decoration-thickness: 2px;
}

:focus-visible {
	outline: 2px solid var(--go-blue);
	outline-offset: 2px;
}

.site-header {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	padding: 0.75rem 1.5rem;
	background-color: var(--bg-panel);
	border-bottom: 1px solid var(--line);
}

.mark {
	font-family: var(--font-mono);
	font-weight: 700;
	font-size: 1.05rem;
	color: var(--ink);
	text-decoration: none;
	display: inline-flex;
	align-items: center;
	min-height: 44px;
}

.header-right {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.75rem;
}

.site-nav {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.5rem;
}

.site-nav a {
	display: inline-flex;
	align-items: center;
	min-height: 44px;
	padding: 0 0.65rem;
	font-weight: 500;
	text-decoration: none;
	border-radius: 4px;
}

.site-nav a:hover {
	background-color: var(--bg-slot);
}

.theme-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 44px;
	min-width: 44px;
	padding: 0 0.85rem;
	font-family: var(--font-mono);
	font-size: 0.85rem;
	font-weight: 600;
	color: var(--ink);
	background-color: var(--bg-paper);
	border: 1px solid var(--line);
	border-radius: 4px;
	cursor: pointer;
}

.theme-button:hover {
	border-color: var(--go-blue);
}

main.layout-full {
	display: flex;
	flex-direction: column;
	min-height: calc(100dvh - 61px);
	padding: 1rem 1.5rem;
	max-width: 1440px;
	margin: 0 auto;
	width: 100%;
}

main.layout-lesson {
	max-width: 42rem;
	margin: 0 auto;
	padding: 2.5rem 1.5rem 4rem;
}

h1 {
	font-size: 1.85rem;
	line-height: 1.2;
	margin: 0 0 1rem;
	color: var(--ink);
}

p,
li {
	color: var(--ink-muted);
}

code,
pre {
	font-family: var(--font-mono);
	font-size: 0.92em;
	color: var(--ink);
}

.pool-screen {
	display: flex;
	flex-direction: column;
	flex: 1;
	gap: 1rem;
	justify-content: space-between;
}

.picture-frame {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	background-color: var(--bg-panel);
	border: 1px solid var(--line);
	border-radius: 6px;
	padding: 1rem;
	min-height: 360px;
}

.harbor-svg {
	width: 100%;
	height: auto;
	max-height: 62dvh;
	display: block;
}

.instrument-bar {
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.85rem;
	background-color: var(--bg-panel);
	border: 1px solid var(--line);
	border-radius: 6px;
	padding: 0.85rem 1rem;
}

.readout-strip {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	padding-bottom: 0.65rem;
	border-bottom: 1px solid var(--line);
	font-family: var(--font-mono);
	font-size: 0.9rem;
}

.readout-metrics {
	display: flex;
	flex-wrap: wrap;
	gap: 1.25rem;
}

.readout-item strong {
	color: var(--go-blue);
}

.preset-group {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.preset-select {
	min-height: 44px;
	padding: 0 0.75rem;
	font-family: var(--font-mono);
	font-size: 0.85rem;
	color: var(--ink);
	background-color: var(--bg-paper);
	border: 1px solid var(--go-blue);
	border-radius: 4px;
	cursor: pointer;
}

.controls-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 1rem;
}

.control-field {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	min-height: 44px;
	font-family: var(--font-mono);
	font-size: 0.85rem;
	color: var(--ink-muted);
}

.control-field input[type='range'] {
	min-height: 44px;
	accent-color: var(--go-cyan);
}

.control-button {
	min-height: 44px;
	min-width: 72px;
	padding: 0 0.9rem;
	font-family: var(--font-mono);
	font-size: 0.85rem;
	font-weight: 600;
	color: var(--ink-muted);
	background-color: var(--bg-paper);
	border: 1px solid var(--line);
	border-radius: 4px;
}

.control-button:disabled,
.control-field input:disabled {
	cursor: not-allowed;
	opacity: 0.7;
}

@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
		scroll-behavior: auto !important;
	}
}
```

Write `src/layouts/Base.astro`:
```astro
---
import '../styles/site.css';
import SiteHeader from '../components/SiteHeader.astro';
import { sitePath } from '../lib/site-path';

interface Props {
	title: string;
	description: string;
	layout?: 'full' | 'lesson';
}

const { title, description, layout = 'lesson' } = Astro.props;
const mainClass = layout === 'full' ? 'layout-full' : 'layout-lesson';
---

<html lang="en" data-theme="light">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" type="image/svg+xml" href={sitePath('favicon.svg')} />
		<link rel="icon" href={sitePath('favicon.ico')} />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="description" content={description} />
		<meta name="generator" content={Astro.generator} />
		<title>{title}</title>
		<script is:inline>
			(function () {
				const saved = localStorage.getItem('theme');
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				const theme = saved === 'dark' || saved === 'light' ? saved : prefersDark ? 'dark' : 'light';
				document.documentElement.setAttribute('data-theme', theme);
			})();
		</script>
	</head>
	<body>
		<SiteHeader />
		<main class={mainClass}>
			<slot />
		</main>
	</body>
</html>
```

Write `src/components/SiteHeader.astro`:
```astro
---
import { sitePath } from '../lib/site-path';

const links = [
	{ href: sitePath(), label: 'Picture' },
	{ href: sitePath('lessons/setup/'), label: 'Setup' },
	{ href: sitePath('lessons/design/'), label: 'Design' },
	{ href: sitePath('lessons/syntax/'), label: 'Syntax' },
];
---

<header class="site-header">
	<a class="mark" href={sitePath()}>Worker pool</a>
	<div class="header-right">
		<nav class="site-nav" aria-label="Lesson navigation">
			{links.map((link) => <a href={link.href}>{link.label}</a>)}
		</nav>
		<button
			type="button"
			id="theme-toggle"
			class="theme-button"
			aria-label="Switch color theme"
		>
			Theme
		</button>
	</div>
</header>

<script>
	const button = document.getElementById('theme-toggle');
	const syncLabel = () => {
		if (!button) return;
		const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
		button.textContent = current === 'dark' ? 'Theme: Dark' : 'Theme: Light';
	};
	syncLabel();
	button?.addEventListener('click', () => {
		const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
		const next = current === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', next);
		localStorage.setItem('theme', next);
		syncLabel();
	});
</script>
```

- [ ] **Step 3: Run verification for Task 3**

Run:
```bash
node -e "import fs from 'node:fs'; const css = fs.readFileSync('src/styles/site.css', 'utf8'); const base = fs.readFileSync('src/layouts/Base.astro', 'utf8'); const hdr = fs.readFileSync('src/components/SiteHeader.astro', 'utf8'); if (!css.includes(\"html[data-theme='dark']\") || !css.includes('--go-cyan: #00add8')) throw new Error('missing theme tokens'); if (!base.includes('data-theme')) throw new Error('missing data-theme in Base'); if (!hdr.includes('Worker pool') || !hdr.includes('lessons/setup/')) throw new Error('missing links in SiteHeader'); console.log('PASS: Task 3 verified');"
```
Expected: `PASS: Task 3 verified`

- [ ] **Step 4: Commit Task 3**

```bash
git add src/styles/site.css src/layouts/Base.astro src/components/SiteHeader.astro
git commit -m "feat: add Go light/dark theme tokens, full/lesson layouts, and header"
```

---

### Task 4: Lesson Content Collection and Dynamic Route

**Model:** `xai/grok-code-fast-1` (implementer) / `xai/grok-4` (reviewer)

**Files:**
- Delete: `src/pages/about.astro`
- Create: `src/content.config.ts`
- Create: `src/content/lessons/setup.md`
- Create: `src/content/lessons/design.md`
- Create: `src/content/lessons/syntax.md`
- Create: `src/pages/lessons/[slug].astro`

**Interfaces:**
- Consumes: `Base.astro` from Task 3
- Produces:
  - `lessons` collection in `src/content.config.ts` with schema `{ title: string; description: string; order: number }`
  - Static routes `/go-worker-pool/lessons/setup/`, `/go-worker-pool/lessons/design/`, and `/go-worker-pool/lessons/syntax/`

- [ ] **Step 1: Verify `src/pages/about.astro` still exists and `src/content.config.ts` does not exist**

Run:
```bash
node -e "import fs from 'node:fs'; if (fs.existsSync('src/pages/about.astro') || !fs.existsSync('src/content.config.ts')) { console.error('FAIL: about.astro still exists or content.config.ts missing'); process.exit(1); }"
```
Expected: `FAIL: about.astro still exists or content.config.ts missing` (exit code 1)

- [ ] **Step 2: Delete `src/pages/about.astro` and create the `lessons` collection and route**

Delete `src/pages/about.astro`:
```bash
rm -f src/pages/about.astro
```

Write `src/content.config.ts`:
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lessons = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/lessons' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		order: z.number(),
	}),
});

export const collections = { lessons };
```

Write `src/content/lessons/setup.md`:
```markdown
---
title: Setup
description: Minimal Go module and worker pool setup.
order: 1
---
```

Write `src/content/lessons/design.md`:
```markdown
---
title: Design
description: How the picture maps to the channel, the buffer, the jobs, and the workers.
order: 2
---
```

Write `src/content/lessons/syntax.md`:
```markdown
---
title: Syntax
description: Go syntax for goroutines, channels, and wait groups in a worker pool.
order: 3
---
```

Write `src/pages/lessons/[slug].astro`:
```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';

export async function getStaticPaths() {
	const lessons = await getCollection('lessons');
	return lessons.map((lesson) => ({
		params: { slug: lesson.id },
		props: { lesson },
	}));
}

const { lesson } = Astro.props;
const { Content } = await render(lesson);
---

<Base title={`${lesson.data.title} — Worker pool`} description={lesson.data.description} layout="lesson">
	<article>
		<h1>{lesson.data.title}</h1>
		<Content />
	</article>
</Base>
```

- [ ] **Step 3: Run verification for Task 4**

Run:
```bash
node -e "import fs from 'node:fs'; if (fs.existsSync('src/pages/about.astro')) throw new Error('about.astro still exists'); for (const f of ['src/content.config.ts', 'src/content/lessons/setup.md', 'src/content/lessons/design.md', 'src/content/lessons/syntax.md', 'src/pages/lessons/[slug].astro']) { if (!fs.existsSync(f)) throw new Error('missing ' + f); } console.log('PASS: Task 4 verified');"
```
Expected: `PASS: Task 4 verified`

- [ ] **Step 4: Commit Task 4**

```bash
git add -A src/pages/about.astro src/content.config.ts src/content/lessons/ src/pages/lessons/
git commit -m "feat: replace about page with Setup, Design, and Syntax lesson collection"
```

---

### Task 5: Worker Pool Presets, Harbor Chart Picture, and First Screen

**Model:** `xai/grok-code-fast-1` (implementer) / `xai/grok-4` (reviewer)

**Files:**
- Create: `src/lib/pool-presets.ts`
- Create: `src/components/PoolPicture.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes:
  - `Base.astro` (`layout="full"`) and Go CSS custom properties from Task 3
- Produces:
  - `POOL_PRESETS` and `PoolState` in `src/lib/pool-presets.ts` (`normal`, `full`, `idle`)
  - `src/components/PoolPicture.astro` with SVG groups (`data-slot`, `data-job`, `data-worker`, `data-progress`), readout strip (`aria-live="polite"`), interactive preset selector (`#preset-select`), and five inert controls (`Workers`, `Buffer`, `Job time`, `Step`, `Reset`)
  - Updated `src/pages/index.astro` rendering the first screen

- [ ] **Step 1: Verify `src/lib/pool-presets.ts` and `src/components/PoolPicture.astro` do not exist yet**

Run:
```bash
node -e "import fs from 'node:fs'; if (!fs.existsSync('src/lib/pool-presets.ts') || !fs.existsSync('src/components/PoolPicture.astro')) { console.error('FAIL: pool-presets or PoolPicture missing'); process.exit(1); }"
```
Expected: `FAIL: pool-presets or PoolPicture missing` (exit code 1)

- [ ] **Step 2: Write `src/lib/pool-presets.ts`, `src/components/PoolPicture.astro`, and `src/pages/index.astro`**

Write `src/lib/pool-presets.ts`:
```ts
export type JobTone = 'cyan' | 'coral' | 'amber';

export interface WaitingJob {
	id: string;
	slot: number;
	durationSec: number;
	tone: JobTone;
}

export interface WorkerSlot {
	id: number;
	status: 'BUSY' | 'IDLE';
	jobId: string | null;
	progressPct: number;
	tone: JobTone;
}

export interface PoolState {
	key: 'normal' | 'full' | 'idle';
	label: string;
	bufferCapacity: number;
	workerCount: number;
	jobTimeSec: number;
	completedJobs: number;
	waitingJobs: WaitingJob[];
	workers: WorkerSlot[];
}

export const POOL_PRESETS: Record<PoolState['key'], PoolState> = {
	normal: {
		key: 'normal',
		label: 'Normal run',
		bufferCapacity: 6,
		workerCount: 3,
		jobTimeSec: 4,
		completedJobs: 12,
		waitingJobs: [
			{ id: 'Job 104', slot: 0, durationSec: 4, tone: 'cyan' },
			{ id: 'Job 105', slot: 1, durationSec: 3, tone: 'coral' },
			{ id: 'Job 106', slot: 2, durationSec: 5, tone: 'amber' },
		],
		workers: [
			{ id: 1, status: 'BUSY', jobId: 'Job 103', progressPct: 50, tone: 'cyan' },
			{ id: 2, status: 'IDLE', jobId: null, progressPct: 0, tone: 'cyan' },
			{ id: 3, status: 'IDLE', jobId: null, progressPct: 0, tone: 'cyan' },
		],
	},
	full: {
		key: 'full',
		label: 'Full buffer',
		bufferCapacity: 6,
		workerCount: 3,
		jobTimeSec: 4,
		completedJobs: 18,
		waitingJobs: [
			{ id: 'Job 204', slot: 0, durationSec: 4, tone: 'cyan' },
			{ id: 'Job 205', slot: 1, durationSec: 5, tone: 'coral' },
			{ id: 'Job 206', slot: 2, durationSec: 3, tone: 'amber' },
			{ id: 'Job 207', slot: 3, durationSec: 4, tone: 'cyan' },
			{ id: 'Job 208', slot: 4, durationSec: 6, tone: 'coral' },
			{ id: 'Job 209', slot: 5, durationSec: 3, tone: 'amber' },
		],
		workers: [
			{ id: 1, status: 'BUSY', jobId: 'Job 201', progressPct: 80, tone: 'cyan' },
			{ id: 2, status: 'BUSY', jobId: 'Job 202', progressPct: 45, tone: 'coral' },
			{ id: 3, status: 'BUSY', jobId: 'Job 203', progressPct: 25, tone: 'amber' },
		],
	},
	idle: {
		key: 'idle',
		label: 'All workers idle',
		bufferCapacity: 6,
		workerCount: 3,
		jobTimeSec: 4,
		completedJobs: 24,
		waitingJobs: [],
		workers: [
			{ id: 1, status: 'IDLE', jobId: null, progressPct: 0, tone: 'cyan' },
			{ id: 2, status: 'IDLE', jobId: null, progressPct: 0, tone: 'cyan' },
			{ id: 3, status: 'IDLE', jobId: null, progressPct: 0, tone: 'cyan' },
		],
	},
};
```

Write `src/components/PoolPicture.astro`:
```astro
---
import { POOL_PRESETS } from '../lib/pool-presets';

const initial = POOL_PRESETS.normal;
const slots = [0, 1, 2, 3, 4, 5];

const toneFill = (tone: 'cyan' | 'coral' | 'amber') => {
	if (tone === 'coral') return 'var(--job-coral)';
	if (tone === 'amber') return 'var(--job-amber)';
	return 'var(--job-cyan)';
};

const toneInk = (tone: 'cyan' | 'coral' | 'amber') => {
	if (tone === 'coral') return 'var(--job-coral-ink)';
	if (tone === 'amber') return 'var(--job-amber-ink)';
	return 'var(--job-cyan-ink)';
};
---

<section class="pool-screen" aria-label="Worker pool harbor chart">
	<div class="picture-frame" data-visual="harbor-chart">
		<svg
			class="harbor-svg"
			viewBox="0 0 1120 460"
			role="img"
			aria-label="Harbor chart picture of one Go worker pool showing the channel, six buffer slots, waiting jobs, and three workers."
		>
			<!-- Harbor chart border and grid -->
			<rect x="8" y="8" width="1104" height="444" rx="6" fill="var(--bg-paper)" stroke="var(--line)" stroke-width="1.5" />
			<text x="28" y="38" fill="var(--ink)" font-family="var(--font-mono)" font-size="14" font-weight="700">
				WORKER POOL HARBOR CHART // CHANNEL BUFFER CAP = 6 // WORKERS = 3
			</text>

			<!-- Channel water -->
			<g data-channel="jobs">
				<rect x="28" y="64" width="684" height="360" rx="6" fill="var(--bg-channel)" stroke="var(--go-blue)" stroke-width="1.5" />
				<text x="44" y="92" fill="var(--ink)" font-family="var(--font-mono)" font-size="13" font-weight="700">
					Channel (buffered job channel: chan Job)
				</text>
				<text x="44" y="112" fill="var(--ink-muted)" font-family="var(--font-mono)" font-size="11">
					Jobs enter on the left and move right toward the first free worker
				</text>

				<!-- 6 Buffer slots -->
				{
					slots.map((slotIndex) => {
						const x = 44 + slotIndex * 108;
						const job = initial.waitingJobs.find((j) => j.slot === slotIndex);
						return (
							<g data-slot={slotIndex} transform={`translate(${x}, 148)`}>
								<rect
									x="0"
									y="0"
									width="96"
									height="210"
									rx="4"
									fill="var(--bg-slot)"
									stroke="var(--line)"
									stroke-width="1.5"
									stroke-dasharray="4 3"
								/>
								<text x="10" y="22" fill="var(--ink-muted)" font-family="var(--font-mono)" font-size="11">
									{`Buffer [${slotIndex}]`}
								</text>
								<g
									data-job={slotIndex}
									style={job ? 'opacity: 1;' : 'opacity: 0;'}
									transform="translate(8, 38)"
								>
									<rect
										data-job-rect={slotIndex}
										x="0"
										y="0"
										width="80"
										height="156"
										rx="4"
										fill={job ? toneFill(job.tone) : 'var(--job-cyan)'}
										stroke="var(--ink)"
										stroke-width="1.2"
									/>
									<text
										data-job-id={slotIndex}
										x="10"
										y="34"
										fill={job ? toneInk(job.tone) : 'var(--job-cyan-ink)'}
										font-family="var(--font-mono)"
										font-size="12"
										font-weight="700"
									>
										{job ? job.id : ''}
									</text>
									<text
										data-job-time={slotIndex}
										x="10"
										y="56"
										fill={job ? toneInk(job.tone) : 'var(--job-cyan-ink)'}
										font-family="var(--font-mono)"
										font-size="11"
									>
										{job ? `${job.durationSec}s work` : ''}
									</text>
								</g>
							</g>
						);
					})
				}
			</g>

			<!-- Dispatch connector arrows -->
			<line x1="712" y1="134" x2="748" y2="134" stroke="var(--go-blue)" stroke-width="2" />
			<line x1="712" y1="244" x2="748" y2="244" stroke="var(--go-blue)" stroke-width="2" />
			<line x1="712" y1="354" x2="748" y2="354" stroke="var(--go-blue)" stroke-width="2" />

			<!-- 3 Workers -->
			{
				initial.workers.map((worker, idx) => {
					const y = 84 + idx * 110;
					const isBusy = worker.status === 'BUSY';
					const barWidth = Math.round((worker.progressPct / 100) * 304);
					return (
						<g data-worker={worker.id} transform={`translate(748, ${y})`}>
							<rect
								data-worker-card={worker.id}
								x="0"
								y="0"
								width="340"
								height="96"
								rx="5"
								fill="var(--bg-panel)"
								stroke={isBusy ? 'var(--worker-busy)' : 'var(--line)'}
								stroke-width={isBusy ? '2' : '1.5'}
							/>
							<text x="16" y="26" fill="var(--ink)" font-family="var(--font-mono)" font-size="13" font-weight="700">
								{`Worker ${worker.id}`}
							</text>
							<text
								data-worker-status={worker.id}
								x="264"
								y="26"
								fill={isBusy ? 'var(--worker-busy)' : 'var(--worker-idle)'}
								font-family="var(--font-mono)"
								font-size="12"
								font-weight="700"
							>
								{worker.status}
							</text>
							<text
								data-worker-job={worker.id}
								x="16"
								y="50"
								fill="var(--ink-muted)"
								font-family="var(--font-mono)"
								font-size="12"
							>
								{worker.jobId ? `${worker.jobId} (${worker.progressPct}%)` : 'Waiting for job from channel'}
							</text>
							<rect
								x="16"
								y="64"
								width="304"
								height="14"
								rx="3"
								fill="var(--progress-track)"
								stroke="var(--line)"
								stroke-width="1"
							/>
							<rect
								data-progress={worker.id}
								x="16"
								y="64"
								width={barWidth}
								height="14"
								rx="3"
								fill="var(--go-cyan)"
							/>
						</g>
					);
				})
			}
		</svg>
	</div>

	<div class="instrument-bar" aria-label="Worker pool controls and readout">
		<div class="readout-strip" aria-live="polite">
			<div class="readout-metrics">
				<span class="readout-item">
					Buffer: <strong id="readout-buffer">{`${initial.waitingJobs.length} / ${initial.bufferCapacity}`}</strong>
				</span>
				<span class="readout-item">
					Active workers: <strong id="readout-workers">{`${initial.workers.filter((w) => w.status === 'BUSY').length} / ${initial.workerCount}`}</strong>
				</span>
				<span class="readout-item">
					Completed jobs: <strong id="readout-completed">{initial.completedJobs}</strong>
				</span>
			</div>

			<div class="preset-group">
				<label for="preset-select">Preset:</label>
				<select id="preset-select" class="preset-select">
					<option value="normal" selected>Normal run</option>
					<option value="full">Full buffer</option>
					<option value="idle">All workers idle</option>
				</select>
			</div>
		</div>

		<div class="controls-row">
			<label class="control-field" for="ctrl-workers">
				<span>Workers</span>
				<input id="ctrl-workers" type="range" min="1" max="8" value="3" disabled />
				<output for="ctrl-workers">3</output>
			</label>

			<label class="control-field" for="ctrl-buffer">
				<span>Buffer</span>
				<input id="ctrl-buffer" type="range" min="1" max="6" value="6" disabled />
				<output for="ctrl-buffer">6</output>
			</label>

			<label class="control-field" for="ctrl-job-time">
				<span>Job time</span>
				<input id="ctrl-job-time" type="range" min="1" max="10" value="4" disabled />
				<output for="ctrl-job-time">4s</output>
			</label>

			<button type="button" class="control-button" id="ctrl-step" disabled>Step</button>
			<button type="button" class="control-button" id="ctrl-reset" disabled>Reset</button>
		</div>
	</div>
</section>

<script>
	import { POOL_PRESETS, type JobTone, type PoolState } from '../lib/pool-presets';

	const toneFill = (tone: JobTone) => {
		if (tone === 'coral') return 'var(--job-coral)';
		if (tone === 'amber') return 'var(--job-amber)';
		return 'var(--job-cyan)';
	};

	const toneInk = (tone: JobTone) => {
		if (tone === 'coral') return 'var(--job-coral-ink)';
		if (tone === 'amber') return 'var(--job-amber-ink)';
		return 'var(--job-cyan-ink)';
	};

	const renderPreset = (state: PoolState) => {
		const bufferEl = document.getElementById('readout-buffer');
		const workersEl = document.getElementById('readout-workers');
		const completedEl = document.getElementById('readout-completed');

		if (bufferEl) bufferEl.textContent = `${state.waitingJobs.length} / ${state.bufferCapacity}`;
		if (workersEl) {
			const busy = state.workers.filter((w) => w.status === 'BUSY').length;
			workersEl.textContent = `${busy} / ${state.workerCount}`;
		}
		if (completedEl) completedEl.textContent = String(state.completedJobs);

		for (let slot = 0; slot < 6; slot++) {
			const jobGroup = document.querySelector<SVGGElement>(`[data-job="${slot}"]`);
			const jobRect = document.querySelector<SVGRectElement>(`[data-job-rect="${slot}"]`);
			const jobId = document.querySelector<SVGTextElement>(`[data-job-id="${slot}"]`);
			const jobTime = document.querySelector<SVGTextElement>(`[data-job-time="${slot}"]`);
			const job = state.waitingJobs.find((j) => j.slot === slot);

			if (!jobGroup || !jobRect || !jobId || !jobTime) continue;

			if (job) {
				jobGroup.style.opacity = '1';
				jobRect.setAttribute('fill', toneFill(job.tone));
				jobId.setAttribute('fill', toneInk(job.tone));
				jobTime.setAttribute('fill', toneInk(job.tone));
				jobId.textContent = job.id;
				jobTime.textContent = `${job.durationSec}s work`;
			} else {
				jobGroup.style.opacity = '0';
				jobId.textContent = '';
				jobTime.textContent = '';
			}
		}

		for (const worker of state.workers) {
			const card = document.querySelector<SVGRectElement>(`[data-worker-card="${worker.id}"]`);
			const status = document.querySelector<SVGTextElement>(`[data-worker-status="${worker.id}"]`);
			const jobLabel = document.querySelector<SVGTextElement>(`[data-worker-job="${worker.id}"]`);
			const progress = document.querySelector<SVGRectElement>(`[data-progress="${worker.id}"]`);
			const isBusy = worker.status === 'BUSY';

			if (card) {
				card.setAttribute('stroke', isBusy ? 'var(--worker-busy)' : 'var(--line)');
				card.setAttribute('stroke-width', isBusy ? '2' : '1.5');
			}
			if (status) {
				status.textContent = worker.status;
				status.setAttribute('fill', isBusy ? 'var(--worker-busy)' : 'var(--worker-idle)');
			}
			if (jobLabel) {
				jobLabel.textContent = worker.jobId
					? `${worker.jobId} (${worker.progressPct}%)`
					: 'Waiting for job from channel';
			}
			if (progress) {
				const width = Math.round((worker.progressPct / 100) * 304);
				progress.setAttribute('width', String(width));
			}
		}
	};

	const select = document.getElementById('preset-select') as HTMLSelectElement | null;
	select?.addEventListener('change', () => {
		const key = select.value as PoolState['key'];
		const preset = POOL_PRESETS[key];
		if (preset) renderPreset(preset);
	});
</script>
```

Write `src/pages/index.astro`:
```astro
---
import Base from '../layouts/Base.astro';
import PoolPicture from '../components/PoolPicture.astro';
---

<Base
	title="Worker pool"
	description="Harbor chart picture and lessons for one Go worker pool."
	layout="full"
>
	<PoolPicture />
</Base>
```

- [ ] **Step 3: Run verification for Task 5**

Run:
```bash
node -e "import fs from 'node:fs'; const pic = fs.readFileSync('src/components/PoolPicture.astro', 'utf8'); const idx = fs.readFileSync('src/pages/index.astro', 'utf8'); for (const attr of ['data-slot', 'data-job', 'data-worker', 'data-progress', 'ctrl-workers', 'ctrl-buffer', 'ctrl-job-time', 'ctrl-step', 'ctrl-reset', 'preset-select']) { if (!pic.includes(attr)) throw new Error('missing ' + attr); } if (!idx.includes('<PoolPicture />')) throw new Error('index.astro does not render PoolPicture'); console.log('PASS: Task 5 verified');"
```
Expected: `PASS: Task 5 verified`

- [ ] **Step 4: Commit Task 5**

```bash
git add src/lib/pool-presets.ts src/components/PoolPicture.astro src/pages/index.astro
git commit -m "feat: add harbor chart picture, worker pool presets, and first screen controls"
```

---

### Task 6: Full Static Build Verification and Link/Theme Audit

**Model:** `xai/grok-4` (implementer and reviewer)

**Files:**
- Test: `dist/index.html`
- Test: `dist/lessons/setup/index.html`
- Test: `dist/lessons/design/index.html`
- Test: `dist/lessons/syntax/index.html`

**Interfaces:**
- Consumes: All deliverables from Tasks 1 through 5
- Produces: Verified static build in `dist/` with zero broken base links, zero forbidden glossary words, and zero `.go` files in `processor/`

- [ ] **Step 1: Run `pnpm run build` to compile the static site**

Run:
```bash
pnpm run build
```
Expected: Astro builds `dist/index.html`, `dist/lessons/setup/index.html`, `dist/lessons/design/index.html`, and `dist/lessons/syntax/index.html` with exit code 0.

- [ ] **Step 2: Run the automated audit on `dist/` and `processor/`**

Run:
```bash
node -e "import fs from 'node:fs';
const mustExist = [
  'dist/index.html',
  'dist/lessons/setup/index.html',
  'dist/lessons/design/index.html',
  'dist/lessons/syntax/index.html',
  'processor/go.mod'
];
for (const p of mustExist) {
  if (!fs.existsSync(p)) throw new Error('Missing expected file: ' + p);
}
if (fs.existsSync('dist/about/index.html')) {
  throw new Error('dist/about/index.html must not exist');
}
const procFiles = fs.readdirSync('processor');
if (procFiles.some((f) => f.endsWith('.go'))) {
  throw new Error('processor/ must not contain .go files in the first build');
}
const homeHtml = fs.readFileSync('dist/index.html', 'utf8');
for (const required of [
  '/go-worker-pool/lessons/setup/',
  '/go-worker-pool/lessons/design/',
  '/go-worker-pool/lessons/syntax/',
  'data-slot=\"0\"',
  'data-worker=\"1\"',
  'data-progress=\"1\"',
  'id=\"preset-select\"',
  'id=\"theme-toggle\"'
]) {
  if (!homeHtml.includes(required)) {
    throw new Error('dist/index.html missing required snippet: ' + required);
  }
}
console.log('PASS: Task 6 full build and spec audit verified');"
```
Expected: `PASS: Task 6 full build and spec audit verified`
