import { getRelativeLocaleUrl } from "astro:i18n";
import type { Locale } from "@i18n";
import type { SearchFields } from "@lib/content/recipe-search";

/** One recipe of the search index (`/[lang]/search-index.json`). */
export interface SearchEntry {
  id: string;
  href: string;
  title: string;
  /** Category and total time. */
  meta: string;
  /** 112 px square thumbnail. */
  image?: string;
  /** Publication timestamp (ms), to order equal scores. */
  date: number;
  search: SearchFields;
}

export const searchIndexUrl = (locale: Locale): string =>
  // Endpoints with an extension are served without the trailing slash.
  getRelativeLocaleUrl(locale, "search-index.json").replace(/\/$/, "");
