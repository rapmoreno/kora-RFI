# Vibe Code Rules
Make sure you have deleted vibe-code-setup.md after setup is complete if you have not already done so.
These are your persistent rules. Follow them for all development in this project.

## How This Project Works

This project is pre-built with a complete directory structure, baseline files, and templates. Do not recreate what already exists.

### Directory Map
```
styles/              ← All CSS (Atomic Design). Read styles/ai-rules-styles.md.
scripts/             ← All JS (flat, prefixed). Read scripts/ai-rules-scripts.md.
web-components/      ← All components (flat). Read web-components/ai-rules-components.md.
templates/           ← cp targets for creating new files. Never modify these directly.
public/images/       ← Static assets served by Vite (icons/, logos/, content/, og/, favicon.ico). This is the only images directory.
to-do/               ← Task tracking
test/                ← Throwaway experiments
architecture/        ← Plans and diagrams
readme/              ← Documentation (only when asked)
upload/              ← User-provided files
download/            ← Generated output files
```

### Creating New Files
Always `cp` from templates, then modify. Never write from scratch.
- New page: `cp templates/boilerplate.html [target]`
- New component: `cp templates/component.js web-components/[name].js` + create matching `styles/organisms/[name].css`
- New effect module: `cp templates/effect.js scripts/effect.[name].js`
- New pure module: `cp templates/pure.js scripts/pure.[name].js`
After creating new CSS files, add their `@import` to `styles/main.css` in the correct section.

### Per-Directory Instructions
Each working directory has an `ai-rules-*.md` file with scoped rules. Read it when you first work in that directory during a session.

---

## System
- macOS with Homebrew. If a brew install is needed, state the command and wait for approval.

## Architecture
Functional core, imperative shell. Pure logic in `pure.*` modules, side effects isolated in `effect.*` modules, data shapes in schemas/dataclasses. Classes are fine for Web Components and dataclasses — just not for organizing business logic.

## Stack
- Vanilla JavaScript, Vanilla CSS, Vite, Web Components (Light DOM), Tailwind via CDN.
- Node.js is dev runtime only (Vite, npm, `.env`). Not application code.
- `package.json` must have `"type": "module"`. The `"main"` field should be omitted.
- CDN-first for all external dependencies. npm only for dev tooling.
- Backend is a separate scope decision per project.

## Banned
- Frameworks (React, Vue, Angular, jQuery)
- Shadow DOM
- CSS preprocessors (SCSS, SASS, LESS)
- Inline CSS, internal CSS in HTML, CSS in JS files
- Inline JS event handlers (`onclick`, `onsubmit`, etc.)
- `!important`
- Hardcoded secrets in any file
- `utils.js` or `helpers.js`
- Commented-out code

## Security
- All secrets in `.env`. If you detect a hardcoded secret, remove it, move to `.env`, warn the user.
- `.env` must be in `.gitignore`.
- Redact sensitive data from error log output.
- Never use `innerHTML` with dynamic or user-derived data. Use `textContent` or DOM APIs for dynamic content. `innerHTML` is only acceptable for static template literals in `connectedCallback`.

## Git
- Local only. Commit prefixes: `FEAT:`, `FIX:`, `REVERT:`, `CHORE:`, `DOCS:`.
- Commit after every working feature.
- Check for new directories needing `.gitignore` entries before committing.

## AI Behavior
- Implement incrementally. Never multiple risky phases at once.
- Test before reporting complete.
- Git commit frequently for rollback.
- No documentation unless asked.
- Present options, wait for user choice before coding.

---

## HTML
- Every HTML file starts with: `<!-- No inline or internal CSS styles are allowed. -->`
- Use semantic elements: `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<header>`, `<footer>`.
- `<button>` for actions. `<a>` for links. Lists use `<ul>`/`<ol>`/`<dl>`.
- `<div>`/`<span>` only when no semantic element fits.
- DOM nesting 3-4 levels max. Deeper nesting means extract a new component.
- `<section>` must have a heading. `<main>` once per page. Tables for data only.
- Relative links internal, absolute links external.
- Internal scripts only for: import maps, critical pre-render (<5 lines with comment).
- Tailwind config is an external shared file: `<script src="/tailwind.config.js"></script>`. Never inline it.
- CSS load order in `<head>`: reset > Tailwind CDN > fonts > icons > main.css.
- Scripts: CDN first, project scripts with `defer`.
- Head must include: charset, viewport, title, description, canonical, robots, OG tags, favicon, JSON-LD.
- Custom elements: kebab-case with `app-` prefix.

### Accessibility (NON-NEGOTIABLE)
- All `<img>` have `alt`. Decorative images: `alt=""`.
- All inputs have `<label>` with matching `for`/`id`.
- Interactive elements: `role`, `tabindex`, keyboard handling.
- Color is never the sole information carrier.
- Visible focus states. Never `outline: none` without a replacement.
- Skip nav link at top of every page.
- ARIA as last resort after native semantics.
- `lang` attribute on `<html>`.
- Include a `<noscript>` tag in `<body>` informing users that JavaScript is required, since Web Components render via JS.

---

## CSS
Refer to `styles/ai-rules-styles.md` for full details. Summary:
- Atomic Design: atoms > molecules > organisms.
- `main.css` import order matters. Do not rearrange.
- One organism CSS file per Web Component. 1:1 mapping.
- Tailwind overrides quarantined in one file. Solve in config first.
- Tailwind colors are mapped to semantic tokens in `tailwind.config.js`. Use `bg-primary`, `text-error-dark`, `bg-surface` etc. Never use Tailwind's default color palette (`bg-blue-600`, `text-gray-500`, `bg-white`).
- `tailwind.config.js` is a shared external file. Never duplicate it inline in HTML pages.

---

## JavaScript
Refer to `scripts/ai-rules-scripts.md` for full details. Summary:
- Functional core, imperative shell. Pure logic in `pure.*`, side effects isolated in `effect.*`. Classes only for Web Components — not for business logic.
- `"use strict"` in every file.
- ECMAScript modules only.
- Strict functional: no shared mutable state, no mutation.
- Two module types: `effect.*` (side effects) and `pure.*` (deterministic).
- All errors through `effect.error.js`.
- All state in `effect.state.js`.
- All config in `config.js`.
- camelCase for variables/functions. PascalCase for component classes only.
- File names: kebab-case with dot prefixes.

---

## Web Components
Refer to `web-components/ai-rules-components.md` for full details. Summary:
- Light DOM only. No Shadow DOM.
- Flat directory. No subfolders.
- Component is a thin shell: define, render in `connectedCallback`, wire listeners.
- All logic in pure modules.
- Communication via DOM custom events only: `app:[event-name]`.
- Components never import each other.

---

## Commenting
- Every file has a header comment. Follow the format from templates.
- Function comments only on non-obvious functions.
- Inline comments only for non-obvious decisions. Explain why, not what.
- Never comment what code mechanically does.
- Never leave commented-out code.
