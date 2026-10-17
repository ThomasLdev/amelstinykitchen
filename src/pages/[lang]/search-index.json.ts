import { getImage } from "astro:assets";
import { getRelativeLocaleUrl } from "astro:i18n";
import { defaultLocale, isLocale, languages } from "@i18n";
import { formatDuration } from "@lib/content/recipe";
import { loadRecipeCatalog } from "@lib/content/recipe-catalog";
import type { SearchEntry } from "@lib/content/recipe-search";
import type { APIRoute } from "astro";

export function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }));
}

/** Loaded by the header search on first open: every page can search without carrying the data. */
export const GET: APIRoute = async ({ params }) => {
  const locale = isLocale(params.lang) ? params.lang : defaultLocale;
  const catalog = await loadRecipeCatalog(locale);

  const entries: SearchEntry[] = await Promise.all(
    catalog.map(async ({ recipe, categoryLabel, time, search }) => {
      const cover = recipe.data.media[0];
      const thumb =
        cover &&
        (await getImage({ src: cover.src, width: 112, height: 112, fit: "cover", format: "webp" }));
      return {
        id: recipe.data.translationKey,
        href: getRelativeLocaleUrl(locale, `recipes/${recipe.data.paths}`),
        title: recipe.data.title,
        meta: [categoryLabel, formatDuration(time, locale)].filter(Boolean).join(" · "),
        ...(thumb && { image: thumb.src }),
        date: recipe.data.publishDate.valueOf(),
        search,
      };
    }),
  );

  return Response.json(entries);
};
