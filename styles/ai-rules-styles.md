# Styles Directory — AI Instructions

## Architecture: Atomic Design
CSS is organized in layers. Order matters — it follows the cascade.

### atoms/
- `tokens.css` — Raw palette values (colors, fonts, spacing, shadows, z-index, transitions). These are never used directly by molecules or organisms.
- `tokens-semantic.css` — Semantic role mappings (e.g., `--text-primary`, `--bg-page`). This is what molecules and organisms consume. Theme overrides live here.
- `base.css` — Default element styles beyond reset (body, links, buttons, focus states). Uses semantic tokens only.
- Do not create new files in atoms unless adding a new foundational layer.

### molecules/
- One file per reusable styled element (button, input, badge, toggle, etc.).
- Molecules are shared — they do not belong to any specific component.
- Create the file directly with the standard header comment (Module, Type, Purpose, Depends on, Used by, Side effects).
- Then add `@import './molecules/[name].css';` to `main.css` in the Molecules section.

### organisms/
- One file per Web Component. 1:1 mapping: `web-components/[name].js` maps to `organisms/[name].css`.
- Organisms are layout files — flex, grid, gaps, responsive behavior. How molecules are arranged inside a component.
- Create the file directly with the standard header comment (Module, Type, Purpose, Depends on, Used by, Side effects).
- Then add `@import './organisms/[name].css';` to `main.css` in the Organisms section.

### Other files
- `reset.css` — Browser reset. Do not modify.
- `tailwind-overrides.css` — Quarantine file for Tailwind customizations. Solve in `tailwind.config.js` first. Only use this file as last resort.
- `main.css` — Entry point. Imports everything in correct cascade order. Always update this when adding new molecule or organism files.

## main.css Import Order
1. atoms/tokens.css
2. atoms/tokens-semantic.css
3. atoms/base.css
4. tailwind-overrides.css
5. All molecules
6. All organisms

Do not rearrange this order.

## Semantic Color System
`tokens-semantic.css` has two layers. Molecules and organisms only use these — never raw tokens.

### Layer 1: Global (structural roles)
- `--text-primary`, `--text-secondary`, `--text-inverse`, `--text-link`
- `--bg-page`, `--bg-surface`, `--bg-elevated`
- `--border`, `--shadow`

Use these for page structure, layout, and general UI.

### Layer 2: Brand (primary/secondary with 3 densities)
Each brand color has three variants:
- `--[brand]-light` — subtle bg, hover states
- `--[brand]-base` — main brand color, CTAs, links
- `--[brand]-dark` — text, pressed states

Available: `primary`, `secondary`.

Examples:
- Primary button bg: `background: var(--primary-base)`
- Primary button hover: `background: var(--primary-dark)`
- Secondary subtle bg: `background: var(--secondary-light)`

### Layer 3: Status (feedback colors with 3 densities)
Each status color has three variants:
- `--[status]-light` — background tints (e.g., alert banners, badges bg)
- `--[status]-base` — icons, badges, indicators
- `--[status]-dark` — text on light backgrounds

Available statuses: `error`, `success`, `warning`, `info`.

Examples:
- Error text: `color: var(--error-dark)`
- Error icon: `color: var(--error-base)`
- Error banner bg: `background: var(--error-light)`

## Theming
- `tokens.css` defines the raw palette. Never reference these directly in molecules or organisms.
- `tokens-semantic.css` maps raw values to roles. Molecules and organisms only use semantic variables.
- Theme overrides go inside `[data-theme="..."]` blocks in `tokens-semantic.css`. Only reassign semantic variables — never redefine raw tokens per theme.
- In dark mode, status densities flip automatically (light becomes dark bg, dark becomes light text).
- To switch themes at runtime, set `document.documentElement.dataset.theme = 'dark'` (or remove it for light). No CSS changes needed.
- When adding new colors, always add both: a raw value in `tokens.css` and a semantic mapping in `tokens-semantic.css`.

## Tailwind + Semantic Tokens
- `tailwind.config.js` maps all semantic tokens to Tailwind utilities. Use these mapped classes — never Tailwind's default color palette.
- Correct: `bg-primary`, `text-primary`, `bg-error-light`, `text-secondary`, `border`, `bg-surface`
- Wrong: `bg-blue-600`, `text-gray-500`, `bg-red-100`, `text-black`, `bg-white`
- The config is a shared file (`/tailwind.config.js`). Never duplicate it inline in HTML pages. Each page loads it via `<script src="/tailwind.config.js"></script>`.
- Tailwind handles layout (flex, grid, spacing, responsive) AND colors — but only through the semantic mappings.
- When adding new semantic tokens, also add their Tailwind mapping in `tailwind.config.js`.

## Banned
- Inline CSS, internal CSS in HTML, CSS-in-JS.
- `!important`
- CSS preprocessors (SCSS, SASS, LESS).
- Commented-out code.
