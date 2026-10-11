/** Pure decision logic for the mobile bottom nav (see nav.ts). */

export type NavState = "visible" | "hidden";

/** Scroll distance (px) under which a movement is ignored, to avoid flicker. */
export const NAV_SCROLL_THRESHOLD = 8;

/**
 * Next nav state for a scroll position, or `null` when the movement is too
 * small to decide (the caller then keeps its reference position).
 */
export function nextNavState(y: number, lastY: number, footerVisible: boolean): NavState | null {
  if (footerVisible) return "hidden";
  if (y < NAV_SCROLL_THRESHOLD) return "visible";
  const delta = y - lastY;
  if (delta < -NAV_SCROLL_THRESHOLD) return "visible";
  if (delta > NAV_SCROLL_THRESHOLD) return "hidden";
  return null;
}
