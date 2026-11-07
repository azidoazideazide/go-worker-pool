# Agent notes

This repository publishes a static lesson site about a Go worker pool to GitHub Pages for the account `azidoazideazide` and stores the companion Go module in `processor/`.

## Commands

- Install: `pnpm install`
- Dev server: `pnpm dev`
- Verify design tokens: `pnpm check:tokens`
- Build static site: `pnpm build`
- Preview production build: `pnpm preview`
- Test Go module: `cd processor && go test ./...`

## Structure

- `DESIGN.md` and `docs/design-guidelines.md` — visual system, Go color tokens, spacing scale, and accessibility rules
- `GLOSSARY.md` — required domain words for all headings, UI labels, and lessons
- `src/pages/` — static Astro routes (`index.astro`, `lessons/[slug].astro`)
- `src/layouts/` — page layouts (`Base.astro`)
- `src/components/` — reusable UI components (`SiteHeader.astro`, `PoolPicture.astro`)
- `src/content/lessons/` — Markdown lesson files (`setup.md`, `syntax.md`, `design.md`)
- `src/lib/` — shared TypeScript helpers (`site-path.ts`, `pool-presets.ts`)
- `src/styles/tokens.css` — all design tokens exposed as CSS custom properties
- `src/styles/site.css` — site layout and component styles consuming `tokens.css`
- `processor/` — standalone companion Go module

## Rules

- The live URL is a project site: `https://azidoazideazide.github.io/go-worker-pool/`.
- Keep the repository public. On GitHub Free, a private repository cannot serve GitHub Pages.
- `astro.config.mjs` sets `site` to `https://azidoazideazide.github.io`, `base` to `/go-worker-pool`, and `output` to `static`.
- Build internal links and `public/` asset URLs with `sitePath()` from `src/lib/site-path.ts`. `import.meta.env.BASE_URL` has no trailing slash, so string-concatenating it drops the slash before the next segment.
- Leave the output static. Do not add a server adapter, API routes, or server rendering.
- Keep the site and the Go program (`processor/`) separate. The site must never import or call the Go program (`docs/adr/0001-separate-site-and-program.md`).
- Use the words defined in `GLOSSARY.md` across all labels, headings, and documentation.
- Follow `DESIGN.md` and the Go light and dark color tokens and accessibility rules in `docs/design-guidelines.md`.
- Use only the design tokens defined in `DESIGN.md` and exposed as CSS custom properties in `src/styles/tokens.css`.
- Never invent new hex colors, arbitrary spacing, or new font families outside `src/styles/tokens.css`.
- Add client JavaScript only on the page or component that needs it.
- Do not introduce new dependencies unless explicitly asked.
- Run `pnpm check:tokens` and `pnpm build` after every frontend change.

## Boundaries

- `.github/workflows/deploy.yml` builds the site and deploys the `dist/` artifact. Pages source is GitHub Actions.
- Do not edit generated files in `dist/` or `.astro/`.
- Do not commit secrets, `.env` files, or `node_modules`.
- Prefer editing existing components over creating duplicate components.
