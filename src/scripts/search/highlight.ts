import { findTerms } from "@lib/content/recipe-search";

/** Expects the element to hold a single text node. */
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

// Older browsers without the Custom Highlight API simply show no highlight.
export function setHighlight(name: string, ranges: Range[]): void {
  if (!("highlights" in CSS)) return;
  if (ranges.length) CSS.highlights.set(name, new Highlight(...ranges));
  else CSS.highlights.delete(name);
}
