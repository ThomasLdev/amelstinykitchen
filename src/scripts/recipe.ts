/**
 * Recipe view behaviors, ported from the Symfony Stimulus controllers
 * (`recipe_portions`, `recipe_checklist`) to progressive-enhancement vanilla JS.
 */

function formatQuantity(value: number, locale: string): string {
  if (value >= 10) return String(Math.round(value));
  if (Number.isInteger(value)) return String(value);
  const rounded = String(Math.round(value * 10) / 10);
  return locale === "fr" ? rounded.replace(".", ",") : rounded;
}

function initPortions(root: HTMLElement): void {
  const base = Number(root.dataset.recipePortionsBase ?? "4");
  const min = Number(root.dataset.recipePortionsMin ?? "1");
  const max = Number(root.dataset.recipePortionsMax ?? "24");
  const locale = root.dataset.locale ?? "fr";

  const valueEl = root.querySelector<HTMLElement>("[data-recipe-portions-value]");
  const decreaseBtn = root.querySelector<HTMLButtonElement>("[data-recipe-portions-decrease]");
  const increaseBtn = root.querySelector<HTMLButtonElement>("[data-recipe-portions-increase]");
  const servingsEl = root.querySelector<HTMLElement>("[data-recipe-portions-servings]");
  const quantities = Array.from(
    root.querySelectorAll<HTMLElement>("[data-recipe-portions-quantity]"),
  );

  let current = base;

  const render = (): void => {
    if (valueEl) valueEl.textContent = String(current);

    if (servingsEl) {
      const template = current === 1 ? servingsEl.dataset.singular : servingsEl.dataset.plural;
      if (template) servingsEl.textContent = template.replace("%count%", String(current));
    }

    const ratio = base > 0 ? current / base : 1;
    for (const el of quantities) {
      const baseQuantity = Number(el.dataset.baseQuantity);
      if (Number.isNaN(baseQuantity)) continue;
      el.textContent = formatQuantity(baseQuantity * ratio, locale);
    }

    if (decreaseBtn) decreaseBtn.disabled = current <= min;
    if (increaseBtn) increaseBtn.disabled = current >= max;
  };

  decreaseBtn?.addEventListener("click", () => {
    if (current <= min) return;
    current -= 1;
    render();
  });

  increaseBtn?.addEventListener("click", () => {
    if (current >= max) return;
    current += 1;
    render();
  });

  render();
}

function initChecklist(root: HTMLElement): void {
  const storageKey = root.dataset.recipeChecklistStorage ?? "";
  // A checklist can nest another one (the steps list wraps the ingredients
  // aside); only own the items whose nearest checklist root is this element.
  const items = Array.from(
    root.querySelectorAll<HTMLInputElement>("[data-recipe-checklist-item]"),
  ).filter((item) => item.closest("[data-recipe-checklist]") === root);
  const countEl = root.querySelector<HTMLElement>("[data-recipe-checklist-count]");
  const progressEl = root.querySelector<HTMLElement>("[data-recipe-checklist-progress]");
  const resetBtn = root.querySelector<HTMLButtonElement>("[data-recipe-checklist-reset]");
  const declaredTotal = Number(root.dataset.recipeChecklistTotal ?? "0");

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

    if (progressEl) {
      const total = declaredTotal || items.length;
      const ratio = total > 0 ? Math.round((count / total) * 100) : 0;
      progressEl.style.setProperty("--progress", String(ratio));
      progressEl.dataset.count = String(count);
      progressEl.dataset.total = String(total);
    }

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

function wireActions(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-recipe-action-print]")) {
    button.addEventListener("click", () => window.print());
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-recipe-action-share]")) {
    button.addEventListener("click", () => {
      if (navigator.share) {
        navigator.share({ title: document.title, url: window.location.href }).catch(() => {});
        return;
      }
      navigator.clipboard?.writeText(window.location.href).catch(() => {});
    });
  }
}

function boot(): void {
  document.querySelectorAll<HTMLElement>("[data-recipe-portions]").forEach(initPortions);
  document.querySelectorAll<HTMLElement>("[data-recipe-checklist]").forEach(initChecklist);
  wireActions();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
