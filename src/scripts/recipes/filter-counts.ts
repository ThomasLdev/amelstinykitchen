import { type Plural, plural } from "@i18n/plural";
import {
  categoryCounts,
  type FilterState,
  matches,
  type RecipeFacet,
} from "@lib/content/recipe-filters";
import type { SearchHits } from "@lib/content/recipe-search";

/** Follows the controls, including a draft in the open sheet. */
export function createFilterCounts(
  form: HTMLFormElement,
  recipes: RecipeFacet[],
  applyForms: Plural,
): (state: FilterState, hits: SearchHits) => void {
  const counts = [...form.querySelectorAll<HTMLElement>("[data-filter-count]")];
  const applyButton = form.querySelector<HTMLButtonElement>("[data-filters-apply]");

  return (state, hits) => {
    const byCategory = categoryCounts(recipes, state, hits);
    for (const count of counts) {
      count.textContent = String(byCategory.get(count.dataset.filterCount ?? "") ?? 0);
    }
    if (applyButton) {
      applyButton.textContent = plural(
        applyForms,
        recipes.filter((recipe) => matches(recipe, state, hits)).length,
      );
    }
  };
}
