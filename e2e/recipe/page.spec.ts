import en from "@i18n/en";
import fr from "@i18n/fr";
import { expect, test } from "@playwright/test";
import {
  COMPLETE,
  DRAFT_FR,
  ingredientsPanel,
  NARRATIVE_FR,
  RECIPE_EN,
  RECIPE_FR,
  stepsPanel,
} from "../fixtures";

test.describe("recipe page", () => {
  test("renders the French recipe with its ingredients and steps", async ({ page }) => {
    await page.goto(RECIPE_FR);

    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Recette complète");
    // No category page yet: the crumb is shown as text, never as a dead link.
    const breadcrumb = page.getByRole("navigation", { name: fr.a11y.breadcrumb });
    await expect(breadcrumb).toContainText("Catégorie test");
    await expect(breadcrumb.getByRole("link", { name: "Catégorie test" })).toHaveCount(0);
    await expect(ingredientsPanel(page).getByRole("checkbox")).toHaveCount(COMPLETE.ingredients);
    await expect(stepsPanel(page).locator("article")).toHaveCount(COMPLETE.steps);
    await expect(ingredientsPanel(page)).toContainText(`0 / ${COMPLETE.ingredients} prêts`);
    await expect(page.getByText("Le conseil de test")).toBeVisible();
  });

  test("serves the English translation under its own slug", async ({ page }) => {
    await page.goto(RECIPE_EN);

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Complete recipe");
    await expect(page.getByRole("button", { name: en.recipe.servings.increase })).toBeVisible();
    await expect(ingredientsPanel(page)).toContainText(`0 / ${COMPLETE.ingredients} ready`);
  });

  test("falls back to the narrative sections when a recipe has no steps", async ({ page }) => {
    await page.goto(NARRATIVE_FR);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Recette narrative");
    await expect(page.getByText("Texte de la section narrative.")).toBeVisible();
    await expect(ingredientsPanel(page)).toHaveCount(0);
    await expect(page.getByRole("link", { name: fr.recipe.actions.jump })).toHaveCount(0);
  });

  test("never publishes drafts and returns a 404 for unknown recipes", async ({ page }) => {
    expect((await page.goto(DRAFT_FR))?.status()).toBe(404);
    expect((await page.goto("/fr/recipes/n-existe-pas/"))?.status()).toBe(404);
  });

  test("jumps from the hero to the recipe body", async ({ page }) => {
    await page.goto(RECIPE_FR);
    await page.getByRole("link", { name: fr.recipe.actions.jump }).click();

    await expect(page).toHaveURL(/#recipe$/);
    await expect(ingredientsPanel(page)).toBeInViewport();
  });
});
