import { initPortions } from "./portions";
import { initView } from "./view";

document.querySelectorAll<HTMLElement>("[data-recipe-portions]").forEach(initPortions);
document.querySelectorAll<HTMLElement>("[data-recipe-view]").forEach(initView);
