import { findTerms } from "@lib/content/recipe-search";

/** Ranges over the matched words of an element holding a single text node, for CSS highlights. */
export function termRanges(element: Element, terms: ReadonlySet<string>): Range[] {
  const text = element.firstChild;
  if (!(text instanceof Text)) return [];
  return findTerms(text.data, terms).map(([start, end]) => {
    const range = new Range();
    range.setStart(text, start);
    range.setEnd(text, end);
    return range;
  });
}
