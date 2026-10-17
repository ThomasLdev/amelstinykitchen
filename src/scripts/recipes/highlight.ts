import type { RecipeFacet } from "@lib/content/recipe-filters";
import { findTerms, type SearchHits } from "@lib/content/recipe-search";

const HIGHLIGHT = "recipe-search";

/**
 * Shows why each card matched: its matched words highlighted (CSS Custom
 * Highlight API, nothing on older browsers) and the matched ingredients,
 * which the card does not display otherwise.
 */
export function renderMatches(
  recipes: RecipeFacet[],
  rows: ReadonlyMap<string, HTMLElement>,
  hits: SearchHits,
  label: string,
): void {
  const ranges: Range[] = [];
  for (const recipe of recipes) {
    const row = rows.get(recipe.id);
    const hit = hits?.get(recipe.id);
    if (!row) continue;

    const line = row.querySelector<HTMLElement>("[data-search-match]");
    if (line) {
      const ingredients = hit
        ? [...new Set(recipe.search.ingredients)].filter(
            (name) => findTerms(name, hit.terms).length,
          )
        : [];
      line.textContent = ingredients.length ? label.replace("%list%", ingredients.join(", ")) : "";
      line.hidden = ingredients.length === 0;
    }

    if (!hit) continue;
    for (const element of row.querySelectorAll<HTMLElement>("[data-search-text]")) {
      const text = element.firstChild;
      if (!(text instanceof Text)) continue;
      for (const [start, end] of findTerms(text.data, hit.terms)) {
        const range = new Range();
        range.setStart(text, start);
        range.setEnd(text, end);
        ranges.push(range);
      }
    }
  }

  if (!("highlights" in CSS)) return;
  if (ranges.length) CSS.highlights.set(HIGHLIGHT, new Highlight(...ranges));
  else CSS.highlights.delete(HIGHLIGHT);
}
