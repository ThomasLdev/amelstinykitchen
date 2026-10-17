import { currentSeason } from "@lib/content/season";

const season = currentSeason(new Date());
for (const card of document.querySelectorAll<HTMLElement>("[data-season-card]")) {
  card.hidden = card.dataset.seasonCard !== season;
}
