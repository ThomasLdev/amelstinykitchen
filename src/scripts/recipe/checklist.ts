/**
 * Checklist: checked count, localStorage persistence and reset.
 * Used by the ingredient list (shopping list).
 */

function initChecklist(root: HTMLElement): void {
  const storageKey = root.dataset.recipeChecklistStorage ?? "";
  const items = Array.from(root.querySelectorAll<HTMLInputElement>("[data-recipe-checklist-item]"));
  const countEl = root.querySelector<HTMLElement>("[data-recipe-checklist-count]");
  const resetBtn = root.querySelector<HTMLButtonElement>("[data-recipe-checklist-reset]");

  const persist = (): void => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items.map((item) => item.checked)));
    } catch {
      /* localStorage unavailable */
    }
  };

  const update = (): void => {
    const count = items.filter((item) => item.checked).length;
    if (countEl) countEl.textContent = String(count);
    persist();
  };

  const restore = (): void => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const state: unknown = JSON.parse(raw);
      if (!Array.isArray(state)) return;
      items.forEach((item, index) => {
        if (state[index] === true) item.checked = true;
      });
    } catch {
      /* corrupt localStorage entry */
    }
  };

  for (const item of items) item.addEventListener("change", update);

  resetBtn?.addEventListener("click", () => {
    for (const item of items) item.checked = false;
    update();
  });

  restore();
  update();
}

document.querySelectorAll<HTMLElement>("[data-recipe-checklist]").forEach(initChecklist);
