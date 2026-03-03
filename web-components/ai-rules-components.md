# Web Components Directory — AI Instructions

## Creating New Components
```
cp templates/component.js web-components/[name].js
```
Then create a matching `styles/organisms/[name].css` and add its `@import` to `styles/main.css` in the Organisms section.

## Registration
- `customElements.define()` at the bottom of each component file.
- Import every component file in `scripts/main.js` so custom elements are registered before use.
- Example: `import '../web-components/site-nav.js';`

## Rules
- Flat directory. No subfolders. Sub-components use shared prefix (e.g., `search-bar.js`, `search-bar-input.js`).
- One component per file. File name matches element name minus the `app-` prefix.
- Custom element names: `app-[name]` (kebab-case with `app-` prefix).
- Class name: PascalCase matching the element name.
- Light DOM only. Never use Shadow DOM.

## Component Structure
Functional core, imperative shell. The component class is a thin imperative shell. Classes are fine here — Web Components require them. But business logic does not go in classes. It does exactly three things:
1. Defines the element
2. Sets up HTML in `connectedCallback`
3. Wires event listeners

All logic (data transformation, validation, formatting) lives in pure modules in `scripts/`. Import and call them — do not put logic in the component.

## Lifecycle
- `connectedCallback` — setup, render, wire listeners.
- `disconnectedCallback` — **required**. Must remove all `window`/`document` event listeners added in `connectedCallback`. Store references to bound handlers as instance properties (e.g., `this._onScroll = () => { ... }`) so they can be removed in `disconnectedCallback`.
- No constructor logic.

## Communication
- Components never import each other.
- Use DOM custom events: `app:[event-name]` with `detail` for payload.
- Dispatch from the owning component.
- Listen via `document.addEventListener`.

## Rendering
- Use `innerHTML` with static template literals for initial render in `connectedCallback` only.
- Never use `innerHTML` with dynamic or user-derived data. Use `textContent` or DOM APIs for dynamic updates.
- Use targeted `querySelector` for updates. Do not re-render the whole component.

## Attributes vs Properties
- Attributes: strings/booleans from markup.
- Properties: complex/programmatic data.

## CSS
- Every component maps 1:1 to an organism CSS file: `styles/organisms/[name].css`.
- No styles in JS files. No inline styles.
