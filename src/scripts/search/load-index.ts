/**
 * The recipe search index, fetched and built once per page: the recipes list
 * and the header search share it.
 */

import type { SearchHits } from "@lib/content/recipe-search";
import type { SearchEntry } from "@lib/content/search-index";

export interface RecipeSearch {
  entries: ReadonlyMap<string, SearchEntry>;
  search: (query: string) => SearchHits;
}

const loads = new Map<string, Promise<RecipeSearch>>();

export function loadRecipeSearch(url: string): Promise<RecipeSearch> {
  let load = loads.get(url);
  if (!load) {
    load = Promise.all([
      fetch(url).then((response) => {
        if (!response.ok) throw new Error(`Search index: HTTP ${response.status}`);
        return response.json() as Promise<SearchEntry[]>;
      }),
      import("@lib/content/recipe-search-engine"),
    ]).then(([list, { createRecipeSearch }]) => ({
      entries: new Map(list.map((entry) => [entry.id, entry])),
      search: createRecipeSearch(list),
    }));
    // A failed load is retried by the next caller.
    load.catch(() => loads.delete(url));
    loads.set(url, load);
  }
  return load;
}
