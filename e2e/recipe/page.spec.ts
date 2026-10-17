import en from "@i18n/en";
import fr from "@i18n/fr";
import { expect, test } from "@playwright/test";
import {
  COMPLETE,
  DRAFT_FR,
  ingredientsPanel,
  NARRATIVE_FR,
  NARRATIVE_SECTION_FR,
  NARRATIVE_TITLE_FR,
  RECIPE_EN,
  RECIPE_FR,
  stepsPanel,
} from "../fixtures";

const progress = (template: string) =>
  template.replace("%count%", "0").replace("%total%", String(COMPLETE.ingredients));

test.describe("recipe page", () => {
  test("renders the French recipe with its ingredients and steps", async ({ page }) => {
    await page.goto(RECIPE_FR);

    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(COMPLETE.title.fr);
    // No category page yet: the crumb is shown as text, never as a dead link.
    const breadcrumb = page.getByRole("navigation", { name: fr.a11y.breadcrumb });
    await expect(breadcrumb).toContainText(COMPLETE.category);
    await expect(breadcrumb.getByRole("link", { name: COMPLETE.category })).toHaveCount(0);
    await expect(ingredientsPanel(page).getByRole("checkbox")).toHaveCount(COMPLETE.ingredients);
    await expect(stepsPanel(page).getByRole("article")).toHaveCount(COMPLETE.steps);
    await expect(ingredientsPanel(page)).toContainText(progress(fr.recipe.ingredients.progress));
    await expect(page.getByText(COMPLETE.chefNote)).toBeVisible();
  });

  test("serves the English translation under its own slug", async ({ page }) => {
    await page.goto(RECIPE_EN);

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(COMPLETE.title.en);
    await expect(page.getByRole("button", { name: en.recipe.servings.increase })).toBeVisible();
    await expect(ingredientsPanel(page)).toContainText(progress(en.recipe.ingredients.progress));
  });

  test("falls back to the narrative sections when a recipe has no steps", async ({ page }) => {
    await page.goto(NARRATIVE_FR);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(NARRATIVE_TITLE_FR);
    await expect(page.getByText(NARRATIVE_SECTION_FR, { exact: true })).toBeVisible();
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
