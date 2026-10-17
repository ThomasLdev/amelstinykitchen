import { activeFilterCount, type FilterState } from "@lib/content/recipe-filters";

interface Labels {
  remove: string;
  query: string;
}

interface Actions {
  remove: (name: string, value: string) => void;
  clear: () => void;
  pickCategory: (value: string) => void;
}

export function createActiveFilters(
  form: HTMLFormElement,
  labels: Labels,
  actions: Actions,
): (state: FilterState) => void {
  const chips = [...form.querySelectorAll<HTMLButtonElement>("[data-filter-remove]")];
  const queryLabel = form.querySelector<HTMLElement>("[data-filter-query]");
  const statusClear = form.querySelector<HTMLButtonElement>('[data-filters-clear="status"]');
  const badge = form.querySelector<HTMLElement>("[data-filters-badge]");
  const openButton = form.querySelector<HTMLButtonElement>("[data-filters-open]");
  const quickChips = [...form.querySelectorAll<HTMLButtonElement>("[data-quick-category]")];
  const search = form.querySelector<HTMLInputElement>('input[name="q"]');

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      actions.remove(chip.dataset.filterRemove ?? "", chip.dataset.filterValue ?? "");
      // The pressed chip is now hidden: keep focus in the filters area.
      (chips.find((other) => !other.hidden) ?? search)?.focus();
    });
  }
  for (const button of form.querySelectorAll<HTMLButtonElement>("[data-filters-clear]")) {
    button.addEventListener("click", () => {
      actions.clear();
      search?.focus();
    });
  }
  for (const chip of quickChips) {
    chip.addEventListener("click", () => actions.pickCategory(chip.dataset.quickCategory ?? ""));
  }

  const isActive = (state: FilterState, name: string, value: string): boolean =>
    name === "category"
      ? state.category === value
      : name === "season"
        ? state.season === value
        : state.tags.includes(value);

  return (state) => {
    const query = state.query.trim();
    for (const chip of chips) {
      const { filterRemove: name = "", filterValue: value = "" } = chip.dataset;
      chip.hidden = name === "q" ? !query : !isActive(state, name, value);
    }
    if (queryLabel && query) {
      const label = labels.query.replace("%query%", query);
      queryLabel.textContent = label;
      queryLabel
        .closest("button")
        ?.setAttribute("aria-label", labels.remove.replace("%label%", label));
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
  };
}
