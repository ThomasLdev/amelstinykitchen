import { initRecipeBrowser } from "./browser";

document.querySelectorAll<HTMLFormElement>("[data-recipe-browser]").forEach(initRecipeBrowser);
