import { matchedIngredients, type SearchEntry, type SearchHits } from "@lib/content/recipe-search";
import { termRanges } from "../term-ranges";

const HIGHLIGHT = "recipe-search";

/**
 * Shows why each card matched: its matched words highlighted (CSS Custom
 * Highlight API, nothing on older browsers) and the matched ingredients,
 * which the card does not display otherwise.
 */
export function renderMatches(
  rows: ReadonlyMap<string, HTMLElement>,
  entries: ReadonlyMap<string, SearchEntry> | undefined,
  hits: SearchHits,
  label: string,
): void {
  const ranges: Range[] = [];
  for (const [id, row] of rows) {
    const hit = hits?.get(id);

    const line = row.querySelector<HTMLElement>("[data-search-match]");
    if (line) {
      const ingredients = hit
        ? matchedIngredients(entries?.get(id)?.search.ingredients ?? [], hit.terms)
        : [];
      line.textContent = ingredients.length ? label.replace("%list%", ingredients.join(", ")) : "";
      line.hidden = ingredients.length === 0;
    }

    if (!hit) continue;
    for (const element of row.querySelectorAll("[data-search-text]")) {
      ranges.push(...termRanges(element, hit.terms));
    }
  }

  if (!("highlights" in CSS)) return;
  if (ranges.length) CSS.highlights.set(HIGHLIGHT, new Highlight(...ranges));
  else CSS.highlights.delete(HIGHLIGHT);
}
