import { type CollectionEntry, getCollection } from "astro:content";
import { type Locale, useTranslations } from "@i18n";
import { inLocale, localize } from "@lib/content/i18n";
import { isPublished, totalTime } from "@lib/content/recipe";
import type { SearchFields } from "@lib/content/recipe-search";
import { SEASONS, type Season } from "@lib/content/season";

interface CatalogRecipe {
  recipe: CollectionEntry<"recipes">;
  categoryLabel: string;
  tags: Array<{ id: string; title: string }>;
  seasons: Season[];
  seasonLabels: string[];
  /** Total time in minutes; 0 when unknown. */
  time: number;
  search: SearchFields;
}

/**
 * Published recipes of a locale with their localized labels, shared by the
 * recipes list and the search index so both search the same text.
 */
export async function loadRecipeCatalog(locale: Locale): Promise<CatalogRecipe[]> {
  const t = useTranslations(locale);
  const recipes = await getCollection(
    "recipes",
    (entry) => isPublished(entry, import.meta.env.PROD) && inLocale(locale)(entry),
  );
  const categories = new Map(
    (await getCollection("categories")).map((entry) => [entry.id, localize(entry, locale)]),
  );
  const tags = new Map(
    (await getCollection("tags")).map((entry) => [entry.id, localize(entry, locale)]),
  );

  const sorted = recipes.sort(
    (a, b) =>
      b.data.publishDate.valueOf() - a.data.publishDate.valueOf() || a.id.localeCompare(b.id),
  );
  return sorted.map((recipe) => {
    const { data } = recipe;
    const categoryLabel = categories.get(data.category.id)?.data.title ?? "";
    const recipeTags = data.tags.flatMap((ref) => {
      const tag = tags.get(ref.id);
      return tag ? [{ id: tag.id, title: tag.data.title }] : [];
    });
    const seasons = SEASONS.filter((season) => data.seasons.includes(season));
    const seasonLabels = seasons.map((season) => t.recipes.seasons[season]);

    return {
      recipe,
      categoryLabel,
      tags: recipeTags,
      seasons,
      seasonLabels,
      time: totalTime(data.preparationTime, data.cookingTime),
      search: {
        title: data.title,
        labels: [
          categoryLabel,
          ...recipeTags.map((tag) => tag.title),
          ...seasonLabels,
          ...data.keywords,
        ].join(" "),
        ingredients: data.ingredientGroups.flatMap((group) =>
          group.ingredients.map((ingredient) => ingredient.name),
        ),
        excerpt: data.excerpt,
      },
    };
  });
}
