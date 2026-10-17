/** Recipe header actions: native print and share (with a clipboard fallback). */

/** Lazy images below the fold may not be loaded yet: fetch them before printing. */
async function loadLazyImages(): Promise<void> {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]'));
  for (const image of images) image.loading = "eager";
  await Promise.all(images.map((image) => image.decode().catch(() => {})));
}

function initActions(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-recipe-action-print]")) {
    button.addEventListener("click", async () => {
      await loadLazyImages();
      window.print();
    });
  }

  // Browser print shortcut (Ctrl/⌘+P): cannot be delayed, best effort.
  window.addEventListener("beforeprint", () => {
    loadLazyImages();
  });

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

initActions();
