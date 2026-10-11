/**
 * Media carousel controls (desktop): prev/next arrows and pagination dots,
 * kept in sync with the native scroll-snap position.
 */

export function initCarousel(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>("[data-carousel-track]");
  const prev = root.querySelector<HTMLButtonElement>("[data-carousel-prev]");
  const next = root.querySelector<HTMLButtonElement>("[data-carousel-next]");
  if (!track || !prev || !next) return;

  const slides = Array.from(track.children) as HTMLElement[];
  if (slides.length < 2) return;

  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-carousel-dot]"));

  const currentIndex = (): number => {
    let closest = 0;
    let min = Number.POSITIVE_INFINITY;
    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
      if (distance < min) {
        min = distance;
        closest = index;
      }
    });
    return closest;
  };

  const scrollTo = (index: number): void => {
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    const target = slides[clamped];
    if (!target) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: target.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const sync = (): void => {
    const index = currentIndex();
    const atStart = index <= 0;
    const atEnd = index >= slides.length - 1;

    // Keep keyboard focus on a control: move it to the opposite button before
    // disabling the one that is currently focused.
    if (atStart && !atEnd && document.activeElement === prev) next.focus();
    else if (atEnd && !atStart && document.activeElement === next) prev.focus();

    prev.disabled = atStart;
    next.disabled = atEnd;

    dots.forEach((dot, dotIndex) => {
      if (dotIndex === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  prev.addEventListener("click", () => scrollTo(currentIndex() - 1));
  next.addEventListener("click", () => scrollTo(currentIndex() + 1));
  for (const dot of dots) {
    dot.addEventListener("click", () => scrollTo(Number(dot.dataset.index ?? "0")));
  }
  track.addEventListener("scroll", () => window.requestAnimationFrame(sync), { passive: true });
  sync();
}
