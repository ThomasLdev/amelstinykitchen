import { type CollectionEntry, getEntries, getEntry } from "astro:content";
import { getAbsoluteLocaleUrl } from "astro:i18n";
import type { Locale } from "@i18n";
import { translate } from "@lib/content/i18n";
import { schemaImages, stepImage } from "@lib/seo/images";
import { type ResolvedRecipe, stripHtml } from "@lib/seo/recipe";

export const recipePath = (recipe: CollectionEntry<"recipes">, locale: Locale) =>
  `recipes/${recipe.data.paths[locale]}`;

/** Absolute URL of the Markdown twin served by `[slug].md.ts`. */
const recipeMarkdownUrl = (recipe: CollectionEntry<"recipes">, locale: Locale) =>
  getAbsoluteLocaleUrl(locale, recipePath(recipe, locale)).replace(/\/$/, ".md");

/** `images: false` skips image generation for text-only outputs (Markdown, feeds). */
export async function resolveRecipe(
  recipe: CollectionEntry<"recipes">,
  locale: Locale,
  site: URL,
  { images = true }: { images?: boolean } = {},
): Promise<ResolvedRecipe> {
  const { data } = recipe;
  const category = await getEntry(data.category);
  const tags = await getEntries(data.tags);
  const keywords = data.keywords.length > 0 ? data.keywords : tags.map((tag) => tag.data.title);
  const hero = data.media[0];

  return {
    locale,
    url: getAbsoluteLocaleUrl(locale, recipePath(recipe, locale)),
    markdownUrl: recipeMarkdownUrl(recipe, locale),
    title: translate(data.title, locale),
    description: translate(data.metaDescription ?? data.excerpt, locale),
    category: category ? translate(category.data.title, locale) : undefined,
    cuisine: data.cuisine ? translate(data.cuisine, locale) : undefined,
    keywords: keywords.map((keyword) => translate(keyword, locale)),
    preparationTime: data.preparationTime,
    cookingTime: data.cookingTime,
    servings: data.servings,
    publishDate: data.publishDate,
    updatedDate: data.updatedDate,
    images: images && hero ? await schemaImages(hero.src, site) : [],
    ingredientGroups: data.ingredientGroups.map((group) => ({
      label: translate(group.label, locale) || undefined,
      ingredients: group.ingredients.map((ingredient) => ({
        name: translate(ingredient.name, locale),
        quantity: ingredient.quantity,
        unit: translate(ingredient.unit, locale),
        display: ingredient.display ? translate(ingredient.display, locale) : undefined,
      })),
    })),
    steps: await Promise.all(
      data.steps.map(async (step) => ({
        title: translate(step.title, locale),
        text: stripHtml(translate(step.content, locale)),
        image: images && step.media[0] ? await stepImage(step.media[0].src, site) : undefined,
      })),
    ),
    chefNote: data.chefNote && {
      title: translate(data.chefNote.title, locale),
      body: stripHtml(translate(data.chefNote.body, locale)),
    },
  };
}
