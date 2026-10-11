import fr from "@i18n/fr";
import { plural } from "@lib/content/recipe-filters";
import { expect, test } from "@playwright/test";
import { FILTER_RECIPE, LIST_FR, RECIPES_FR, recipeList } from "../fixtures";

const openFilters = (page: Parameters<typeof recipeList>[0]) =>
  page.getByRole("button", { name: fr.recipes.filters.open, exact: false }).click();

test.describe("recipes filters sheet (mobile)", () => {
  test("applies the draft only with the “Show N recipes” button", async ({ page }) => {
    await page.goto(RECIPES_FR);
    await openFilters(page);
    const sheet = page.getByRole("dialog", { name: fr.recipes.filters.title });
    await expect(sheet).toBeVisible();

    await sheet.getByRole("radio", { name: FILTER_RECIPE.season }).check();
    // Still a draft: the list behind the sheet is unchanged.
    await expect(recipeList(page)).toHaveCount(LIST_FR.length);

    await sheet.getByRole("button", { name: plural(fr.recipes.apply, 1) }).click();
    await expect(sheet).toBeHidden();
    await expect(recipeList(page)).toHaveCount(1);
    await expect(
      page.getByRole("button", { name: new RegExp(`${fr.recipes.filters.open}\\s*1`) }),
    ).toBeVisible();
  });

  test("drops the draft when closed with Escape", async ({ page }) => {
    await page.goto(RECIPES_FR);
    await openFilters(page);
    const sheet = page.getByRole("dialog", { name: fr.recipes.filters.title });

    await sheet.getByRole("radio", { name: FILTER_RECIPE.season }).check();
    await page.keyboard.press("Escape");

    await expect(sheet).toBeHidden();
    await expect(recipeList(page)).toHaveCount(LIST_FR.length);
    await openFilters(page);
    await expect(sheet.getByRole("radio", { name: fr.recipes.filters.all }).last()).toBeChecked();
  });

  test("filters by category from the quick chips", async ({ page }) => {
    await page.goto(RECIPES_FR);
    const chip = page.getByRole("button", { name: FILTER_RECIPE.category, exact: true });

    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(recipeList(page).getByRole("heading")).toHaveText([FILTER_RECIPE.title]);
  });
});
