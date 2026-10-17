import { getCollection } from "astro:content";
import { type Locale, languages } from "@i18n";
import { isPublished } from "@lib/content/recipe";
import { recipeMarkdown } from "@lib/seo/markdown";
import { resolveRecipe } from "@lib/seo/resolve";
import type { APIRoute, GetStaticPaths } from "astro";

/** Markdown twin of each recipe page, advertised by `<link rel="alternate" type="text/markdown">`. */
export const getStaticPaths = (async () => {
  const recipes = await getCollection("recipes", (entry) =>
    isPublished(entry, import.meta.env.PROD),
  );
  const locales = Object.keys(languages) as Locale[];

  return recipes.flatMap((recipe) =>
    locales.map((locale) => ({
      params: { lang: locale, slug: recipe.data.paths[locale] },
      props: { recipe, locale },
    })),
  );
}) satisfies GetStaticPaths;

export const GET: APIRoute<Awaited<ReturnType<typeof getStaticPaths>>[number]["props"]> = async ({
  props,
}) => {
  const recipe = await resolveRecipe(props.recipe, props.locale, new URL(import.meta.env.SITE), {
    images: false,
  });
  return new Response(recipeMarkdown(recipe), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
