/**
 * Recipe list filters. The form controls hold the state, mirrored on the list
 * and in the URL. On phones the filters live in a modal sheet whose changes
 * stay a draft until "Show N recipes" is pressed; from 900px they apply
 * immediately.
 */

import type { Plural } from "@i18n/plural";
import {
  DEFAULT_STATE,
  type FilterState,
  removeFilter,
  stateFromParams,
  stateToParams,
} from "@lib/content/recipe-filters";
import type { SearchHits } from "@lib/content/recipe-search";
import { loadRecipeSearch, type RecipeSearch } from "../search/load-index";
import { createActiveFilters } from "./active-filters";
import { createFilterCounts } from "./filter-counts";
import { checkRadio, readState, writeState } from "./form-state";
import { renderMatches } from "./highlight";
import { createResults, readCards } from "./results";
import { createSortControl } from "./sort-control";

export interface BrowserStrings {
  count: Plural;
  apply: Plural;
  remove: string;
  query: string;
  match: string;
}

export function initRecipeBrowser(form: HTMLFormElement): void {
  const strings = JSON.parse(form.dataset.strings ?? "{}") as BrowserStrings;
  const list = form.querySelector<HTMLElement>("[data-recipe-list]");
  const sheet = form.querySelector<HTMLDialogElement>("[data-filters]");
  if (!list || !sheet) return;

  const cards = readCards(form);
  // Until the index is there, a query filters nothing; it applies once loaded.
  let index: RecipeSearch | undefined;
  let lastQuery: string | undefined;
  let lastHits: SearchHits;
  const hitsFor = (query: string): SearchHits => {
    if (query !== lastQuery) {
      lastQuery = query;
      lastHits = index?.search(query);
    }
    return lastHits;
  };

  const initial = stateFromParams(new URLSearchParams(location.search));
  let applied = initial;
  const syncSort = createSortControl(form, initial);
  const renderCounts = createFilterCounts(form, cards.recipes, strings.apply);
  const renderList = createResults(form, list, cards, strings.count);

  const write = (state: FilterState): void => writeState(form, syncSort(state));
  const isDraft = (): boolean => sheet.matches(":modal");

  const renderActive = createActiveFilters(form, strings, {
    remove: (name, value) => {
      write(removeFilter(applied, name, value));
      commit();
    },
    clear: () => {
      write({ ...DEFAULT_STATE, sort: applied.sort });
      commit();
    },
    pickCategory: (value) => {
      checkRadio(form, "category", value);
      commit();
    },
  });

  const renderControls = (state: FilterState): void => renderCounts(state, hitsFor(state.query));
  const renderResults = (state: FilterState): void => {
    const hits = hitsFor(state.query);
    renderList(state, hits);
    renderMatches(cards.rows, index?.entries, hits, strings.match);
    renderActive(state);
    const params = stateToParams(state).toString();
    history.replaceState(history.state, "", `${location.pathname}${params ? `?${params}` : ""}`);
  };
  const commit = (state: FilterState = readState(form)): void => {
    applied = state;
    renderControls(state);
    renderResults(state);
  };

  form.addEventListener("submit", (event) => event.preventDefault());
  form.addEventListener("input", () => {
    const state = syncSort(readState(form));
    if (isDraft()) renderControls(state);
    else commit(state);
  });

  form.querySelector("[data-filters-open]")?.addEventListener("click", () => {
    sheet.returnValue = "";
    sheet.showModal();
  });
  sheet.querySelector("[data-filters-apply]")?.addEventListener("click", () => {
    commit();
    sheet.close("apply");
  });
  sheet.querySelector("[data-filters-reset]")?.addEventListener("click", () => {
    write({ ...readState(form), category: "", season: "", tags: [] });
    renderControls(readState(form));
  });
  // Closing without applying (close button, Esc, backdrop, back to wide screen) drops the draft.
  sheet.addEventListener("close", () => {
    if (sheet.returnValue === "apply") return;
    write(applied);
    renderControls(applied);
  });

  write(initial);
  commit();
  for (const element of form.querySelectorAll<HTMLElement>("[data-enhanced]")) {
    element.hidden = false;
  }

  // Preloaded by the page. If it fails, the name filter stays inactive; the other filters work.
  loadRecipeSearch(form.dataset.searchIndex ?? "").then(
    (loaded) => {
      index = loaded;
      lastQuery = undefined;
      renderControls(isDraft() ? readState(form) : applied);
      renderResults(applied);
    },
    () => {},
  );
}
