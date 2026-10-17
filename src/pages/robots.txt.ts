import { getRelativeLocaleUrl } from "astro:i18n";
import { languages } from "@i18n";
import type { APIRoute } from "astro";

/** AI crawlers are welcome: recipes are meant to be found and cited by agents too. */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

export const GET: APIRoute = ({ site }) => {
  // The search page does not exist yet; its `?q=` links must not be crawled.
  const searchPaths = Object.keys(languages).map(
    (locale) => `Disallow: ${getRelativeLocaleUrl(locale, "search").replace(/\/$/, "")}`,
  );

  const body = [
    "User-agent: *",
    "Allow: /",
    ...searchPaths,
    "",
    ...AI_CRAWLERS.flatMap((agent) => [`User-agent: ${agent}`, "Allow: /", ...searchPaths, ""]),
    `Sitemap: ${new URL("sitemap-index.xml", site).href}`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
