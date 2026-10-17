import { expect, test } from "@playwright/test";
import { HOME_FR, RECIPE_FR, RECIPES_FR } from "./fixtures";
import { loadShifts } from "./layout-shift";

test.describe("layout stability (mobile)", () => {
  for (const path of [HOME_FR, RECIPES_FR, RECIPE_FR]) {
    test(`nothing moves while ${path} loads`, async ({ page }) => {
      expect(await loadShifts(page, path)).toEqual([]);
    });
  }
});
