# Tutorial Content, Progressive Navbar, and Mermaid Diagrams Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a modular system-design tutorial and four token-styled Mermaid diagrams to the Go Worker Pool site, reorder the navbar into a two-stage learning curve (`Overview` -> `Concepts` -> `Resilience` -> `Go Syntax` -> `Build It`), and integrate practical engineering lessons inspired by `ConcurrencyWorkshop`.

**Architecture:** Keep `<PoolPicture />` at the top of `src/pages/index.astro` so the animation stays in the first view (above the fold), and place a modular, data-driven `<HomeTutorial />` component underneath it. Render all four Mermaid diagrams via a reusable `<MermaidDiagram />` Astro component that draws responsive SVG schematics using CSS custom properties from `src/styles/tokens.css` alongside a collapsible raw Mermaid syntax drawer, requiring zero external runtime dependencies.

**Tech Stack:** Astro 7 (static output), TypeScript, CSS Custom Properties (`src/styles/tokens.css`), Markdown Content Collections.

## Global Constraints

- Never write `#` followed by 3 to 8 hex characters anywhere in `src/` outside `src/styles/tokens.css` (including comments, SVGs, and Markdown). Write `Job 104` in static text.
- Do not introduce new npm dependencies.
- Keep `<PoolPicture />` in the first view on the home page; keep `src/lib/pool-engine.ts` free of DOM access.
- Use `sitePath()` from `src/lib/site-path.ts` for all internal links.
- Use the hybrid ASD-STE100 style: STE100-inspired plain English for conceptual introductions and strict ASD-STE100 for UI labels, diagram captions, tables, and checklists.
- Run `pnpm check:tokens` and `pnpm build` after changes; ensure zero horizontal scroll at `390px`, `768px`, `1024px`, and `1440px`.

---

### Task 1: Update Domain Glossary and Design Documentation

**Files:**
- Modify: `GLOSSARY.md`
- Modify: `DESIGN.md`
- Modify: `docs/design-guidelines.md`

**Interfaces:**
- Produces: Approved glossary terms (`Overview`, `Concepts`, `Sequential`, `Unbounded`) and design rules for `<HomeTutorial />` and `<MermaidDiagram />`.

- [ ] **Step 1: Add the new tutorial and navigation words to `GLOSSARY.md`**

Add `Sequential`, `Unbounded`, `Overview`, and `Concepts` under the appropriate sections in `GLOSSARY.md`.

- [ ] **Step 2: Update `DESIGN.md` and `docs/design-guidelines.md`**

Update the home page layout description to note that `<PoolPicture />` occupies the first screen (above the fold) and `<HomeTutorial />` sits below the controls as a modular tutorial showcase, and document `.mermaid-figure` token rules.

- [ ] **Step 3: Verify token check**

Run: `pnpm check:tokens`
Expected: `PASS: All styles use tokens from src/styles/tokens.css`

- [ ] **Step 4: Commit**

```bash
git add GLOSSARY.md DESIGN.md docs/design-guidelines.md
git commit -m "docs: update glossary and design guidelines for tutorial and diagrams"
```

---

### Task 2: Update Content Schema, Navbar Links (Combo 1), and Lesson Template

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/components/SiteHeader.astro`
- Modify: `src/pages/lessons/[slug].astro`

**Interfaces:**
- Consumes: `sitePath()` from `src/lib/site-path.ts`
- Produces: Updated `lessons` schema with `stage?: string` and `diagrams?: string[]`, updated 5-item navbar (`Overview`, `Concepts`, `Resilience`, `Go Syntax`, `Build It`).

- [ ] **Step 1: Update `src/content.config.ts` to support `stage` metadata**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lessons = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/lessons' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		order: z.number(),
		stage: z.string().optional(),
	}),
});

export const collections = { lessons };
```

- [ ] **Step 2: Update `src/components/SiteHeader.astro` with Combo 1 navbar links**

```ts
const links = [
	{ href: sitePath(), label: 'Overview' },
	{ href: sitePath('lessons/design/'), label: 'Concepts' },
	{ href: sitePath('lessons/resilience/'), label: 'Resilience' },
	{ href: sitePath('lessons/syntax/'), label: 'Go Syntax' },
	{ href: sitePath('lessons/setup/'), label: 'Build It' },
];
```

- [ ] **Step 3: Update `pnpm check:tokens` to ensure zero issues**

Run: `pnpm check:tokens`
Expected: `PASS`

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/components/SiteHeader.astro
git commit -m "feat(nav): update navbar to Combo 1 progression and add lesson stage field"
```

---

### Task 3: Build the Token-Styled `<MermaidDiagram />` Component and Styles

**Files:**
- Create: `src/components/MermaidDiagram.astro`
- Modify: `src/styles/site.css`
- Modify: `src/pages/lessons/[slug].astro`

**Interfaces:**
- Produces: `src/components/MermaidDiagram.astro` accepting `id: 'comparison' | 'pipeline' | 'states' | 'resilience'`, optional `title?: string`, and `caption?: string`.

- [ ] **Step 1: Create `src/components/MermaidDiagram.astro`**

Build the four responsive SVG schematics (`comparison`, `pipeline`, `states`, `resilience`) using only semantic CSS variables from `src/styles/tokens.css`, paired with a collapsible `<details class="diagram-source">` containing the exact ```` ```mermaid ```` code.

- [ ] **Step 2: Add diagram and lesson enhancement styles in `src/styles/site.css`**

Add `.mermaid-figure`, `.mermaid-canvas`, `.mermaid-svg`, `.diagram-source`, and responsive rules in `src/styles/site.css`.

- [ ] **Step 3: Wire `<MermaidDiagram />` into `src/pages/lessons/[slug].astro`**

Render the lesson's stage kicker (`Lesson ${lesson.data.order} · ${lesson.data.stage}`), update the home pager label to `Overview`, and mount `<MermaidDiagram />` templates so any ```` ```mermaid ```` block in a lesson markdown file is upgraded in-place into the full themed diagram + collapsible Mermaid source drawer.

- [ ] **Step 4: Verify `pnpm check:tokens` and `pnpm build`**

Run: `pnpm check:tokens && pnpm build`
Expected: Both pass with zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/MermaidDiagram.astro src/pages/lessons/[slug].astro src/styles/site.css
git commit -m "feat(diagrams): add token-styled MermaidDiagram component and markdown upgrade"
```

---

### Task 4: Build the Modular Home Page Tutorial (`HomeTutorial.astro`)

**Files:**
- Create: `src/components/HomeTutorial.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/site.css`

**Interfaces:**
- Consumes: `src/components/MermaidDiagram.astro`, `sitePath()` from `src/lib/site-path.ts`
- Produces: Modular `<HomeTutorial />` below `<PoolPicture />` on the home page, with interactive preset trigger buttons (`data-try-preset`).

- [ ] **Step 1: Create `src/components/HomeTutorial.astro`**

Include three modular, data-driven sections:
1. **Why a Worker Pool Matters**: Plain-English intro + 3-card comparison (**Sequential**, **Unbounded**, **Worker Pool**) + `<MermaidDiagram id="comparison" />` + the 4 job types (`EMAIL`, `WEBHOOK`, `IMG`, `SYNC`) mapped to I/O-bound, CPU-bound, and rate-limited work.
2. **How to Read the 4 Zones**: 4 cards mapping `01 Producer`, `02 Channel`, `03 Workers`, and `04 Results` from the conveyor-belt analogy to Go code.
3. **Try 4 Real Scenarios & Learning Path**: 4 interactive preset buttons (`data-try-preset`) that select the preset in `<PoolPicture />`, scroll smoothly to the stage, and start or step the pool, followed by the 2-stage lesson cards (`Stage 1: System Design` and `Stage 2: Go Engineering`).

- [ ] **Step 2: Add `<HomeTutorial />` to `src/pages/index.astro` below `<PoolPicture />`**

Keep `<PoolPicture />` first so the interactive animation stays in the first view (above the fold).

- [ ] **Step 3: Add modular CSS layout rules for `.home-tutorial` in `src/styles/site.css`**

Use CSS Grid and container-friendly responsive rules so layout adjustments require minimal changes and zero horizontal overflow occurs at `390px`, `768px`, `1024px`, or `1440px`.

- [ ] **Step 4: Verify `pnpm check:tokens` and `pnpm build`**

Run: `pnpm check:tokens && pnpm build`
Expected: Both pass with zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/HomeTutorial.astro src/pages/index.astro src/styles/site.css
git commit -m "feat(home): add modular system-design tutorial below interactive pool"
```

---

### Task 5: Rewrite the 4 Lessons with Progressive Difficulty, Mermaid Diagrams, and `ConcurrencyWorkshop` Patterns

**Files:**
- Modify: `src/content/lessons/design.md`
- Modify: `src/content/lessons/resilience.md`
- Modify: `src/content/lessons/syntax.md`
- Modify: `src/content/lessons/setup.md`

**Interfaces:**
- Consumes: `MermaidDiagram` upgrade in `src/pages/lessons/[slug].astro`
- Produces: Complete 4-lesson curriculum ordered from general system design (`order: 1`, `2`) to Go implementation (`order: 3`, `4`).

- [ ] **Step 1: Update `src/content/lessons/design.md` (`order: 1`, `title: "Concepts"`, `stage: "System Design"`)**

Include plain-English intro, when to use a worker pool (connecting I/O-bound, CPU-bound, and rate-limited tasks to `EMAIL`, `WEBHOOK`, `IMG`, `SYNC`), the 4 zones, Go channel rules, buffer slots, worker states, presets, and the `pipeline` and `states` Mermaid diagrams.

- [ ] **Step 2: Update `src/content/lessons/resilience.md` (`order: 2`, `title: "Resilience"`, `stage: "System Design"`)**

Include plain-English intro to real-world failures, the `resilience` Mermaid diagram, context deadlines, transient vs. permanent errors, backoff with jitter, dead-letter queue (`Failed`), retry self-deadlock prevention, and the **Common Issues and Pitfalls** table (`Issue -> Solution -> In the Picture`).

- [ ] **Step 3: Update `src/content/lessons/syntax.md` (`order: 3`, `title: "Go Syntax"`, `stage: "Go Concurrency"`)**

Include progressive Go concurrency syntax (`go`, `make(chan Job, N)`, blocking send/receive, channel direction, `range` and `close`, `sync.WaitGroup` closer, and `select` comparing **Graceful Drain** vs. **Immediate Stop**).

- [ ] **Step 4: Update `src/content/lessons/setup.md` (`order: 4`, `title: "Build It"`, `stage: "Go Implementation"`)**

Restructure around the **5-Step Implementation Blueprint** for `processor/` (Step 1: Types & `process` func, Step 2: Producer & `jobs` channel, Step 3: Worker pool & `WaitGroup`, Step 4: Results loop, Step 5: `signal.NotifyContext` & `go test -race ./...`).

- [ ] **Step 5: Verify `pnpm check:tokens` and `pnpm build`**

Run: `pnpm check:tokens && pnpm build`
Expected: Both pass with zero errors (remember: never write `#` followed by hex characters in markdown).

- [ ] **Step 6: Commit**

```bash
git add src/content/lessons/design.md src/content/lessons/resilience.md src/content/lessons/syntax.md src/content/lessons/setup.md
git commit -m "docs(lessons): rewrite lessons for two-stage learning curve with diagrams and pitfalls"
```

---

### Task 6: Final Verification Across Build, Tokens, and Go Module

**Files:**
- Test: `dist/` build output, `pnpm check:tokens`, `processor/` tests

- [ ] **Step 1: Run `pnpm check:tokens` and `pnpm build`**

Run: `pnpm check:tokens && pnpm build`
Expected: PASS and clean static build in `dist/`.

- [ ] **Step 2: Run Go tests in `processor/`**

Run: `cd processor && go test -race ./...`
Expected: PASS.
