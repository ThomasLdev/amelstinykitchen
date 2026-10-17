import type { Page } from "@playwright/test";

/**
 * Routes of the fixture content (e2e/fixtures/content), built by the
 * Playwright web server with CONTENT_DIR. Never the editorial content.
 */
export const HOME_FR = "/fr/";
export const HOME_EN = "/en/";
export const RECIPE_FR = "/fr/recipes/recette-complete/";
export const RECIPE_EN = "/en/recipes/complete-recipe/";
export const NARRATIVE_FR = "/fr/recipes/recette-narrative/";
export const DRAFT_FR = "/fr/recipes/recette-brouillon/";
/** The French slug under the English locale: must never be served. */
export const NARRATIVE_FR_SLUG_EN = "/en/recipes/recette-narrative/";

/** recette-complete.md: 4 servings, 4 ingredients (2 scalable), 2 steps, 2 cover photos. */
export const COMPLETE = {
  ingredients: 4,
  steps: 2,
  title: { fr: "Recette complète", en: "Complete recipe" },
} as const;

/** recette-narrative.md has no English translation. */
export const NARRATIVE_TITLE_FR = "Recette narrative";
export const DRAFT_TITLE_FR = "Recette brouillon";
export const FEATURED_TAG = { id: "tag-test", title: "Tag test", publishedRecipes: 1 } as const;

export const ingredientsPanel = (page: Page) => page.locator("[data-recipe-checklist]");
export const stepsPanel = (page: Page) => page.locator(".recipe-steps");
export const ingredientQuantity = (page: Page, name: string) =>
  ingredientsPanel(page).locator(".ing-item", { hasText: name }).locator(".ing-item__qty");

export const RECIPES_FR = "/fr/recipes/";
export const RECIPES_EN = "/en/recipes/";

/** Published recipes on the list, in the default ("most loved") order. */
export const LIST_FR = [COMPLETE.title.fr, NARRATIVE_TITLE_FR, "Recette filtre"] as const;
export const LIST_EN = [COMPLETE.title.en, "Filter recipe"] as const;
/** recette-filtre.md: alone in its category and in winter, the quickest recipe. */
export const FILTER_RECIPE = {
  title: "Recette filtre",
  category: "Catégorie filtre",
  season: "Hiver",
} as const;

export const recipeList = (page: Page) => page.locator("[data-recipe-list] > li:not([hidden])");
