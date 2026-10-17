import { expect, type Page, test } from "@playwright/test";
import { COMPLETE, HOME_FR, RECIPE_EN, RECIPE_FR, RECIPES_FR } from "./fixtures";

const jsonLdTypes = async (page: Page) =>
  (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
    (json) => JSON.parse(json)["@type"],
  );

test.describe("SEO", () => {
  test("each page has one h1, a canonical URL and reciprocal hreflang links that resolve", async ({
    page,
    request,
  }) => {
    for (const path of [HOME_FR, RECIPES_FR, RECIPE_FR]) {
      await page.goto(path);

      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`^https://[^/]+${path}$`),
      );

      const alternates = page.locator('link[rel="alternate"][hreflang]');
      await expect(alternates).toHaveCount(3);
      for (const href of await alternates.evaluateAll((links) =>
        links.map((link) => new URL(link.getAttribute("href") ?? "").pathname),
      )) {
        expect((await request.get(href)).status(), href).toBe(200);
      }
    }
  });

  test("a recipe pairs its French and English slugs and describes itself as a Recipe", async ({
    page,
  }) => {
    await page.goto(RECIPE_EN);

    await expect(page.locator('link[hreflang="fr"]')).toHaveAttribute(
      "href",
      new RegExp(`${RECIPE_FR}$`),
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /^https:/);
    expect(await jsonLdTypes(page)).toEqual(["Recipe", "BreadcrumbList"]);

    const recipe = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "",
    );
    expect(recipe.name).toBe(COMPLETE.title.en);
    expect(recipe.recipeInstructions).toHaveLength(COMPLETE.steps);
    await expect(page.locator("#step-1")).toBeAttached();
  });

  test("the home page and the recipe list carry their structured data", async ({ page }) => {
    await page.goto(HOME_FR);
    expect(await jsonLdTypes(page)).toEqual(["WebSite"]);

    await page.goto(RECIPES_FR);
    expect(await jsonLdTypes(page)).toEqual(["ItemList", "BreadcrumbList"]);
  });

  test("serves the crawler and agent files", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Sitemap: https://");

    expect((await request.get("/sitemap-index.xml")).status()).toBe(200);
    expect(await (await request.get("/llms.txt")).text()).toContain(COMPLETE.title.fr);
    expect(await (await request.get("/fr/rss.xml")).text()).toContain(COMPLETE.title.fr);

    const markdown = await request.get(RECIPE_FR.replace(/\/$/, ".md"));
    expect(await markdown.text()).toMatch(new RegExp(`^# ${COMPLETE.title.fr}`));
  });

  test("the 404 page is kept out of the index", async ({ page }) => {
    await page.goto("/fr/recipes/n-existe-pas/");

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("the CMS admin is never part of the production build", async ({ request }) => {
    for (const path of ["/admin/", "/admin/config.yml", "/admin/sveltia-cms.js"]) {
      expect((await request.get(path)).status(), path).toBe(404);
    }
  });
});
