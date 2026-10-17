import { type Plural, plural } from "@i18n/plural";
import {
  type FilterState,
  matches,
  type RecipeFacet,
  sortRecipes,
} from "@lib/content/recipe-filters";
import type { SearchHits } from "@lib/content/recipe-search";

/** Lets typing settle before the result count is announced. */
const ANNOUNCE_DELAY = 600;

export function readCards(form: HTMLFormElement): {
  recipes: RecipeFacet[];
  rows: Map<string, HTMLElement>;
} {
  const recipes: RecipeFacet[] = [];
  const rows = new Map<string, HTMLElement>();
  for (const card of form.querySelectorAll<HTMLElement>("[data-recipe-item]")) {
    const facet = JSON.parse(card.dataset.facet ?? "{}") as RecipeFacet;
    recipes.push(facet);
    rows.set(facet.id, card.closest("li") ?? card);
  }
  return { recipes, rows };
}

export function createResults(
  form: HTMLFormElement,
  list: HTMLElement,
  cards: { recipes: RecipeFacet[]; rows: ReadonlyMap<string, HTMLElement> },
  countForms: Plural,
): (state: FilterState, hits: SearchHits) => void {
  const { recipes, rows } = cards;
  const countLabel = form.querySelector<HTMLElement>("[data-results-count]");
  const empty = form.querySelector<HTMLElement>("[data-results-empty]");
  const status = form.querySelector<HTMLElement>("[data-results-status]");
  let announce: number | undefined;

  return (state, hits) => {
    const visible = new Set(
      recipes.filter((recipe) => matches(recipe, state, hits)).map((recipe) => recipe.id),
    );
    for (const recipe of sortRecipes(recipes, state.sort, hits)) {
      const row = rows.get(recipe.id);
      if (!row) continue;
      row.hidden = !visible.has(recipe.id);
      list.append(row);
    }

    if (empty) empty.hidden = visible.size > 0;
    const countText = plural(countForms, visible.size);
    if (countLabel) countLabel.textContent = countText;
    window.clearTimeout(announce);
    announce = window.setTimeout(() => {
      if (status) status.textContent = countText;
    }, ANNOUNCE_DELAY);
  };
}
