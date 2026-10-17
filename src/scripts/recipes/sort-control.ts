import { type FilterState, followDefaultSort } from "@lib/content/recipe-filters";
import { hasQuery } from "@lib/content/recipe-search";

/**
 * Follows the default sort while the query changes, and offers relevance only
 * with one. `initial` is compared with itself, so a sort from the URL counts as
 * picked, not as a default to follow.
 */
export function createSortControl(
  form: HTMLFormElement,
  initial: FilterState,
): (state: FilterState) => FilterState {
  const select = form.elements.namedItem("sort");
  const relevance =
    select instanceof HTMLSelectElement
      ? select.querySelector<HTMLOptionElement>('option[value="relevance"]')
      : null;
  let last = initial;

  return (state) => {
    const next = followDefaultSort(last, state);
    last = next;
    const noQuery = !hasQuery(next.query);
    if (relevance) {
      relevance.hidden = noQuery;
      relevance.disabled = noQuery;
    }
    if (select instanceof HTMLSelectElement) select.value = next.sort;
    return next;
  };
}
