/**
 * Mobile recipe view: buttons that switch the ingredients/steps segmented
 * control (the panels themselves are toggled in CSS via `:has()`). The
 * buttons are rendered `hidden` and only revealed once wired up here.
 */

export function initView(root: HTMLElement): void {
  const scope = root.parentElement ?? document;

  for (const button of scope.querySelectorAll<HTMLButtonElement>("[data-recipe-view-show]")) {
    const value = button.dataset.recipeViewShow ?? "";
    const input = root.querySelector<HTMLInputElement>(`input[value="${CSS.escape(value)}"]`);
    if (!input) continue;

    button.hidden = false;
    button.addEventListener("click", () => {
      input.checked = true;
      input.focus({ preventScroll: true });
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      root.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }
}
