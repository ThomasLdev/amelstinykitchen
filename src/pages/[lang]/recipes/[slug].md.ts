import { getPublishedRecipes } from "@lib/content/recipe-catalog";
import { recipeMarkdown } from "@lib/seo/markdown";
import { resolveRecipe } from "@lib/seo/resolve";
import type { APIRoute, GetStaticPaths } from "astro";

/** Markdown twin of each recipe page, advertised by `<link rel="alternate" type="text/markdown">`. */
export const getStaticPaths = (async () => {
  const recipes = await getPublishedRecipes();

  return recipes.map((recipe) => ({
    params: { lang: recipe.data.locale, slug: recipe.data.paths },
    props: { recipe },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<Awaited<ReturnType<typeof getStaticPaths>>[number]["props"]> = async ({
  props,
}) => {
  const recipe = await resolveRecipe(props.recipe, new URL(import.meta.env.SITE), {
    images: false,
  });
  return new Response(recipeMarkdown(recipe), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
