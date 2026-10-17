// Kept apart from recipe-search.ts so pages load MiniSearch only when a search starts.

import {
  hasQuery,
  processQueryTerm,
  processTerm,
  type SearchFields,
  type SearchHits,
} from "@lib/content/recipe-search";
import MiniSearch from "minisearch";

/** Below this, one typo is a different word ("sel" / "sol"). */
const MIN_FUZZY_TERM = 5;

export function createRecipeSearch(
  recipes: Array<{ id: string; search: SearchFields }>,
): (query: string) => SearchHits {
  const index = new MiniSearch<{ id: string } & SearchFields>({
    fields: ["title", "labels", "ingredients", "excerpt"],
    extractField: (doc, field) => {
      const value = doc[field as keyof typeof doc];
      return Array.isArray(value) ? value.join(" ") : value;
    },
    processTerm,
    searchOptions: {
      boost: { title: 3, labels: 2, ingredients: 1.5 },
      processTerm: processQueryTerm,
      combineWith: "AND",
      prefix: true,
      fuzzy: (term) => (term.length >= MIN_FUZZY_TERM ? 0.2 : false),
    },
  });
  index.addAll(recipes.map(({ id, search }) => ({ id, ...search })));

  return (query) => {
    if (!hasQuery(query)) return undefined;
    return new Map(
      index
        .search(query)
        .map((hit) => [
          String(hit.id),
          { score: hit.score, terms: new Set(Object.keys(hit.match)) },
        ]),
    );
  };
}
