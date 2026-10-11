/**
 * Mobile bottom nav: hidden while scrolling down, shown again when scrolling
 * up or back at the top, and always hidden once the footer is on screen.
 * Only sets `data-nav-state`; the CSS (mobile only) does the rest.
 */

const THRESHOLD = 8;

function initNav(nav: HTMLElement): void {
  const footer = document.querySelector<HTMLElement>("[data-site-footer]");
  let lastY = window.scrollY;
  let footerVisible = false;
  let ticking = false;

  const setState = (visible: boolean): void => {
    nav.dataset.navState = visible ? "visible" : "hidden";
  };

  const update = (): void => {
    ticking = false;
    const y = Math.max(0, window.scrollY);
    const delta = y - lastY;

    if (footerVisible) setState(false);
    else if (y < THRESHOLD) setState(true);
    else if (delta < -THRESHOLD) setState(true);
    else if (delta > THRESHOLD) setState(false);
    else return;

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
      if (footerVisible) setState(false);
      else update();
    }).observe(footer);
  }

  setState(true);
}

document.querySelectorAll<HTMLElement>("[data-nav]").forEach(initNav);
