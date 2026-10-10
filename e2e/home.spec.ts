import en from "@i18n/en";
import fr from "@i18n/fr";
import { expect, test } from "@playwright/test";

test("root redirects to the French locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr\/?$/);
});

test("home page renders the French hero heading", async ({ page }) => {
  await page.goto("/fr/");
  await expect(page.locator("main h1")).toHaveText(fr.home.hero.title);
});

test("English locale renders the English heading", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.locator("main h1")).toHaveText(en.home.hero.title);
});
