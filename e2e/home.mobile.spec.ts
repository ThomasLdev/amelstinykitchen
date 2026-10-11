import fr from "@i18n/fr";
import { expect, test } from "@playwright/test";
import { HOME_FR } from "./fixtures";

test.describe("home (mobile)", () => {
  test("keeps one visible, named control per action on a phone", async ({ page }) => {
    await page.goto(HOME_FR);

    // Icon-only submit button keeps its accessible name.
    await expect(page.getByRole("button", { name: fr.home.search.submit })).toBeVisible();

    // The head pill is hidden: only the full-width link under the list shows.
    const viewAll = page.getByRole("link", { name: fr.home.popular.viewAll });
    await expect(viewAll).toHaveCount(1);
    await expect(viewAll).toBeVisible();
  });

  test("the in-season tag spans the full row", async ({ page }) => {
    await page.goto(HOME_FR);
    const seasonal = page.getByRole("listitem").filter({ hasText: fr.home.tags.inSeason });
    const grid = seasonal.locator("..");

    const [item, list] = await Promise.all([seasonal.boundingBox(), grid.boundingBox()]);
    expect(item?.width).toBeCloseTo(list?.width ?? 0, 0);
  });
});
