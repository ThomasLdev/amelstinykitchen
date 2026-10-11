import fr from "@i18n/fr";
import { expect, test } from "@playwright/test";
import { ingredientsPanel, RECIPE_FR, stepsPanel } from "../fixtures";

test.describe("ingredients / steps tabs (mobile)", () => {
  test("switches between the ingredients and steps panels", async ({ page }) => {
    await page.goto(RECIPE_FR);
    const ingredients = ingredientsPanel(page);
    const steps = stepsPanel(page);

    await expect(ingredients).toBeVisible();
    await expect(steps).toBeHidden();

    await page.getByRole("radio", { name: new RegExp(fr.recipe.view.steps) }).check();
    await expect(steps).toBeVisible();
    await expect(ingredients).toBeHidden();

    await page.getByRole("radio", { name: new RegExp(fr.recipe.view.ingredients) }).check();
    await expect(ingredients).toBeVisible();
  });
  test("moves on to the steps from the ingredients panel", async ({ page }) => {
    await page.goto(RECIPE_FR);
    await page.getByRole("button", { name: fr.recipe.ingredients.done }).click();

    await expect(page.getByRole("radio", { name: new RegExp(fr.recipe.view.steps) })).toBeChecked();
    await expect(stepsPanel(page)).toBeVisible();
  });
});
