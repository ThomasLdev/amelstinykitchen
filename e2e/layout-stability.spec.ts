import { expect, test } from "@playwright/test";
import { FEATURED_TAG, HOME_FR, RECIPE_FR, RECIPES_FR } from "./fixtures";
import { loadShifts } from "./layout-shift";

test.describe("layout stability", () => {
  for (const path of [HOME_FR, RECIPES_FR, RECIPE_FR]) {
    test(`nothing moves while ${path} loads`, async ({ page }) => {
      expect(await loadShifts(page, path)).toEqual([]);
    });
  }

  test("nothing moves while a filtered list loads", async ({ page }) => {
    test.fail(true, "the list is filtered client-side after the first paint");
    expect(await loadShifts(page, `${RECIPES_FR}?tag=${FEATURED_TAG.id}`)).toEqual([]);
  });
});
