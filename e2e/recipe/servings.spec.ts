import fr from "@i18n/fr";
import { expect, test } from "@playwright/test";
import { ingredientQuantity, RECIPE_FR } from "../fixtures";

test.describe("servings stepper", () => {
  test("scales numeric quantities only, within bounds", async ({ page }) => {
    await page.goto(RECIPE_FR);
    const increase = page.getByRole("button", { name: fr.recipe.servings.increase });
    const decrease = page.getByRole("button", { name: fr.recipe.servings.decrease });

    await expect(ingredientQuantity(page, "Farine")).toHaveText("200 g");
    await increase.click();
    await expect(page.locator("[data-recipe-portions-value]")).toHaveText("5");
    await expect(ingredientQuantity(page, "Farine")).toHaveText("250 g");
    // Unit-only amounts and display overrides never scale.
    await expect(ingredientQuantity(page, "Sel")).toHaveText("une pincée");
    await expect(ingredientQuantity(page, "Citron")).toHaveText("1 zeste");

    for (let i = 0; i < 4; i++) await decrease.click();
    await expect(page.locator("[data-recipe-portions-value]")).toHaveText("1");
    await expect(ingredientQuantity(page, "Farine")).toHaveText("50 g");
    await expect(decrease).toBeDisabled();
  });
});
