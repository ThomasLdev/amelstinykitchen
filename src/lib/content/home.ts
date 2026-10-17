/**
 * Homepage selections, kept pure (plain entries in, entries out) so the
 * editorial rules are unit-testable without the content layer.
 */

import type { Season } from "@lib/content/season";

interface RecipeLike {
  id: string;
  data: {
    draft: boolean;
    isFeatured: boolean;
    publishDate: Date;
    updatedDate?: Date | undefined;
    tags: Array<{ id: string }>;
  };
}

interface TagLike {
  id: string;
  data: { isFeatured: boolean };
}

const HOME_LIMIT = 5;

const lastTouched = (recipe: RecipeLike) =>
  (recipe.data.updatedDate ?? recipe.data.publishDate).valueOf();

/** The id breaks ties: getCollection() order is not deterministic. */
const byDateDesc =
  (date: (recipe: RecipeLike) => number) =>
  (a: RecipeLike, b: RecipeLike): number =>
    date(b) - date(a) || a.id.localeCompare(b.id);

export function selectHeroRecipe<T extends RecipeLike>(recipes: T[]): T | undefined {
  return [...recipes].sort(byDateDesc((recipe) => recipe.data.publishDate.valueOf()))[0];
}

export function selectPopularRecipes<T extends RecipeLike>(recipes: T[], limit = HOME_LIMIT): T[] {
  return recipes
    .filter((recipe) => recipe.data.isFeatured)
    .sort(byDateDesc(lastTouched))
    .slice(0, limit);
}

export function selectFeaturedTags<T extends TagLike>(
  tags: T[],
  recipes: RecipeLike[],
  limit = HOME_LIMIT,
): Array<{ tag: T; recipeCount: number }> {
  return tags
    .filter((tag) => tag.data.isFeatured)
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, limit)
    .map((tag) => ({
      tag,
      recipeCount: recipes.filter((recipe) => recipe.data.tags.some((ref) => ref.id === tag.id))
        .length,
    }));
}

export function selectSeasonRecipes<T extends RecipeLike & { data: { seasons: Season[] } }>(
  recipes: T[],
  season: Season,
): T[] {
  return recipes
    .filter((recipe) => recipe.data.seasons.includes(season))
    .sort(
      (a, b) =>
        Number(b.data.isFeatured) - Number(a.data.isFeatured) || byDateDesc(lastTouched)(a, b),
    );
}
