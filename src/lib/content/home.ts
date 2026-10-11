/**
 * Homepage selections, kept pure (plain entries in, entries out) so the
 * editorial rules are unit-testable without the content layer.
 */

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

export type Season = "spring" | "summer" | "autumn" | "winter";

interface TagLike {
  id: string;
  data: { isFeatured: boolean; season?: Season | undefined };
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

/** Meteorological seasons, northern hemisphere (Dec–Feb is winter). */
export function currentSeason(date: Date): Season {
  const seasons: Season[] = ["winter", "spring", "summer", "autumn"];
  return seasons[Math.floor(((date.getUTCMonth() + 1) % 12) / 3)] as Season;
}

export function selectFeaturedTags<T extends TagLike>(
  tags: T[],
  recipes: RecipeLike[],
  now: Date,
  limit = HOME_LIMIT,
): Array<{ tag: T; recipeCount: number; inSeason: boolean }> {
  const season = currentSeason(now);
  const inSeason = (tag: T) => tag.data.season === season;

  return tags
    .filter((tag) => tag.data.isFeatured)
    .sort((a, b) => Number(inSeason(b)) - Number(inSeason(a)) || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map((tag) => ({
      tag,
      inSeason: inSeason(tag),
      recipeCount: recipes.filter((recipe) => recipe.data.tags.some((ref) => ref.id === tag.id))
        .length,
    }));
}
