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

/** recette-complete.md: 4 servings, 4 ingredients (2 scalable), 2 steps, 2 cover photos. */
export const COMPLETE = {
  ingredients: 4,
  steps: 2,
  title: { fr: "Recette complète", en: "Complete recipe" },
} as const;

/** Homepage facts: featured = COMPLETE (newest), popular = COMPLETE then NARRATIVE, draft never shown. */
export const NARRATIVE_TITLE_FR = "Recette narrative";
export const DRAFT_TITLE_FR = "Recette brouillon";
/** tag-test.json: featured, used by COMPLETE (published) and the draft. */
export const FEATURED_TAG = { title: "Tag test", publishedRecipes: 1 } as const;
/** printemps/ete/automne/hiver.json: featured seasonal tags, so exactly one is always in season. */
export const SEASON_TAGS_FR = ["Printemps", "Été", "Automne", "Hiver"] as const;

export const ingredientsPanel = (page: Page) => page.locator("[data-recipe-checklist]");
export const stepsPanel = (page: Page) => page.locator(".recipe-steps");
export const ingredientQuantity = (page: Page, name: string) =>
  ingredientsPanel(page).locator(".ing-item", { hasText: name }).locator(".ing-item__qty");
