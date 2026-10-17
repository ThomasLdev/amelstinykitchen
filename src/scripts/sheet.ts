/**
 * Shared Sheet behavior: the close button, a click on the backdrop and, where
 * it is a bottom sheet, dragging its header down close it; a `sidebar` sheet
 * stays open in the page on wide screens. Opening, and what closing means,
 * stay with each sheet's owner script.
 */

/** Share of the sheet height past which a release closes it. */
const CLOSE_DISTANCE = 0.25;
/** A quick downward flick at release closes it whatever the distance (px/ms). */
const CLOSE_VELOCITY = 0.5;
/** Below this the gesture is a tap, left to the buttons of the header (px). */
const DRAG_START = 6;

function initDrag(sheet: HTMLDialogElement): void {
  const media = window.matchMedia(sheet.dataset.sheetDrag ?? "not all");
  let start: { y: number; id: number } | undefined;
  // Last two positions: the speed at release, not over the whole gesture, tells a flick.
  let last = { y: 0, time: 0 };
  let velocity = 0;
  let offset = 0;

  const release = (close: boolean): void => {
    // Dropping the inline values lets the CSS transitions run from where the finger left it.
    sheet.style.removeProperty("transition");
    sheet.style.removeProperty("translate");
    if (close) sheet.close();
    start = undefined;
    offset = 0;
    velocity = 0;
  };

  for (const handle of sheet.querySelectorAll<HTMLElement>("[data-sheet-handle]")) {
    handle.addEventListener("pointerdown", (event) => {
      if (!media.matches || !sheet.matches(":modal") || !event.isPrimary) return;
      if ((event.target as Element).closest("button, a, input")) return;
      start = { y: event.clientY, id: event.pointerId };
      last = { y: event.clientY, time: event.timeStamp };
      handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener("pointermove", (event) => {
      if (!start || event.pointerId !== start.id) return;
      const elapsed = event.timeStamp - last.time;
      if (elapsed > 0) velocity = (event.clientY - last.y) / elapsed;
      last = { y: event.clientY, time: event.timeStamp };
      offset = Math.max(0, event.clientY - start.y);
      if (offset < DRAG_START && !sheet.style.translate) return;
      sheet.style.transition = "none";
      sheet.style.translate = `0 ${offset}px`;
    });

    const end = (event: PointerEvent): void => {
      if (!start || event.pointerId !== start.id) return;
      const far = offset > sheet.offsetHeight * CLOSE_DISTANCE;
      release(
        event.type === "pointerup" && offset >= DRAG_START && (far || velocity > CLOSE_VELOCITY),
      );
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }
}

/**
 * Open but not modal where the media query matches. The attribute is set
 * directly because show() would move focus into it on page load.
 */
function initSidebar(sheet: HTMLDialogElement, query: string): void {
  const media = window.matchMedia(query);
  const sync = (): void => {
    if (sheet.matches(":modal")) sheet.close();
    sheet.toggleAttribute("open", media.matches);
  };
  media.addEventListener("change", sync);
  sync();
}

for (const sheet of document.querySelectorAll<HTMLDialogElement>("[data-sheet]")) {
  sheet.querySelector("[data-sheet-close]")?.addEventListener("click", () => sheet.close());
  // The panel fills the dialog, so a click on the dialog itself hits the backdrop.
  sheet.addEventListener("click", (event) => {
    if (event.target === sheet) sheet.close();
  });
  initDrag(sheet);
  if (sheet.dataset.sheetSidebar) initSidebar(sheet, sheet.dataset.sheetSidebar);
}
