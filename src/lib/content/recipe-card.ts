import type { CollectionEntry } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import { type Locale, useTranslations } from "@i18n";
import { formatDuration, recipePath, recipeTransitionName, totalTime } from "@lib/content/recipe";

type Recipe = CollectionEntry<"recipes">;

export const recipeHref = (recipe: Recipe, locale: Locale): string =>
  getRelativeLocaleUrl(locale, recipePath(recipe));

export const factsLine = (facts: Array<string | null | undefined>): string =>
  facts.filter(Boolean).join(" · ");

export function recipeFacts({ data }: Recipe, locale: Locale): Array<string | null> {
  return [
    formatDuration(totalTime(data.preparationTime, data.cookingTime), locale),
    useTranslations(locale).recipe.difficulty[data.difficulty],
  ];
}

export function recipeCard(recipe: Recipe, locale: Locale) {
  return {
    href: recipeHref(recipe, locale),
    title: recipe.data.title,
    meta: factsLine(recipeFacts(recipe, locale)),
    image: recipe.data.media[0]?.src,
    transitionName: recipeTransitionName(recipe),
  };
}
