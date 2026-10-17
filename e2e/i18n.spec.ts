import en from "@i18n/en";
import { expect, test } from "@playwright/test";
import { LIST_EN, NARRATIVE_FR, NARRATIVE_FR_SLUG_EN, RECIPES_EN, recipeList } from "./fixtures";

test.describe("Missing translation", () => {
  test("a French-only recipe has no English alternate nor language link", async ({ page }) => {
    await page.goto(NARRATIVE_FR);

    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(0);
    await expect(page.getByRole("link", { name: en.footer.languageName })).toHaveCount(0);
  });

  test("a French-only recipe is not served under an English URL", async ({ page }) => {
    expect((await page.goto(NARRATIVE_FR_SLUG_EN))?.status()).toBe(404);
  });

  test("the English list only shows translated recipes", async ({ page }) => {
    await page.goto(RECIPES_EN);

    await expect(recipeList(page).getByRole("heading", { level: 3 })).toHaveText([...LIST_EN]);
  });
});
