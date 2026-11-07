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

## License

Required Notice: Copyright 2026 azidoazideazide

The lessons, the site, and the program are under the [PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0). The text is in `LICENSE`.

Go gopher drawings are based on the Go gopher by Renée French and remain [CC BY 4.0](https://go.dev/doc/gopher/README).
