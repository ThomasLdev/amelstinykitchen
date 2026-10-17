import type { CollectionEntry } from "astro:content";
import { resolveRecipe } from "@lib/seo/resolve";
import { describe, expect, it, vi } from "vitest";
import cover from "../../fixtures/cover.png";

vi.mock("astro:content", () => ({
  getEntry: async () => ({ data: { fr: { title: "Tartes" }, en: { title: "Pies" } } }),
  getEntries: async () => [{ data: { fr: { title: "Citron" }, en: { title: "Lemon" } } }],
}));

const site = new URL("https://example.com");

const entry = (data: Record<string, unknown> = {}) =>
  ({
    id: "fr/tarte",
    data: {
      locale: "fr",
      translationKey: "tarte",
      title: "Tarte",
      paths: "tarte",
      excerpt: "Une tarte acidulée.",
      keywords: [],
      category: { id: "tartes" },
      tags: [{ id: "citron" }],
      preparationTime: 20,
      cookingTime: 30,
      servings: 6,
      publishDate: new Date("2026-03-01"),
      media: [{ src: cover, alt: "" }],
      ingredientGroups: [{ label: "", ingredients: [] }],
      steps: [{ title: "Cuire", content: "Cuisez **30 min** à 180 °C.", media: [] }],
      ...data,
    },
  }) as unknown as CollectionEntry<"recipes">;

describe("resolveRecipe", () => {
  it("flattens a recipe for one locale, with absolute URLs and plain step text", async () => {
    const recipe = await resolveRecipe(entry(), site);

    expect(recipe.url).toMatch(/^https:\/\/.+\/fr\/recipes\/tarte\/$/);
    expect(recipe.markdownUrl).toMatch(/\/fr\/recipes\/tarte\.md$/);
    expect(recipe.category).toBe("Tartes");
    expect(recipe.steps[0]?.text).toBe("Cuisez 30 min à 180 °C.");
    expect(recipe.ingredientGroups[0]?.label).toBeUndefined();
    expect(recipe.images).toHaveLength(3);
  });

  it("falls back to the excerpt and the tag titles when the SEO fields are empty", async () => {
    const recipe = await resolveRecipe(entry(), site);

    expect(recipe.description).toBe("Une tarte acidulée.");
    expect(recipe.keywords).toEqual(["Citron"]);
  });

  it("prefers the SEO fields when they are filled", async () => {
    const recipe = await resolveRecipe(
      entry({ metaDescription: "Pour le SEO.", keywords: ["tarte au citron"] }),
      site,
    );

    expect(recipe.description).toBe("Pour le SEO.");
    expect(recipe.keywords).toEqual(["tarte au citron"]);
  });

  it("skips image generation for text-only outputs", async () => {
    expect((await resolveRecipe(entry(), site, { images: false })).images).toEqual([]);
  });
});
