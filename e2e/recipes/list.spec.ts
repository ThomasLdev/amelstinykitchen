import fr from "@i18n/fr";
import { plural } from "@lib/content/recipe-filters";
import { expect, test } from "@playwright/test";
import {
  COMPLETE,
  DRAFT_TITLE_FR,
  FEATURED_TAG,
  FILTER_RECIPE,
  LIST_FR,
  RECIPES_EN,
  RECIPES_FR,
  recipeList,
} from "../fixtures";

const titles = (page: Parameters<typeof recipeList>[0]) =>
  recipeList(page).getByRole("heading", { level: 3 });

test.describe("recipes list (desktop)", () => {
  test("lists the published recipes in both languages, drafts excluded", async ({ page }) => {
    await page.goto(RECIPES_FR);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      `${fr.recipes.title} ${fr.recipes.titleEm}`,
    );
    await expect(titles(page)).toHaveText([...LIST_FR]);
    await expect(page.getByText(DRAFT_TITLE_FR)).toHaveCount(0);

    await page.goto(RECIPES_EN);
    await expect(titles(page).first()).toHaveText(COMPLETE.title.en);
  });

  test("filters from the sidebar, updates counts and URL, and clears", async ({ page }) => {
    await page.goto(RECIPES_FR);
    await page.getByRole("radio", { name: new RegExp(FILTER_RECIPE.category) }).check();

    await expect(titles(page)).toHaveText([FILTER_RECIPE.title]);
    await expect(page.getByRole("heading", { name: plural(fr.recipes.count, 1) })).toBeVisible();
    await expect(page).toHaveURL(/category=categorie-filtre/);

    const chip = page.getByRole("button", {
      name: fr.recipes.active.remove.replace("%label%", FILTER_RECIPE.category),
    });
    await chip.click();
    await expect(titles(page)).toHaveCount(LIST_FR.length);
    await expect(chip).toBeHidden();
  });

  test("combines season and name filters down to an empty state", async ({ page }) => {
    await page.goto(RECIPES_FR);
    await page.getByRole("radio", { name: FILTER_RECIPE.season }).check();
    await expect(titles(page)).toHaveText([FILTER_RECIPE.title]);

    await page.getByRole("searchbox", { name: fr.recipes.search.label }).fill("complete");
    await expect(page.getByRole("heading", { name: fr.recipes.empty.title })).toBeVisible();

    await page
      .locator("[data-results-empty]")
      .getByRole("button", { name: fr.recipes.active.clear })
      .click();
    await expect(titles(page)).toHaveCount(LIST_FR.length);
    await expect(page.getByRole("searchbox", { name: fr.recipes.search.label })).toHaveValue("");
  });

  test("searches ingredients by relevance, then falls back to the newest", async ({ page }) => {
    await page.goto(RECIPES_FR);
    const sort = page.getByRole("combobox", { name: fr.recipes.sort.label });
    const searchbox = page.getByRole("searchbox", { name: fr.recipes.search.label });
    await expect(sort).toHaveValue("recent");

    await searchbox.fill(COMPLETE.ingredient.toLowerCase());
    await expect(titles(page)).toHaveText([COMPLETE.title.fr]);
    await expect(sort).toHaveValue("relevance");
    // The card does not list ingredients: the match line and highlight say why it is there.
    await expect(
      recipeList(page).getByText(fr.recipes.match.replace("%list%", COMPLETE.ingredient)),
    ).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => CSS.highlights.get("recipe-search")?.size ?? 0))
      .toBeGreaterThan(0);

    await searchbox.fill("");
    await expect(titles(page)).toHaveText([...LIST_FR]);
    await expect(sort).toHaveValue("recent");
    await expect(
      page.getByText(fr.recipes.match.replace("%list%", COMPLETE.ingredient)),
    ).toBeHidden();
  });

  test("keeps a sort picked with the query and resets an automatic one with its chip", async ({
    page,
  }) => {
    const sort = page.getByRole("combobox", { name: fr.recipes.sort.label });
    const query = COMPLETE.ingredient.toLowerCase();

    await page.goto(`${RECIPES_FR}?q=${query}&sort=recent`);
    await expect(sort).toHaveValue("recent");
    await expect(page).toHaveURL(/sort=recent/);

    await page.goto(`${RECIPES_FR}?q=${query}`);
    await expect(sort).toHaveValue("relevance");
    const label = fr.recipes.active.query.replace("%query%", query);
    await page
      .getByRole("button", { name: fr.recipes.active.remove.replace("%label%", label) })
      .click();
    await expect(sort).toHaveValue("recent");
    await expect(titles(page)).toHaveText([...LIST_FR]);
  });

  test("sorts by duration and restores the state from the URL", async ({ page }) => {
    await page.goto(`${RECIPES_FR}?sort=quick&tag=${FEATURED_TAG.id}`);

    await expect(page.getByRole("combobox", { name: fr.recipes.sort.label })).toHaveValue("quick");
    await expect(page.getByRole("checkbox", { name: FEATURED_TAG.title })).toBeChecked();
    await expect(titles(page)).toHaveText([COMPLETE.title.fr]);

    await page.getByRole("checkbox", { name: FEATURED_TAG.title }).uncheck();
    await expect(titles(page).first()).toHaveText(FILTER_RECIPE.title);
  });
});
