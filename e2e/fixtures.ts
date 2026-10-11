import type { Page } from "@playwright/test";

/**
 * Routes of the fixture content (e2e/fixtures/content), built by the
 * Playwright web server with CONTENT_DIR. Never the editorial content.
 */
export const RECIPE_FR = "/fr/recipes/recette-complete/";
export const RECIPE_EN = "/en/recipes/complete-recipe/";
export const NARRATIVE_FR = "/fr/recipes/recette-narrative/";
export const DRAFT_FR = "/fr/recipes/recette-brouillon/";

/** recette-complete.md: 4 servings, 4 ingredients (2 scalable), 2 steps, 2 cover photos. */
export const COMPLETE = { ingredients: 4, steps: 2 } as const;

export const ingredientsPanel = (page: Page) => page.locator("[data-recipe-checklist]");
export const stepsPanel = (page: Page) => page.locator(".recipe-steps");
export const ingredientQuantity = (page: Page, name: string) =>
  ingredientsPanel(page).locator(".ing-item", { hasText: name }).locator(".ing-item__qty");
