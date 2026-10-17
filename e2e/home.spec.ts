import en from "@i18n/en";
import fr from "@i18n/fr";
import { expect, type Page, test } from "@playwright/test";
import {
  COMPLETE,
  DRAFT_TITLE_FR,
  FEATURED_TAG,
  FILTER_RECIPE,
  HOME_EN,
  HOME_FR,
  NARRATIVE_TITLE_FR,
  RECIPE_EN,
  RECIPE_FR,
  recipeList,
} from "./fixtures";

const block = (page: Page, titleEm: string) =>
  page.locator("section", { has: page.getByRole("heading", { level: 2, name: titleEm }) });

test("root redirects to the French locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr\/?$/);
});

test("intro search opens the recipes list filtered by the typed query", async ({ page }) => {
  await page.goto(HOME_FR);
  await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toContainText(
    fr.home.intro.titleEm,
  );
  await page.getByLabel(fr.home.search.label).fill(FILTER_RECIPE.query);
  await page.getByRole("button", { name: fr.home.search.submit }).click();

  await expect(page.getByRole("searchbox", { name: fr.recipes.search.label })).toHaveValue(
    FILTER_RECIPE.query,
  );
  await expect(recipeList(page).getByRole("heading", { level: 3 })).toHaveText([
    FILTER_RECIPE.title,
  ]);
});

test("featured card shows the newest published recipe, never a draft", async ({ page }) => {
  await page.goto(HOME_FR);
  const featured = page.getByRole("article").filter({ hasText: fr.home.featured.badge });
  await expect(featured.getByRole("heading", { level: 2 })).toHaveText(COMPLETE.title.fr);
  await featured.getByRole("link").click();
  await expect(page).toHaveURL(RECIPE_FR);
});

test("popular block lists featured published recipes", async ({ page }) => {
  await page.goto(HOME_FR);
  const popular = block(page, fr.home.popular.titleEm);
  await expect(popular.getByRole("heading", { level: 3 })).toHaveText([
    COMPLETE.title.fr,
    NARRATIVE_TITLE_FR,
  ]);
  await expect(popular.getByRole("link", { name: COMPLETE.title.fr, exact: true })).toHaveAttribute(
    "href",
    RECIPE_FR,
  );
  await expect(page.getByText(DRAFT_TITLE_FR)).toHaveCount(0);
});

test("cravings discs link each featured tag to its filter", async ({ page }) => {
  await page.goto(HOME_FR);
  const discs = page.getByRole("navigation", { name: fr.home.tags.nav });
  await discs.getByRole("link", { name: FEATURED_TAG.title }).click();
  await expect(page.getByRole("checkbox", { name: FEATURED_TAG.title })).toBeChecked();
});

test("cravings block features the visitor's season, not the build's", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2027, 0, 15));
  await page.goto(HOME_FR);
  const cravings = block(page, fr.home.tags.titleEm);
  const [before, em, after] = fr.home.tags.seasonTitle.winter;
  await expect(cravings.getByRole("heading", { level: 3 })).toHaveText(`${before}${em}${after}`);
  await expect(cravings.getByRole("link", { name: FILTER_RECIPE.title })).toBeVisible();

  await cravings.getByRole("link", { name: fr.home.tags.seasonRecipes.winter(1) }).click();
  await expect(page.getByRole("radio", { name: FILTER_RECIPE.season })).toBeChecked();
  await expect(recipeList(page).getByRole("heading", { level: 3 })).toHaveText([
    FILTER_RECIPE.title,
  ]);
});

test('exposes a single "all recipes" link on desktop', async ({ page }) => {
  await page.goto(HOME_FR);
  await expect(page.getByRole("link", { name: fr.home.popular.viewAll })).toHaveCount(1);
});

test("English home links to the English recipe URLs", async ({ page }) => {
  await page.goto(HOME_EN);
  const featured = page.getByRole("article").filter({ hasText: en.home.featured.badge });
  await expect(featured.getByRole("heading", { level: 2 })).toHaveText(COMPLETE.title.en);
  await expect(featured.getByRole("link")).toHaveAttribute("href", RECIPE_EN);
});
