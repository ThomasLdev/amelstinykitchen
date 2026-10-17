/**
 * Full-text recipe search, shared by the server (what gets indexed) and the
 * client (the index itself), so both read the same fields the same way.
 */

import MiniSearch from "minisearch";

/** Searchable text of a recipe; steps are left out, too generic ("four", "mélanger"). */
export interface SearchFields {
  title: string;
  /** Category, tags, seasons and SEO keywords. */
  labels: string;
  ingredients: string;
  excerpt: string;
}

/** Recipe id → relevance score; `undefined` when no query is typed. */
export type SearchHits = ReadonlyMap<string, number> | undefined;

/** Case- and accent-insensitive form, so "tarte" finds "Tarte" and "ete" finds "Été". */
function normalizeText(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      // Ligatures have no decomposed form, typed without them they must still match.
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae")
      .trim()
  );
}

// With AND, a linking word missing from the recipe ("velouté de poireaux") would empty the results.
const STOP_WORDS = new Set(
  "a au aux avec d de des du en et l la le les pour sans un une an and for in of the to with".split(
    " ",
  ),
);

const processTerm = (term: string): string | null => {
  const normalized = normalizeText(term);
  return normalized && !STOP_WORDS.has(normalized) ? normalized : null;
};

/** Only stop words ("de") is no query yet, rather than a query without results. */
export const hasQuery = (query: string): boolean => query.split(/[\p{Z}\p{P}]+/u).some(processTerm);

export function createRecipeSearch(
  recipes: Array<{ id: string; search: SearchFields }>,
): (query: string) => SearchHits {
  const index = new MiniSearch<{ id: string } & SearchFields>({
    fields: ["title", "labels", "ingredients", "excerpt"],
    processTerm,
    searchOptions: {
      boost: { title: 3, labels: 2, ingredients: 1.5 },
      combineWith: "AND",
      prefix: true,
      fuzzy: 0.2,
    },
  });
  index.addAll(recipes.map(({ id, search }) => ({ id, ...search })));

  return (query) => {
    if (!hasQuery(query)) return undefined;
    return new Map(index.search(query).map((hit) => [String(hit.id), hit.score]));
  };
}
