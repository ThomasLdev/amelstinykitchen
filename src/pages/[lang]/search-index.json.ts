import { getImage } from "astro:assets";
import { localeParams, toLocale } from "@i18n";
import { formatDuration } from "@lib/content/recipe";
import { factsLine, recipeHref } from "@lib/content/recipe-card";
import { loadRecipeCatalog } from "@lib/content/recipe-catalog";
import type { SearchEntry } from "@lib/content/search-index";
import type { APIRoute } from "astro";

export const getStaticPaths = localeParams;

/** Loaded by the header search on first open: every page can search without carrying the data. */
export const GET: APIRoute = async ({ params }) => {
  const locale = toLocale(params.lang);
  const catalog = await loadRecipeCatalog(locale);

  const entries: SearchEntry[] = await Promise.all(
    catalog.map(async ({ recipe, categoryLabel, time, search }) => {
      const cover = recipe.data.media[0];
      const thumb =
        cover &&
        (await getImage({ src: cover.src, width: 112, height: 112, fit: "cover", format: "webp" }));
      return {
        id: recipe.data.translationKey,
        href: recipeHref(recipe, locale),
        title: recipe.data.title,
        meta: factsLine([categoryLabel, formatDuration(time, locale)]),
        ...(thumb && { image: thumb.src }),
        date: recipe.data.publishDate.valueOf(),
        search,
      };
    }),
  );

  return Response.json(entries);
};
