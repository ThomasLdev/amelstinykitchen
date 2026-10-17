/**
 * Header search: a dialog listing matching recipes while typing. The index is
 * fetched on first open (or already there on the recipes list).
 */

import { type Plural, plural } from "@i18n/plural";
import { byRelevance } from "@lib/content/recipe-search";
import { setHighlight } from "./highlight";
import { loadRecipeSearch, type RecipeSearch } from "./load-index";
import { resultItem } from "./result-item";

export interface SearchDialogStrings {
  count: Plural;
  empty: string;
  loading: string;
  error: string;
  match: string;
}

const HIGHLIGHT = "search-dialog";

// A modifier is required: single-key shortcuts fire by accident with speech input (WCAG 2.1.4).
function onShortcut(open: () => void): void {
  document.addEventListener("keydown", (event) => {
    if (event.isComposing || event.defaultPrevented) return;
    if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey) || event.altKey)
      return;
    event.preventDefault();
    open();
  });
}

function initSearchDialog(dialog: HTMLDialogElement): void {
  const input = dialog.querySelector<HTMLInputElement>("[data-search-input]");
  const list = dialog.querySelector<HTMLElement>("[data-search-results]");
  const status = dialog.querySelector<HTMLElement>("[data-search-status]");
  const template = dialog.querySelector<HTMLTemplateElement>("template[data-search-result]");
  if (!input || !list || !status || !template) return;
  const strings = JSON.parse(dialog.dataset.strings ?? "{}") as SearchDialogStrings;

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
    const results = hits
      ? [...index.entries.values()]
          .filter((entry) => hits.has(entry.id))
          .sort(byRelevance(hits))
          .map((entry) =>
            resultItem(template, entry, hits.get(entry.id)?.terms ?? new Set(), strings.match),
          )
      : [];

    list.replaceChildren(...results.map(({ item }) => item));
    status.textContent = !hits
      ? ""
      : results.length
        ? plural(strings.count, results.length)
        : strings.empty;
    setHighlight(
      HIGHLIGHT,
      results.flatMap(({ ranges }) => ranges),
    );
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
  onShortcut(open);
}

const dialog = document.querySelector<HTMLDialogElement>("[data-search-dialog]");
if (dialog) initSearchDialog(dialog);
