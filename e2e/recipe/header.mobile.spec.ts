import fr from "@i18n/fr";
import { expect, test } from "@playwright/test";
import { RECIPE_FR } from "../fixtures";

test.describe("recipe header (mobile)", () => {
  test("keeps share next to the title instead of an actions row", async ({ page }) => {
    await page.goto(RECIPE_FR);

    await expect(
      page
        .locator(".recipe-head__title-row")
        .getByRole("button", { name: fr.recipe.actions.share }),
    ).toBeVisible();
    await expect(page.locator(".recipe-head__actions")).toBeHidden();
  });
});
