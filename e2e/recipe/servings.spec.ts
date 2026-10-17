import fr from "@i18n/fr";
import { expect, test } from "@playwright/test";
import { COMPLETE, ingredient, RECIPE_FR } from "../fixtures";

test.describe("servings stepper", () => {
  test("scales numeric quantities only, within bounds", async ({ page }) => {
    await page.goto(RECIPE_FR);
    const increase = page.getByRole("button", { name: fr.recipe.servings.increase });
    const decrease = page.getByRole("button", { name: fr.recipe.servings.decrease });

    const flour = ingredient(page, COMPLETE.ingredient);
    await expect(flour).toHaveAccessibleName(`${COMPLETE.ingredient} 200 g`);
    await increase.click();
    await expect(page.locator("[data-recipe-portions-value]")).toHaveText("5");
    await expect(flour).toHaveAccessibleName(`${COMPLETE.ingredient} 250 g`);
    // Unit-only amounts and display overrides never scale.
    for (const [name, amount] of Object.entries(COMPLETE.fixedAmounts)) {
      await expect(ingredient(page, name)).toHaveAccessibleName(`${name} ${amount}`);
    }

    for (let i = 0; i < 4; i++) await decrease.click();
    await expect(page.locator("[data-recipe-portions-value]")).toHaveText("1");
    await expect(flour).toHaveAccessibleName(`${COMPLETE.ingredient} 50 g`);
    await expect(decrease).toBeDisabled();
  });
});
