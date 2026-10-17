import { useTranslations } from "@i18n";
import { llmsIntro, locales, resolvedRecipesByLocale } from "@lib/seo/llms";
import { recipeMarkdown } from "@lib/seo/markdown";
import { siteConfig } from "@site";
import type { APIRoute } from "astro";

/** Every recipe in full, in Markdown, so an agent can read the whole site in one request. */
export const GET: APIRoute = async () => {
  const recipes = await resolvedRecipesByLocale();
  const lines = llmsIntro(siteConfig.name);

  for (const locale of locales) {
    lines.push(`## ${useTranslations(locale).markdown.recipes} (${locale})`, "");
    for (const recipe of recipes[locale]) {
      // Recipe headings move down two levels under the site H1 and the locale H2.
      lines.push(recipeMarkdown(recipe).replace(/^(#+) /gm, "##$1 "), "---", "");
    }
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
