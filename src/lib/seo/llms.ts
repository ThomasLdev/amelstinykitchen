import { getCollection } from "astro:content";
import { getAbsoluteLocaleUrl } from "astro:i18n";
import { type Locale, languages, useTranslations } from "@i18n";
import { isPublished } from "@lib/content/recipe";
import type { ResolvedRecipe } from "@lib/seo/recipe";
import { resolveRecipe } from "@lib/seo/resolve";

export const locales = Object.keys(languages) as Locale[];

/** Published recipes resolved per locale, newest first. */
export async function resolvedRecipesByLocale(): Promise<Record<Locale, ResolvedRecipe[]>> {
  const site = new URL(import.meta.env.SITE);
  const recipes = (
    await getCollection("recipes", (entry) => isPublished(entry, import.meta.env.PROD))
  ).sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  const entries = await Promise.all(
    locales.map(
      async (locale) =>
        [
          locale,
          await Promise.all(
            recipes.map((recipe) => resolveRecipe(recipe, locale, site, { images: false })),
          ),
        ] as const,
    ),
  );
  return Object.fromEntries(entries) as Record<Locale, ResolvedRecipe[]>;
}

/** Header of llms.txt / llms-full.txt: who we are and where the key pages live. */
export function llmsIntro(name: string): string[] {
  const summary = locales.map((locale) => useTranslations(locale).meta.description).join(" / ");
  const lines = [`# ${name}`, "", `> ${summary}`, ""];
  for (const locale of locales) {
    const t = useTranslations(locale);
    lines.push(
      `- [${t.header.home} (${locale})](${getAbsoluteLocaleUrl(locale, "")})`,
      `- [${t.recipes.meta.title} (${locale})](${getAbsoluteLocaleUrl(locale, "recipes")})`,
    );
  }
  lines.push("");
  return lines;
}
