/**
 * Servings scaler: rescales ingredient quantities.
 * Ported from the Symfony `recipe_portions` Stimulus controller.
 */

function formatQuantity(value: number, locale: string): string {
  if (value >= 10) return String(Math.round(value));
  if (Number.isInteger(value)) return String(value);
  const rounded = String(Math.round(value * 10) / 10);
  return locale === "fr" ? rounded.replace(".", ",") : rounded;
}

export function initPortions(root: HTMLElement): void {
  const base = Number(root.dataset.recipePortionsBase ?? "4");
  const min = Number(root.dataset.recipePortionsMin ?? "1");
  const max = Number(root.dataset.recipePortionsMax ?? "24");
  const locale = root.dataset.locale ?? "fr";

  const valueEl = root.querySelector<HTMLElement>("[data-recipe-portions-value]");
  const decreaseBtn = root.querySelector<HTMLButtonElement>("[data-recipe-portions-decrease]");
  const increaseBtn = root.querySelector<HTMLButtonElement>("[data-recipe-portions-increase]");
  const quantities = Array.from(
    root.querySelectorAll<HTMLElement>("[data-recipe-portions-quantity]"),
  );

  let current = base;

  const render = (): void => {
    if (valueEl) valueEl.textContent = String(current);

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
