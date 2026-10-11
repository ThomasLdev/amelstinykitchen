/** Recipe header actions: native print and share (with a clipboard fallback). */

export function initActions(): void {
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
