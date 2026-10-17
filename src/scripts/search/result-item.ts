import { matchedIngredients } from "@lib/content/recipe-search";
import type { SearchEntry } from "@lib/content/search-index";
import { termRanges } from "./highlight";

export function resultItem(
  template: HTMLTemplateElement,
  entry: SearchEntry,
  terms: ReadonlySet<string>,
  matchLabel: string,
): { item: HTMLElement; ranges: Range[] } {
  const item = template.content.firstElementChild?.cloneNode(true) as HTMLElement;
  const link = item.querySelector("a");
  const image = item.querySelector("img");
  const title = item.querySelector<HTMLElement>("[data-search-title]");
  const meta = item.querySelector<HTMLElement>("[data-search-meta]");
  const match = item.querySelector<HTMLElement>("[data-search-match]");
  const ranges: Range[] = [];

  if (link) link.href = entry.href;
  if (image && entry.image) image.src = entry.image;
  if (meta) meta.textContent = entry.meta;
  if (title) {
    title.textContent = entry.title;
    ranges.push(...termRanges(title, terms));
  }
  const ingredients = matchedIngredients(entry.search.ingredients, terms);
  if (match && ingredients.length) {
    match.textContent = matchLabel.replace("%list%", ingredients.join(", "));
    match.hidden = false;
    ranges.push(...termRanges(match, terms));
  }
  return { item, ranges };
}
