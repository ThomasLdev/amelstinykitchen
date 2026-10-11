import { expect, test } from "@playwright/test";
import { RECIPE_FR } from "./fixtures";

test.describe("bottom nav (mobile)", () => {
  test("hides the bottom nav while scrolling down and over the footer", async ({ page }) => {
    await page.goto(RECIPE_FR);
    const nav = page.locator("[data-nav]");

    await expect(nav).toHaveAttribute("data-nav-state", "visible");

    // Small moves that stay above the footer (the fixture page is short).
    await page.mouse.wheel(0, 300);
    await expect(nav).toHaveAttribute("data-nav-state", "hidden");

    await page.mouse.wheel(0, -150);
    await expect(nav).toHaveAttribute("data-nav-state", "visible");

    await page.locator("[data-site-footer]").scrollIntoViewIfNeeded();
    await expect(nav).toHaveAttribute("data-nav-state", "hidden");
    await expect(nav).not.toBeInViewport();
  });
});
