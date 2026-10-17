/**
 * Recipe list filtering and sorting, kept pure so the same rules order the
 * statically rendered list and drive the client-side filters.
 */

import { hasQuery, type SearchHits } from "@lib/content/recipe-search";

export const SORT_KEYS = ["relevance", "recent", "quick"] as const;

export type SortKey = (typeof SORT_KEYS)[number];

export interface RecipeFacet {
  id: string;
  category: string;
  seasons: string[];
  tags: string[];
  /** Total time in minutes; 0 when unknown. */
  time: number;
  /** Publication timestamp (ms). */
  date: number;
}

export interface FilterState {
  /** "" means every category. */
  category: string;
  /** "" means every season. */
  season: string;
  tags: string[];
  query: string;
  sort: SortKey;
}

export const DEFAULT_STATE: FilterState = {
  category: "",
  season: "",
  tags: [],
  query: "",
  sort: "recent",
};

/** Relevance only means something for a query; without one the newest come first. */
const defaultSort = (query: string): SortKey => (hasQuery(query) ? "relevance" : "recent");

/**
 * Keeps the sort on its default while the visitor has not picked one, so
 * typing a query switches to relevance and clearing it switches back.
 */
export function followDefaultSort(previous: FilterState, next: FilterState): FilterState {
  const untouched = next.sort === previous.sort && previous.sort === defaultSort(previous.query);
  if (untouched) return { ...next, sort: defaultSort(next.query) };
  if (next.sort === "relevance" && !hasQuery(next.query)) return { ...next, sort: "recent" };
  return next;
}

export function matches(
  recipe: RecipeFacet,
  state: FilterState,
  hits: SearchHits,
  skip?: "category",
): boolean {
  if (skip !== "category" && state.category && recipe.category !== state.category) return false;
  if (state.season && !recipe.seasons.includes(state.season)) return false;
  if (!state.tags.every((tag) => recipe.tags.includes(tag))) return false;
  return !hits || hits.has(recipe.id);
}

type Compare = (a: RecipeFacet, b: RecipeFacet, hits: SearchHits) => number;

/** The id breaks ties: getCollection() order is not deterministic. */
const compare: Record<SortKey, Compare> = {
  relevance: (a, b, hits) =>
    (hits?.get(b.id)?.score ?? 0) - (hits?.get(a.id)?.score ?? 0) || b.date - a.date,
  recent: (a, b) => b.date - a.date,
  // Recipes without a known time go last rather than first.
  quick: (a, b) => (a.time || Infinity) - (b.time || Infinity) || b.date - a.date,
};

export function sortRecipes<T extends RecipeFacet>(
  recipes: T[],
  sort: SortKey,
  hits?: SearchHits,
): T[] {
  return [...recipes].sort((a, b) => compare[sort](a, b, hits) || a.id.localeCompare(b.id));
}

/** Matches per category given the other filters; "" counts every category. */
export function categoryCounts(
  recipes: RecipeFacet[],
  state: FilterState,
  hits: SearchHits,
): Map<string, number> {
  const counts = new Map<string, number>([["", 0]]);
  for (const recipe of recipes) {
    if (!matches(recipe, state, hits, "category")) continue;
    counts.set("", (counts.get("") ?? 0) + 1);
    counts.set(recipe.category, (counts.get(recipe.category) ?? 0) + 1);
  }
  return counts;
}

/** Filters behind the mobile "Filters" button; the name filter has its own field. */
export function activeFilterCount(state: FilterState): number {
  return Number(Boolean(state.category)) + Number(Boolean(state.season)) + state.tags.length;
}

export const isSortKey = (value: string | null): value is SortKey =>
  SORT_KEYS.includes(value as SortKey);

export function stateFromParams(params: URLSearchParams): FilterState {
  const query = params.get("q") ?? "";
  const sort = params.get("sort");
  return {
    category: params.get("category") ?? "",
    season: params.get("season") ?? "",
    tags: params.getAll("tag"),
    query,
    sort:
      isSortKey(sort) && !(sort === "relevance" && !hasQuery(query)) ? sort : defaultSort(query),
  };
}

/** Default values are left out so an unfiltered list keeps a bare URL. */
export function stateToParams(state: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.category) params.set("category", state.category);
  if (state.season) params.set("season", state.season);
  for (const tag of state.tags) params.append("tag", tag);
  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.sort !== defaultSort(state.query)) params.set("sort", state.sort);
  return params;
}

export interface Plural {
  zero: string;
  one: string;
  other: string;
}

export function plural(forms: Plural, count: number): string {
  const form = count === 0 ? forms.zero : count === 1 ? forms.one : forms.other;
  return form.replace("%count%", String(count));
}
