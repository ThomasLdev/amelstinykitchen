import fr from "@i18n/fr";
import { expect, test } from "@playwright/test";
import { ingredientsPanel, RECIPE_FR } from "../fixtures";

test.describe("ingredients checklist", () => {
  test("keeps the shopping checklist across reloads until reset", async ({ page }) => {
    await page.goto(RECIPE_FR);
    const flour = ingredientsPanel(page).getByRole("checkbox", { name: /Farine/ });
    const counter = page.locator("[data-recipe-checklist-count]");

    await ingredientsPanel(page).getByText("Farine").click();
    await expect(flour).toBeChecked();
    await expect(counter).toHaveText("1");

    await page.reload();
    await expect(flour).toBeChecked();
    await expect(counter).toHaveText("1");

    await page.getByRole("button", { name: fr.recipe.ingredients.reset }).click();
    await expect(flour).not.toBeChecked();
    await expect(counter).toHaveText("0");
  });
});
