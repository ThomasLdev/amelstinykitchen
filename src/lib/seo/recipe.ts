import type { Locale } from "@i18n";
import { formatQuantity } from "@lib/content/quantity";

export interface ResolvedIngredient {
  name: string;
  quantity: number | null;
  unit: string;
  display?: string;
}

/**
 * A recipe flattened for one locale, with absolute URLs: the shared input of
 * the JSON-LD, Markdown and feed builders, which stay free of `astro:content`.
 */
export interface ResolvedRecipe {
  locale: Locale;
  url: string;
  markdownUrl: string;
  title: string;
  description: string;
  category?: string;
  cuisine?: string;
  keywords: string[];
  preparationTime: number;
  cookingTime: number;
  servings: number;
  publishDate: Date;
  updatedDate?: Date;
  images: string[];
  ingredientGroups: { label?: string; ingredients: ResolvedIngredient[] }[];
  steps: { title: string; text: string; image?: string }[];
  chefNote?: { title: string; body: string };
}

/** ISO 8601 duration (`PT1H5M`) for schema.org times; `undefined` hides an empty one. */
export function isoDuration(minutes: number): string | undefined {
  if (minutes <= 0) {
    return undefined;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `PT${hours > 0 ? `${hours}H` : ""}${rest > 0 ? `${rest}M` : ""}`;
}

/** Plain text from the inline HTML allowed in step and section content. */
export function stripHtml(html: string): string {
  return (
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Last, so "&amp;lt;" stays "&lt;" instead of being decoded twice.
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * One ingredient as a sentence: "200 g Farine" when the amount is a number,
 * "Sel (une pincée)" when it is free text, the name alone otherwise.
 */
export function formatIngredient(ingredient: ResolvedIngredient, locale: Locale): string {
  const { name, quantity, unit, display } = ingredient;

  if (!display && quantity !== null) {
    // Nothing is scaled here: keep the amount as entered rather than the display rounding.
    return [formatQuantity(quantity, locale, 3), unit, name].filter(Boolean).join(" ");
  }

  const amount = display || unit;
  return amount ? `${name} (${amount})` : name;
}
