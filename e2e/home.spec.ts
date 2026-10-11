import en from "@i18n/en";
import fr from "@i18n/fr";
import { expect, type Page, test } from "@playwright/test";
import {
  COMPLETE,
  DRAFT_TITLE_FR,
  FEATURED_TAG,
  HOME_EN,
  HOME_FR,
  NARRATIVE_TITLE_FR,
  RECIPE_EN,
  RECIPE_FR,
  SEASON_TAGS_FR,
} from "./fixtures";

const block = (page: Page, titleEm: string) =>
  page.locator("section", { has: page.getByRole("heading", { level: 2, name: titleEm }) });

test("root redirects to the French locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr\/?$/);
});

test("intro searches with the typed query", async ({ page }) => {
  await page.goto(HOME_FR);
  await expect(page.locator("main h1")).toContainText(fr.home.intro.titleEm);
  await page.getByLabel(fr.home.search.label).fill("citron");
  await page.getByRole("button", { name: fr.home.search.submit }).click();
  await expect(page).toHaveURL(/\/fr\/search\/?\?q=citron$/);
});

test("featured card shows the newest published recipe, never a draft", async ({ page }) => {
  await page.goto(HOME_FR);
  const featured = page.locator("article", { hasText: fr.home.featured.badge });
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

test("cravings block counts published recipes and puts the current season first", async ({
  page,
}) => {
  await page.goto(HOME_FR);
  const cravings = block(page, fr.home.tags.titleEm);
  await expect(cravings.getByRole("heading", { name: FEATURED_TAG.title })).toBeVisible();
  // The draft also carries the tag but is not published.
  await expect(
    cravings.getByText(fr.home.tags.recipesCount(FEATURED_TAG.publishedRecipes)),
  ).toBeVisible();

  await expect(cravings.getByText(fr.home.tags.inSeason)).toHaveCount(1);
  const first = cravings.getByRole("listitem").first();
  await expect(first).toContainText(fr.home.tags.inSeason);
  await expect(first.getByRole("heading")).toHaveText(
    new RegExp(`^(${SEASON_TAGS_FR.join("|")})$`),
  );
});

test('desktop shows a single "all recipes" link, next to the title', async ({ page }) => {
  await page.goto(HOME_FR);
  await expect(page.getByRole("link", { name: fr.home.popular.viewAll })).toHaveCount(1);
});

test("English home links to the English recipe URLs", async ({ page }) => {
  await page.goto(HOME_EN);
  const featured = page.locator("article", { hasText: en.home.featured.badge });
  await expect(featured.getByRole("heading", { level: 2 })).toHaveText(COMPLETE.title.en);
  await expect(featured.getByRole("link")).toHaveAttribute("href", RECIPE_EN);
});
