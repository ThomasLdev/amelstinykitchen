import fr from "@i18n/fr";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { FILTER_RECIPE, LIST_FR, RECIPES_FR, recipeList } from "./fixtures";

/** Drags the sheet by its title, which is a handle. */
async function dragDown(page: Page, sheet: Locator, distance: number): Promise<void> {
  const box = await sheet.getByRole("heading").boundingBox();
  if (!box) throw new Error("Sheet title not visible");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + distance, { steps: 12 });
  await page.mouse.up();
}

test.describe("sheet (mobile)", () => {
  test("drags down to close past a threshold, back into place below it", async ({ page }) => {
    await page.goto(RECIPES_FR);
    await page.getByRole("button", { name: fr.recipes.filters.open, exact: false }).click();
    const sheet = page.getByRole("dialog", { name: fr.recipes.filters.title });
    await expect(sheet).toBeVisible();

    await dragDown(page, sheet, 40);
    await expect(sheet).toBeVisible();
    await expect(sheet).not.toHaveAttribute("style", /translate/);

    // Closing by drag drops the draft, like Escape.
    await sheet.getByRole("radio", { name: FILTER_RECIPE.season }).check();
    await dragDown(page, sheet, 400);
    await expect(sheet).toBeHidden();
    await expect(recipeList(page)).toHaveCount(LIST_FR.length);
  });
});
