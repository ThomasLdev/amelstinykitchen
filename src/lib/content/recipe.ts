import type { Locale } from "@i18n";

/**
 * Format a duration expressed in minutes for display.
 * Returns `null` when the duration is zero/absent so callers can hide the field.
 */
export function formatDuration(minutes: number, locale: Locale): string | null {
  if (minutes <= 0) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourUnit = locale === "fr" ? "h" : "hr";

  if (hours === 0) {
    return `${rest} min`;
  }

  if (rest === 0) {
    return `${hours} ${hourUnit}`;
  }

  return `${hours} ${hourUnit} ${String(rest).padStart(2, "0")}`;
}

/** Total recipe time in minutes (preparation + cooking), derived at render time. */
export function totalTime(preparationTime: number, cookingTime: number): number {
  return preparationTime + cookingTime;
}

/** Number of ingredients across every group, derived at render time. */
export function ingredientCount(groups: Array<{ ingredients: unknown[] }>): number {
  return groups.reduce((total, group) => total + group.ingredients.length, 0);
}

export function recipeTransitionName(recipe: { id: string }): string {
  return `recipe-media-${recipe.id.replace(/[^a-z0-9_-]/gi, "-")}`;
}

export function isPublished(recipe: { data: { draft: boolean } }, production: boolean): boolean {
  return production ? !recipe.data.draft : true;
}

interface Relatable {
  id: string;
  data: { category: { id: string }; tags: Array<{ id: string }>; publishDate: Date };
}

/**
 * Recipes to link from a recipe page: same category counts for two shared
 * tags; unrelated recipes are left out, ties go to the most recent.
 */
export function selectRelatedRecipes<T extends Relatable>(
  recipe: T,
  candidates: T[],
  limit = 3,
): T[] {
  const tags = new Set(recipe.data.tags.map((tag) => tag.id));
  const score = ({ data }: T) =>
    (data.category.id === recipe.data.category.id ? 2 : 0) +
    data.tags.filter((tag) => tags.has(tag.id)).length;

  return candidates
    .filter((candidate) => candidate.id !== recipe.id && score(candidate) > 0)
    .sort(
      (a, b) =>
        score(b) - score(a) ||
        b.data.publishDate.valueOf() - a.data.publishDate.valueOf() ||
        a.id.localeCompare(b.id),
    )
    .slice(0, limit);
}
