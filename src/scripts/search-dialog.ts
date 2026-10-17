/**
 * Header search: a dialog listing matching recipes while typing. The index is
 * fetched on first open (or already there on the recipes list).
 */

import { type Plural, plural } from "@lib/content/recipe-filters";
import { findTerms } from "@lib/content/recipe-search";
import { loadRecipeSearch, type RecipeSearch } from "./search-index";

interface Strings {
  count: Plural;
  empty: string;
  loading: string;
  error: string;
}

const HIGHLIGHT = "search-dialog";

function initSearchDialog(dialog: HTMLDialogElement): void {
  const input = dialog.querySelector<HTMLInputElement>("[data-search-input]");
  const list = dialog.querySelector<HTMLElement>("[data-search-results]");
  const status = dialog.querySelector<HTMLElement>("[data-search-status]");
  const template = dialog.querySelector<HTMLTemplateElement>("template[data-search-result]");
  if (!input || !list || !status || !template) return;
  const strings = JSON.parse(dialog.dataset.strings ?? "{}") as Strings;

  let index: RecipeSearch | undefined;
  let failed = false;

  const load = (): Promise<void> =>
    loadRecipeSearch(dialog.dataset.index ?? "").then(
      (loaded) => {
        index = loaded;
        failed = false;
      },
      () => {
        failed = true;
      },
    );

  const render = (): void => {
    if (!index) {
      list.replaceChildren();
      status.textContent = failed ? strings.error : input.value.trim() ? strings.loading : "";
      return;
    }
    const hits = index.search(input.value);
    const ranges: Range[] = [];
    const items = hits
      ? [...index.entries.values()]
          .filter((entry) => hits.has(entry.id))
          .sort(
            (a, b) =>
              (hits.get(b.id)?.score ?? 0) - (hits.get(a.id)?.score ?? 0) || b.date - a.date,
          )
          .map((entry) => {
            const item = template.content.firstElementChild?.cloneNode(true) as HTMLElement;
            const link = item.querySelector("a");
            const image = item.querySelector("img");
            const title = item.querySelector<HTMLElement>("[data-search-title]");
            const meta = item.querySelector<HTMLElement>("[data-search-meta]");
            if (link) link.href = entry.href;
            if (image && entry.image) image.src = entry.image;
            if (meta) meta.textContent = entry.meta;
            if (title) {
              title.textContent = entry.title;
              const text = title.firstChild;
              const terms = hits.get(entry.id)?.terms;
              if (text instanceof Text && terms) {
                for (const [start, end] of findTerms(text.data, terms)) {
                  const range = new Range();
                  range.setStart(text, start);
                  range.setEnd(text, end);
                  ranges.push(range);
                }
              }
            }
            return item;
          })
      : [];

    list.replaceChildren(...items);
    status.textContent = !hits
      ? ""
      : items.length
        ? plural(strings.count, items.length)
        : strings.empty;
    if ("highlights" in CSS) {
      if (ranges.length) CSS.highlights.set(HIGHLIGHT, new Highlight(...ranges));
      else CSS.highlights.delete(HIGHLIGHT);
    }
  };

  const open = (): void => {
    if (dialog.open) return;
    dialog.showModal();
    input.select();
    render();
    load().then(render);
  };

  input.addEventListener("input", render);
  // No form to submit: on touch screens Enter only closes the keyboard.
  const touch = window.matchMedia("(pointer: coarse)");
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && touch.matches) input.blur();
  });

  for (const button of document.querySelectorAll("[data-search-open]")) {
    button.addEventListener("click", open);
  }

  // A modifier is required: single-key shortcuts fire by accident with speech input (WCAG 2.1.4).
  document.addEventListener("keydown", (event) => {
    if (event.isComposing || event.defaultPrevented) return;
    if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey) || event.altKey)
      return;
    event.preventDefault();
    open();
  });
}

const dialog = document.querySelector<HTMLDialogElement>("[data-search-dialog]");
if (dialog) initSearchDialog(dialog);
