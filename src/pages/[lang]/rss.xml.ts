import { getAbsoluteLocaleUrl } from "astro:i18n";
import rss from "@astrojs/rss";
import { localeParams, toLocale, useTranslations } from "@i18n";
import { resolvedRecipesByLocale } from "@lib/seo/llms";
import { siteConfig } from "@site";
import type { APIRoute, GetStaticPaths } from "astro";

export const getStaticPaths = localeParams satisfies GetStaticPaths;

/** Recipe feed per locale (feed readers, Pinterest auto-publish). */
export const GET: APIRoute = async ({ params }) => {
  const locale = toLocale(params.lang);
  const t = useTranslations(locale);
  const recipes = (await resolvedRecipesByLocale())[locale];

  return rss({
    title: siteConfig.name,
    description: t.meta.description,
    site: getAbsoluteLocaleUrl(locale, ""),
    customData: `<language>${locale}</language>`,
    items: recipes.map((recipe) => ({
      title: recipe.title,
      link: recipe.url,
      description: recipe.description,
      pubDate: recipe.publishDate,
      categories: [recipe.category, ...recipe.keywords].filter((value) => value !== undefined),
    })),
  });
};
