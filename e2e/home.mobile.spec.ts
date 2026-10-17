import fr from "@i18n/fr";
import { expect, test } from "@playwright/test";
import { HOME_FR } from "./fixtures";

test.describe("home (mobile)", () => {
  test("keeps one visible, named control per action on a phone", async ({ page }) => {
    await page.goto(HOME_FR);

    await expect(page.getByRole("button", { name: fr.home.search.submit })).toBeVisible();

    const viewAll = page.getByRole("link", { name: fr.home.popular.viewAll });
    await expect(viewAll).toHaveCount(1);
    await expect(viewAll).toBeVisible();
  });
});
