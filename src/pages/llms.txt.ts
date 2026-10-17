import { locales, useTranslations } from "@i18n";
import { llmsIntro, resolvedRecipesByLocale } from "@lib/seo/llms";
import { siteConfig } from "@site";
import type { APIRoute } from "astro";

/** https://llmstxt.org — an index of the site for LLMs, linking each recipe's Markdown twin. */
export const GET: APIRoute = async () => {
  const recipes = await resolvedRecipesByLocale();
  const lines = llmsIntro(siteConfig.name);

  for (const locale of locales) {
    lines.push(`## ${useTranslations(locale).markdown.recipes} (${locale})`, "");
    for (const recipe of recipes[locale]) {
      const summary = recipe.description ? `: ${recipe.description}` : "";
      lines.push(`- [${recipe.title}](${recipe.markdownUrl})${summary}`);
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
