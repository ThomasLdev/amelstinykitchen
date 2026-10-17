import { DEFAULT_STATE, type FilterState, isSortKey } from "@lib/content/recipe-filters";

export function readState(form: HTMLFormElement): FilterState {
  const data = new FormData(form);
  const sort = data.get("sort");
  return {
    category: String(data.get("category") ?? ""),
    season: String(data.get("season") ?? ""),
    tags: data.getAll("tag").map(String),
    query: String(data.get("q") ?? ""),
    sort: typeof sort === "string" && isSortKey(sort) ? sort : DEFAULT_STATE.sort,
  };
}

/** Unknown values (stale URL) fall back to "all" instead of leaving a group empty. */
export function checkRadio(form: HTMLFormElement, name: string, value: string): void {
  const radios = [...form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)];
  const target = radios.find((radio) => radio.value === value) ?? radios[0];
  if (target) target.checked = true;
}

/** The sort select is left to the sort control. */
export function writeState(form: HTMLFormElement, state: FilterState): void {
  checkRadio(form, "category", state.category);
  checkRadio(form, "season", state.season);
  for (const box of form.querySelectorAll<HTMLInputElement>('input[name="tag"]')) {
    box.checked = state.tags.includes(box.value);
  }
  const search = form.querySelector<HTMLInputElement>('input[name="q"]');
  if (search) search.value = state.query;
}
