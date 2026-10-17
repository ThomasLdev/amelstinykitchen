import { selectFeaturedTags, selectHeroRecipe, selectPopularRecipes } from "@lib/content/home";
import { describe, expect, it } from "vitest";

const recipe = (
  id: string,
  data: Partial<{
    draft: boolean;
    isFeatured: boolean;
    publishDate: string;
    updatedDate: string;
    tags: string[];
  }> = {},
) => ({
  id,
  data: {
    draft: data.draft ?? false,
    isFeatured: data.isFeatured ?? false,
    publishDate: new Date(data.publishDate ?? "2026-01-01"),
    updatedDate: data.updatedDate ? new Date(data.updatedDate) : undefined,
    tags: (data.tags ?? []).map((tagId) => ({ id: tagId })),
  },
});

const tag = (id: string, isFeatured = true) => ({ id, data: { isFeatured } });

describe("selectHeroRecipe", () => {
  it("picks the most recently published recipe, ties broken by id", () => {
    const recipes = [
      recipe("b", { publishDate: "2026-03-01" }),
      recipe("c", { publishDate: "2026-01-01" }),
      recipe("a", { publishDate: "2026-03-01" }),
    ];
    expect(selectHeroRecipe(recipes)?.id).toBe("a");
  });

  it("returns undefined when there is no recipe", () => {
    expect(selectHeroRecipe([])).toBeUndefined();
  });
});

describe("selectPopularRecipes", () => {
  it("keeps featured recipes, most recently updated first, within the limit", () => {
    const recipes = [
      recipe("old", { isFeatured: true, publishDate: "2026-01-01" }),
      recipe("not-featured", { publishDate: "2026-06-01" }),
      recipe("updated", { isFeatured: true, publishDate: "2025-01-01", updatedDate: "2026-05-01" }),
      recipe("recent", { isFeatured: true, publishDate: "2026-04-01" }),
    ];
    expect(selectPopularRecipes(recipes).map((r) => r.id)).toEqual(["updated", "recent", "old"]);
    expect(selectPopularRecipes(recipes, 2)).toHaveLength(2);
  });
});

describe("selectFeaturedTags", () => {
  it("keeps featured tags and counts the recipes using each one", () => {
    const recipes = [
      recipe("r1", { tags: ["citron"] }),
      recipe("r2", { tags: ["citron", "chocolat"] }),
    ];
    const tags = [tag("citron"), tag("vegan"), tag("chocolat", false)];

    expect(
      selectFeaturedTags(tags, recipes).map(({ tag: t, recipeCount }) => [t.id, recipeCount]),
    ).toEqual([
      ["citron", 2],
      ["vegan", 0],
    ]);
  });
});
