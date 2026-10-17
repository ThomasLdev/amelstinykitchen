---
name: astro-content
description: Use when defining or querying content collections, editing content.config.ts, writing Zod schemas, using loaders (glob/file/custom), getCollection/getEntry/render, generating dynamic routes from content, fetching data, or structuring multilingual content in this project.
---

# Astro content & data — best practices

Authoritative source: https://docs.astro.build/en/guides/content-collections/
Related: [content loader API](https://docs.astro.build/en/reference/content-loader-reference/),
[astro:content](https://docs.astro.build/en/reference/modules/astro-content/),
[astro/zod](https://docs.astro.build/en/reference/modules/astro-zod/),
[data fetching](https://docs.astro.build/en/guides/data-fetching/),
[routing](https://docs.astro.build/en/guides/routing/),
[i18n](https://docs.astro.build/en/guides/internationalization/).

When a rule conflicts with the docs for the installed version (`astro@7.x`), the
docs win. Fetch the page before relying on memory.

## When to use a collection

- Use a **content collection** whenever you have a set of structurally identical
  entries (blog posts, recipes, authors, categories) or remote data you want
  queried/typed uniformly.
- Do **not** use a collection for one-off pages (make `src/pages/about.astro`),
  for unprocessed static assets (put them in `public/`), or when a source SDK
  must be used directly.

## Two collection types — choose deliberately

- **Build-time collections** (default): data loaded and persisted at build time.
  Best for mostly static content, MDX, image optimization, and performance.
  Use these by default.
- **Live collections** (`getLiveCollection()`): fetched per request. Use only
  for real-time/user-specific data. Tradeoffs: no MDX, no image optimization,
  no persistence.
- Prefer build-time; reach for live only when freshness justifies the cost.

## Defining collections (`src/content.config.ts`)

- All build-time collections are defined in **one** `src/content.config.ts`
  (`.js`/`.mjs` also supported) and exported as a single `collections` object.
- Each collection declares a **required `loader`** and a **strongly recommended
  `schema`**.
- Import from the right places:
  - `defineCollection`, `reference` from `astro:content`
  - `glob`, `file` from `astro/loaders`
  - `z` from `astro/zod` (Zod 4 re-export — do **not** import `zod` directly)

```ts
import { defineCollection, reference } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    author: reference("authors"),
    relatedPosts: z.array(reference("blog")).default([]),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/authors" }),
  schema: z.object({ name: z.string(), portfolio: z.url() }),
});

export const collections = { blog, authors };
```

## Loaders

- `glob({ base, pattern })` — a directory of individual files (md/mdx/markdoc/
  json/yaml/toml). Generates a URL-friendly `id` from the filename; override per
  entry with `slug` frontmatter, or globally with `generateId`.
- `file("path")` — multiple entries from one JSON/YAML/TOML file. Each entry
  **must** carry a unique `id`; IDs are not auto-generated. Use a custom
  `parser` for CSV/nested JSON.
- Custom/remote loaders: build with the Content Loader API or use a community
  loader. This still yields `getCollection()`/`render()` and schema validation.
- Use `reference("collection")` (single) or `z.array(reference("collection"))`
  for relations instead of duplicating data.

## Schemas (Zod)

- A schema **guarantees** a predictable shape and powers TypeScript inference,
  autocomplete, and build-time errors. Always define one for real content.
- Use `z.coerce.date()` for dates from frontmatter; `.optional()` and
  `.default(...)` for optional fields; `z.url()`, `z.email()` for constrained
  strings.
- Every frontmatter/data property must be described — undeclared properties are
  rejected.
- After changing a schema, restart the dev server or sync the content layer
  (`s + enter` in `astro dev`) so `astro:content` typings regenerate.

## Querying

- `getCollection(name, filter?)` → array of entries; `getEntry(name, id)` →
  one entry; `getEntries(...)` for multiple references.
- Each entry exposes `id`, `data` (validated), and `body` (raw markdown).
- **Sort order is non-deterministic** — always sort explicitly:
  `posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())`.
- Filter server-side; hide drafts in production:
  `import.meta.env.PROD ? data.draft !== true : true`.
- Filter by sub-directory via `id.startsWith("en/")`.

## Rendering content

- Render markdown/MDX with `const { Content } = await render(entry);` then
  `<Content />`. You also get `headings` from `render()`.
- Type a component receiving an entry with
  `CollectionEntry<"blog">` from `astro:content` instead of re-declaring props.

## Generating routes from content

- Static (default): in `src/pages/blog/[id].astro`, use `getStaticPaths()` to
  return `{ params: { id }, props: { entry } }` for each entry; read
  `Astro.props.entry`.
- For very large sets, you may render build-time entries on demand instead.
- Keep one canonical URL shape; set `slug`/custom IDs deliberately for stable,
  SEO-friendly permalinks.

## Data fetching (non-collection)

- Fetch in the frontmatter (server-side) with `await fetch(...)`; never expose
  secrets — use `astro:env` / server-only env vars.
- For external APIs consumed across pages, prefer a content collection with a
  custom loader so data is validated, cached, and typed.
- Handle errors and non-200 responses explicitly; avoid rendering on failed
  fetches.

## Multilingual content (FR/EN — fixed, exactly two locales)

This project is bilingual **FR + EN only** — no other locales. Use Astro's
built-in i18n plus a single locale-tagged collection. Do **not** create one
collection per language, and do not use a dedicated i18n skill.

- Configure routing in `astro.config.mjs`:

```js
export default defineConfig({
  i18n: { locales: ["fr", "en"], defaultLocale: "fr" },
});
```

- **One collection per content type.** Each entry carries its `locale` and a
  shared `translationKey` that pairs the FR and EN versions of the same piece:

```ts
const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    locale: z.enum(["fr", "en"]),
    translationKey: z.string(), // same value across the FR/EN pair
    title: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});
```

- Store files by locale: `src/content/blog/fr/...`, `src/content/blog/en/...`
  (filter with `id.startsWith("fr/")` when needed).
- Generate routes per locale with `getStaticPaths` and `/[lang]/...` paths;
  read the active locale from `Astro.currentLocale` and build URLs with
  `getRelativeLocaleUrl` from `astro:i18n`. Never hardcode `/fr` or `/en`.
- `defaultLocale: "fr"` — the root/fallback locale is FR.
- **Fallback is explicit, never silent**: when an EN translation is missing,
  either hide the entry or redirect to the FR version — decide per page and
  implement it visibly. Do not render FR content under an EN URL by accident.
- Use `translationKey` (not the auto `id`) to link a pair, so URLs can differ
  between languages.
- Do not duplicate content across locales without this pairing.
- Taxonomies (tags, categories) are the exception: one file per entry holding
  `{ fr: {…}, en: {…} }`, so `reference()` ids stay stable across locales.
- Every schema field carries `.meta(cms({ … }))` (`@lib/content/cms`): the
  Sveltia CMS fields are generated from it (`cms/config.mjs`). Add the hints
  whenever you add a field, or the CMS config fails to load.

## Review checklist

- [ ] Collection used only for genuinely repeated/structured data.
- [ ] Build-time preferred over live; live justified.
- [ ] `src/content.config.ts` with `loader` + `schema`, correct imports.
- [ ] Schema complete; `reference()` for relations; no undeclared fields.
- [ ] Queries sorted explicitly; drafts filtered in prod.
- [ ] Routes generated via `getStaticPaths()` with `CollectionEntry` types.
- [ ] FR/EN: one locale-tagged collection, shared `translationKey`, no
      hardcoded locale in URLs, explicit fallback.
- [ ] Secrets stay server-side; failures handled.
