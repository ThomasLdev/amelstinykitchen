import { expect, test } from "@playwright/test";
import fr from "../src/i18n/fr";

test("root redirects to the French locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr\/?$/);
});

test("home page renders the French hero heading", async ({ page }) => {
  await page.goto("/fr/");
  await expect(page.locator("main h1")).toHaveText(fr.home.hero.title);
});
