import { expect, test } from "@playwright/test";

test("home page renders the heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("Astro");
});
