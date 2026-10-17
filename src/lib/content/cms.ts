/**
 * Editing hints attached to schema fields with `.meta(cms({ … }))`. Astro copies
 * them into `.astro/collections/*.schema.json`, from which `cms/config.mjs`
 * generates the Sveltia CMS fields: the Zod schema stays the single source.
 */
export interface CmsHints {
  label: string;
  /** Edited per locale; any other field is entered once and copied to every locale. */
  translate?: boolean;
  widget?: "text" | "markdown" | "image" | "relation" | "hidden";
  collection?: string;
  hint?: string;
  /** Labels of an enum's values, shown in the select. */
  options?: Record<string, string>;
  default?: string;
}

/** `cms(false)` keeps a field out of the CMS form (e.g. written by the CMS itself). */
export const cms = (hints: CmsHints | false) => ({ cms: hints });
