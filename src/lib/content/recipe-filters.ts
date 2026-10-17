/**
 * Recipe list filtering and sorting, kept pure so the same rules order the
 * statically rendered list and drive the client-side filters.
 */

import { currentSeason } from "@lib/content/season";

/** Season filter value resolved in the browser, so a static link follows the date. */
export const CURRENT_SEASON = "current";

export const SORT_KEYS = ["popular", "recent", "quick"] as const;

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
  featured: boolean;
  /** Title, category and tag labels matched by the search field (normalized by the caller). */
  search: string;
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
  sort: "popular",
};

/** Case- and accent-insensitive form, so "tarte" finds "Tarte" and "ete" finds "Été". */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function matches(recipe: RecipeFacet, state: FilterState, skip?: "category"): boolean {
  if (skip !== "category" && state.category && recipe.category !== state.category) return false;
  if (state.season && !recipe.seasons.includes(state.season)) return false;
  if (!state.tags.every((tag) => recipe.tags.includes(tag))) return false;
  const query = normalizeText(state.query);
  return !query || recipe.search.includes(query);
}

/** The id breaks ties: getCollection() order is not deterministic. */
const compare: Record<SortKey, (a: RecipeFacet, b: RecipeFacet) => number> = {
  popular: (a, b) => Number(b.featured) - Number(a.featured) || b.date - a.date,
  recent: (a, b) => b.date - a.date,
  // Recipes without a known time go last rather than first.
  quick: (a, b) => (a.time || Infinity) - (b.time || Infinity) || b.date - a.date,
};

export function sortRecipes<T extends RecipeFacet>(recipes: T[], sort: SortKey): T[] {
  return [...recipes].sort((a, b) => compare[sort](a, b) || a.id.localeCompare(b.id));
}

/** Matches per category given the other filters; "" counts every category. */
export function categoryCounts(recipes: RecipeFacet[], state: FilterState): Map<string, number> {
  const counts = new Map<string, number>([["", 0]]);
  for (const recipe of recipes) {
    if (!matches(recipe, state, "category")) continue;
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

export function stateFromParams(params: URLSearchParams, now = new Date()): FilterState {
  const sort = params.get("sort");
  const season = params.get("season") ?? "";
  return {
    category: params.get("category") ?? "",
    season: season === CURRENT_SEASON ? currentSeason(now) : season,
    tags: params.getAll("tag"),
    query: params.get("q") ?? "",
    sort: isSortKey(sort) ? sort : DEFAULT_STATE.sort,
  };
}

/** Default values are left out so an unfiltered list keeps a bare URL. */
export function stateToParams(state: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.category) params.set("category", state.category);
  if (state.season) params.set("season", state.season);
  for (const tag of state.tags) params.append("tag", tag);
  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.sort !== DEFAULT_STATE.sort) params.set("sort", state.sort);
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
