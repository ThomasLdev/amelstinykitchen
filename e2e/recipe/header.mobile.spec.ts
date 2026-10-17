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

  test("shows the breadcrumb above the cover", async ({ page }) => {
    await page.goto(RECIPE_FR);

    const breadcrumb = page.getByRole("navigation", { name: fr.a11y.breadcrumb });
    await expect(breadcrumb).toBeVisible();
    const crumbBox = await breadcrumb.boundingBox();
    const mediaBox = await page.locator(".recipe-head__media").boundingBox();
    if (!crumbBox || !mediaBox) throw new Error("breadcrumb or cover is not rendered");
    expect(crumbBox.y + crumbBox.height).toBeLessThanOrEqual(mediaBox.y);
  });
});
