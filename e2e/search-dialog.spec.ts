import en from "@i18n/en";
import fr from "@i18n/fr";
import { expect, type Page, test } from "@playwright/test";
import { COMPLETE, DRAFT_TITLE_FR, HOME_EN, HOME_FR, RECIPE_EN, RECIPE_FR } from "./fixtures";

const dialog = (page: Page, name = fr.header.search) => page.getByRole("dialog", { name });

test.describe("header search", () => {
  test("lists matching recipes while typing, linked to their page", async ({ page }) => {
    await page.goto(HOME_FR);
    await page
      .getByRole("navigation", { name: fr.header.navAriaLabel })
      .getByRole("button", { name: fr.header.search })
      .click();
    const search = dialog(page);
    await expect(search).toBeVisible();

    await search.getByRole("searchbox").fill(COMPLETE.ingredient.toLowerCase());
    await expect(search.getByText(fr.header.searchDialog.count.one)).toBeVisible();
    // Ingredients are not shown otherwise: the line says why the recipe is listed.
    await expect(
      search.getByText(fr.recipes.match.replace("%list%", COMPLETE.ingredient)),
    ).toBeVisible();
    await search.getByRole("link", { name: COMPLETE.title.fr }).click();
    await expect(page).toHaveURL(RECIPE_FR);
  });

  test("says when nothing matches and never lists a draft", async ({ page }) => {
    await page.goto(HOME_FR);
    await page.keyboard.press("Control+k");
    const search = dialog(page);

    await search.getByRole("searchbox").fill(DRAFT_TITLE_FR);
    await expect(search.getByText(fr.header.searchDialog.empty)).toBeVisible();
    await expect(search.getByRole("link")).toHaveCount(0);

    await search.getByRole("searchbox").fill("");
    await page.keyboard.press("Escape");
    await expect(search).toBeHidden();
  });

  test("searches the English recipes from the English pages", async ({ page }) => {
    await page.goto(HOME_EN);
    await page
      .getByRole("navigation", { name: en.header.navAriaLabel })
      .getByRole("button", { name: en.header.search })
      .click();
    const search = dialog(page, en.header.search);

    await search.getByRole("searchbox").fill(COMPLETE.title.en);
    await expect(search.getByRole("link", { name: COMPLETE.title.en })).toHaveAttribute(
      "href",
      RECIPE_EN,
    );
  });
});
