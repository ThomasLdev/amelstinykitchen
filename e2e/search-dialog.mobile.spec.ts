import fr from "@i18n/fr";
import { expect, test } from "@playwright/test";
import { COMPLETE, HOME_FR } from "./fixtures";

test.describe("header search (mobile)", () => {
  test("opens as a sheet from the bottom nav and closes with its close button", async ({
    page,
  }) => {
    await page.goto(HOME_FR);
    await page
      .getByRole("navigation", { name: fr.header.navAriaLabel })
      .getByRole("button", { name: fr.header.search })
      .click();
    const search = page.getByRole("dialog", { name: fr.header.search });

    await search.getByRole("searchbox").fill(COMPLETE.ingredient.toLowerCase());
    await expect(search.getByRole("link", { name: COMPLETE.title.fr })).toBeVisible();

    await search.getByRole("button", { name: fr.header.searchDialog.close }).click();
    await expect(search).toBeHidden();
  });
});
