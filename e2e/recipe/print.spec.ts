import { expect, test } from "@playwright/test";
import { ingredientsPanel, RECIPE_FR, stepsPanel } from "../fixtures";

test.describe("recipe print layout", () => {
  test("prints a clean A4 layout: content only, both panels visible", async ({ page }) => {
    // A4 portrait is ~700px wide: the narrow (mobile) rules apply when printing.
    await page.setViewportSize({ width: 700, height: 1000 });
    await page.goto(RECIPE_FR);
    await page.emulateMedia({ media: "print" });

    for (const chrome of [
      "[data-nav]",
      "[data-site-footer]",
      ".recipe-head__actions",
      "[data-recipe-view]",
    ]) {
      await expect(page.locator(chrome)).toBeHidden();
    }
    await expect(page.locator("[data-carousel-next]").first()).toBeHidden();
    await expect(ingredientsPanel(page)).toBeVisible();
    await expect(stepsPanel(page)).toBeVisible();
  });
});
