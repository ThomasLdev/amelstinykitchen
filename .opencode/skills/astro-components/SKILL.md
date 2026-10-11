---
name: astro-components
description: Use when writing, editing, or reviewing .astro components, layouts, pages, slots, props, styles, client-side scripts, images, or client islands in this project. Covers Astro component and styling best practices from the official docs.
---

# Astro components — best practices

Authoritative source: https://docs.astro.build/en/basics/astro-components/
Related: [layouts](https://docs.astro.build/en/basics/layouts/),
[styling](https://docs.astro.build/en/guides/styling/),
[client-side scripts](https://docs.astro.build/en/guides/client-side-scripts/),
[framework components](https://docs.astro.build/en/guides/framework-components/),
[images](https://docs.astro.build/en/guides/images/),
[syntax reference](https://docs.astro.build/en/reference/astro-syntax/).

When a rule below conflicts with the docs for the installed version (`astro@7.x`),
the docs win. Fetch the relevant page before relying on memory.

## Mental model

- An `.astro` component is **HTML-only, zero client runtime by default**. It
  renders to HTML at build time (static) or on demand. The `---` frontmatter
  (component script) is stripped from the output.
- Default to shipping **no JavaScript**. Add interactivity only where needed:
  an inline `<script>` or a hydrated framework island (`client:*`).
- Components are **reusable and composable**; build small components and nest
  them rather than making one large page.

## File & naming conventions

- One component per file, PascalCase filename matching the component name
  (`RecipeCard.astro`).
- Pages live only in `src/pages/` (the one reserved directory). Layouts in
  `src/layouts/`, components in `src/components/`, styles in `src/styles/`,
  images processed by Astro in `src/assets/` (or `src/images/`), unprocessed
  static files in `public/`.
- Prefer co-locating component-specific assets next to the component; import
  them through the frontmatter so Astro can optimize them.

## Frontmatter (component script)

- Keep the script focused on **data preparation**: imports, `Astro.props`
  destructuring, queries, derived values. No side effects that belong in a
  layout or endpoint.
- The frontmatter is TypeScript and runs **server-side only** — never assume it
  reaches the browser, and never put secrets in the template.

## Props

- Always type props with a `Props` interface; Astro picks it up automatically.
- Provide defaults via destructuring.
- Destructure once: `const { title, description = "" } = Astro.props;`.
- Keep props serializable and minimal; avoid passing large objects when an `id`
  or a reference is enough.

```astro
---
interface Props {
  title: string;
  description?: string;
  tags?: string[];
}
const { title, description = "", tags = [] } = Astro.props;
---
<article>
  <h2>{title}</h2>
  {description && <p>{description}</p>}
</article>
```

## Slots

- Use the default `<slot />` for main child content, named slots
  (`<slot name="head" />`) for secondary regions, and provide **fallback
  content** inside a slot for the empty case.
- Named slots must be **immediate children** of the component; they cannot be
  passed through nested elements. Use `<Fragment slot="name">` to pass several
  elements without an extra wrapper.
- Transfer slots between nested layouts with both attributes:
  `<slot name="head" slot="head" />`.

## Layouts

- Layouts are Astro components that define shared page chrome; a page wraps its
  content in a layout via the default slot.
- Put `<html>`, `<head>`, `<meta>`, viewport, canonical/SEO tags, and global
  styles in the base layout. Nest layouts (e.g. `BaseLayout` → `BlogLayout`)
  and forward slots rather than duplicating markup.

## Styling

For project design norms (tokens, palettes, layers, native-first, a11y) load
the `design-system` skill. The rules below are the Astro mechanics only.

- Prefer scoped `<style>` blocks inside `.astro` components: styles are
  **scoped by default** to the component. Use `is:global` only when truly global.
- Use `class:list` for conditional/combined class names instead of string
  concatenation.
- Import the global theme once from the base layout (`import "../styles/app.css"`).
- Keep authored CSS/JS in `src/`, not `public/` (public assets are not bundled
  or optimized).

## Client-side interactivity

- Inline `<script>` in an `.astro` component is **bundled, hoisted, and
  module-scoped by default**; use `is:inline` only when you deliberately need it
  left untouched (e.g. analytics snippet). Do not assume `document` access in
  the frontmatter.
- Hydrate framework components deliberately, choosing the lightest directive:
  `client:load` (immediate), `client:idle` (after main thread free),
  `client:visible` (on viewport), `client:media`, `client:only`.
- Only islands ship JS; keep the island surface small and pass serializable
  props. Share state between islands via a store/`nanostores`, not globals.
- For personalized/dynamic server content without blocking the page, use
  **server islands** (`server:defer` with a `slot="fallback"`).

## Images & assets

- Import images from `src/` so Astro can optimize them; use `<Image />` /
  `<Picture />` from `astro:assets` with explicit dimensions and meaningful
  `alt`.
- Use `public/` only for files that must keep an exact path/name (favicon,
  `robots.txt`, `manifest.webmanifest`, downloadable PDFs).

## Accessibility & HTML

- Use semantic HTML landmarks (`header`, `nav`, `main`, `article`, `footer`).
- Every `<img>`/`<Image>` needs `alt` (empty for decorative).
- Keep one `<h1>` per page; do not skip heading levels.
- Prefer native elements over `div` + ARIA.

## Performance defaults to protect

- Do not add client-side JS for static content.
- Do not hydrate a whole page; hydrate the smallest interactive unit.
- Avoid layout shift: set image width/height, reserve space for async content.
- Prefer `astro:assets` over raw `<img>` for local images.

## Comments

Comment the **why**, never the **what**. Code, names, types and CSS already say
what happens; a comment is only worth keeping when a reader could not guess it.

- Keep: a non-obvious constraint or contract (`?q=` read by the search page,
  `getCollection()` order not being deterministic), a workaround or deliberate
  rule exception (a `max-width` query, a `::before` hit area), an a11y choice
  that looks odd (`aria-labelledby` on a card link), a build-time vs runtime
  caveat.
- Remove: paraphrases of the code or of a function/prop name ("Hero recipe: the
  most recent one"), layout descriptions the CSS already shows ("Phone: list,
  wider: grid"), examples of values, pointers that duplicate an import, and
  comments in tests that repeat the test name.
- One short line by default; a block only when the reasoning needs it.
- Content fixtures are the exception: each one states the case it covers
  (see `astro-testing`).

## Review checklist

- [ ] `.astro` only where reusable; pages in `src/pages/`.
- [ ] Typed `Props`, sensible defaults, minimal props.
- [ ] Slots used instead of prop-drilling markup; fallbacks provided.
- [ ] Styles scoped; `is:global` justified.
- [ ] No unnecessary JS; correct `client:*` directive and smallest scope.
- [ ] Images optimized via `astro:assets` with `alt` and dimensions.
- [ ] Semantic, accessible markup.
- [ ] Comments explain a non-obvious why; none paraphrase the code.
