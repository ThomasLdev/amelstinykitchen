/**
 * Recipe list filters. The form controls hold the state; this module mirrors
 * it on the rendered list (visibility, order, counts, active chips) and in the
 * URL. On phones the filters live in a modal sheet whose changes stay a draft
 * until "Show N recipes" is pressed; from 900px they apply immediately.
 */

import {
  activeFilterCount,
  categoryCounts,
  DEFAULT_STATE,
  type FilterState,
  isSortKey,
  matches,
  normalizeText,
  type Plural,
  plural,
  type RecipeFacet,
  sortRecipes,
  stateFromParams,
  stateToParams,
} from "@lib/content/recipe-filters";

interface Strings {
  count: Plural;
  apply: Plural;
  remove: string;
  query: string;
}

const DESKTOP = "(min-width: 900px)";
/** Lets typing settle before the result count is announced. */
const ANNOUNCE_DELAY = 600;

export function initRecipeBrowser(form: HTMLFormElement): void {
  const strings = JSON.parse(form.dataset.strings ?? "{}") as Strings;
  const list = form.querySelector<HTMLElement>("[data-recipe-list]");
  const dialog = form.querySelector<HTMLDialogElement>("[data-filters]");
  if (!list || !dialog) return;

  const rows = new Map<string, HTMLElement>();
  const recipes: RecipeFacet[] = [];
  for (const card of form.querySelectorAll<HTMLElement>("[data-recipe-item]")) {
    const facet = JSON.parse(card.dataset.facet ?? "{}") as RecipeFacet;
    recipes.push({ ...facet, search: normalizeText(facet.search) });
    rows.set(facet.id, card.closest("li") ?? card);
  }

  const openButton = form.querySelector<HTMLButtonElement>("[data-filters-open]");
  const badge = form.querySelector<HTMLElement>("[data-filters-badge]");
  const applyButton = dialog.querySelector<HTMLButtonElement>("[data-filters-apply]");
  const countLabel = form.querySelector<HTMLElement>("[data-results-count]");
  const empty = form.querySelector<HTMLElement>("[data-results-empty]");
  const status = form.querySelector<HTMLElement>("[data-results-status]");
  const queryLabel = form.querySelector<HTMLElement>("[data-filter-query]");
  const search = form.querySelector<HTMLInputElement>('input[name="q"]');
  const chips = [...form.querySelectorAll<HTMLButtonElement>("[data-filter-remove]")];
  const clearButtons = [...form.querySelectorAll<HTMLButtonElement>("[data-filters-clear]")];
  const statusClear = form.querySelector<HTMLButtonElement>('[data-filters-clear="status"]');
  const quickChips = [...form.querySelectorAll<HTMLButtonElement>("[data-quick-category]")];

  const read = (): FilterState => {
    const data = new FormData(form);
    const sort = data.get("sort");
    return {
      category: String(data.get("category") ?? ""),
      season: String(data.get("season") ?? ""),
      tags: data.getAll("tag").map(String),
      query: String(data.get("q") ?? ""),
      sort: typeof sort === "string" && isSortKey(sort) ? sort : DEFAULT_STATE.sort,
    };
  };

  /** Unknown values (stale URL) fall back to "all" instead of leaving a group empty. */
  const checkRadio = (name: string, value: string): void => {
    const radios = [...form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)];
    const target = radios.find((radio) => radio.value === value) ?? radios[0];
    if (target) target.checked = true;
  };

  const write = (state: FilterState): void => {
    checkRadio("category", state.category);
    checkRadio("season", state.season);
    for (const box of form.querySelectorAll<HTMLInputElement>('input[name="tag"]')) {
      box.checked = state.tags.includes(box.value);
    }
    if (search) search.value = state.query;
    const sort = form.elements.namedItem("sort");
    if (sort instanceof HTMLSelectElement) sort.value = state.sort;
  };

  const isDraft = (): boolean => dialog.matches(":modal");

  /** Counts that follow the controls, including a draft in the open sheet. */
  const renderControls = (state: FilterState): void => {
    const counts = categoryCounts(recipes, state);
    for (const count of form.querySelectorAll<HTMLElement>("[data-filter-count]")) {
      count.textContent = String(counts.get(count.dataset.filterCount ?? "") ?? 0);
    }
    if (applyButton) {
      applyButton.textContent = plural(
        strings.apply,
        recipes.filter((recipe) => matches(recipe, state)).length,
      );
    }
  };

  let applied = read();
  let announce: number | undefined;

  const renderResults = (state: FilterState): void => {
    const visible = new Set(recipes.filter((recipe) => matches(recipe, state)).map((r) => r.id));
    for (const recipe of sortRecipes(recipes, state.sort)) {
      const row = rows.get(recipe.id);
      if (!row) continue;
      row.hidden = !visible.has(recipe.id);
      list.append(row);
    }
    if (empty) empty.hidden = visible.size > 0;
    const countText = plural(strings.count, visible.size);
    if (countLabel) countLabel.textContent = countText;
    window.clearTimeout(announce);
    announce = window.setTimeout(() => {
      if (status) status.textContent = countText;
    }, ANNOUNCE_DELAY);

    const isActive = (name: string, value: string): boolean =>
      name === "category"
        ? state.category === value
        : name === "season"
          ? state.season === value
          : state.tags.includes(value);
    const query = state.query.trim();
    for (const chip of chips) {
      const { filterRemove: name = "", filterValue: value = "" } = chip.dataset;
      chip.hidden = name === "q" ? !query : !isActive(name, value);
    }
    if (queryLabel && query) {
      const label = strings.query.replace("%query%", query);
      queryLabel.textContent = label;
      queryLabel
        .closest("button")
        ?.setAttribute("aria-label", strings.remove.replace("%label%", label));
    }

    const filterCount = activeFilterCount(state);
    if (statusClear) statusClear.hidden = filterCount === 0 && !query;
    if (badge) {
      badge.textContent = String(filterCount);
      badge.hidden = filterCount === 0;
    }
    openButton?.toggleAttribute("data-active", filterCount > 0);
    for (const chip of quickChips) {
      chip.setAttribute("aria-pressed", String(chip.dataset.quickCategory === state.category));
    }

    const params = stateToParams(state).toString();
    history.replaceState(history.state, "", `${location.pathname}${params ? `?${params}` : ""}`);
  };

  const commit = (state: FilterState = read()): void => {
    applied = state;
    renderControls(state);
    renderResults(state);
  };

  form.addEventListener("submit", (event) => event.preventDefault());
  form.addEventListener("input", () => (isDraft() ? renderControls(read()) : commit()));

  openButton?.addEventListener("click", () => {
    dialog.returnValue = "";
    dialog.showModal();
  });
  applyButton?.addEventListener("click", () => {
    commit();
    dialog.close("apply");
  });
  dialog.querySelector("[data-filters-close]")?.addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-filters-reset]")?.addEventListener("click", () => {
    write({ ...read(), category: "", season: "", tags: [] });
    renderControls(read());
  });
  // The panel fills the dialog, so a click on the dialog itself hit the backdrop.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  // Closing without applying (close button, Esc, backdrop) drops the draft.
  dialog.addEventListener("close", () => {
    if (dialog.returnValue === "apply") return;
    write(applied);
    renderControls(applied);
  });

  // From 900px the sheet is the sidebar: open but not modal. The attribute is
  // set directly because show() would move focus into it on page load.
  const desktop = window.matchMedia(DESKTOP);
  const syncLayout = (): void => {
    if (dialog.matches(":modal")) dialog.close();
    dialog.toggleAttribute("open", desktop.matches);
  };
  desktop.addEventListener("change", syncLayout);

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      const { filterRemove: name, filterValue: value } = chip.dataset;
      write({
        ...applied,
        category: name === "category" ? "" : applied.category,
        season: name === "season" ? "" : applied.season,
        tags: name === "tag" ? applied.tags.filter((tag) => tag !== value) : applied.tags,
        query: name === "q" ? "" : applied.query,
      });
      commit();
      // The pressed chip is now hidden: keep focus in the filters area.
      (chips.find((other) => !other.hidden) ?? search)?.focus();
    });
  }
  for (const button of clearButtons) {
    button.addEventListener("click", () => {
      write({ ...DEFAULT_STATE, sort: applied.sort });
      commit();
      search?.focus();
    });
  }
  for (const chip of quickChips) {
    chip.addEventListener("click", () => {
      checkRadio("category", chip.dataset.quickCategory ?? "");
      commit();
    });
  }

  write(stateFromParams(new URLSearchParams(location.search)));
  commit();
  syncLayout();
  for (const element of form.querySelectorAll<HTMLElement>("[data-enhanced]")) {
    element.hidden = false;
  }
}
