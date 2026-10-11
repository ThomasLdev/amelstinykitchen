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

export function isPublished(recipe: { data: { draft: boolean } }, production: boolean): boolean {
  return production ? !recipe.data.draft : true;
}
