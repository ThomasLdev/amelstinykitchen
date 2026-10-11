/**
 * Recipe view entry point. Each behavior lives in its own module; this file
 * only wires them to the DOM hooks present on the page.
 */

import { initActions } from "./actions";
import { initCarousel } from "./carousel";
import { initChecklist } from "./checklist";
import { initPortions } from "./portions";
import { initView } from "./view";

function boot(): void {
  document.querySelectorAll<HTMLElement>("[data-recipe-portions]").forEach(initPortions);
  document.querySelectorAll<HTMLElement>("[data-recipe-checklist]").forEach(initChecklist);
  document.querySelectorAll<HTMLElement>("[data-carousel]").forEach(initCarousel);
  document.querySelectorAll<HTMLElement>("[data-recipe-view]").forEach(initView);
  initActions();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
