/**
 * Mobile bottom nav: hidden while scrolling down, shown again when scrolling
 * up or back at the top, and always hidden once the footer is on screen.
 * Only sets `data-nav-state`; the CSS (mobile only) does the rest.
 */

import { nextNavState } from "./nav-state";

function initNav(nav: HTMLElement): void {
  const footer = document.querySelector<HTMLElement>("[data-site-footer]");
  let lastY = window.scrollY;
  let footerVisible = false;
  let ticking = false;

  const update = (): void => {
    ticking = false;
    const y = Math.max(0, window.scrollY);
    const state = nextNavState(y, lastY, footerVisible);
    if (!state) return;
    nav.dataset.navState = state;
    lastY = y;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true },
  );

  if (footer) {
    new IntersectionObserver(([entry]) => {
      footerVisible = entry?.isIntersecting ?? false;
      update();
    }).observe(footer);
  }

  // Settled before the first transition can run, so a short page does not slide the nav out on load.
  footerVisible = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;
  nav.dataset.navState = nextNavState(lastY, lastY, footerVisible) ?? "visible";
  window.requestAnimationFrame(() => {
    nav.dataset.navReady = "";
  });
}

document.querySelectorAll<HTMLElement>("[data-nav]").forEach(initNav);
