import { type CollectionEntry, getCollection, getEntry } from "astro:content";
import { type LocalizedString, translate } from "@lib/content/i18n";
import { formatDuration, ingredientCount, totalTime } from "@lib/content/recipe";
import { describe, expect, it } from "vitest";

describe("recipes collection", () => {
  it("exposes the expected entries", async () => {
    const recipes = await getCollection("recipes");
    expect(recipes.map((recipe: CollectionEntry<"recipes">) => recipe.id).sort()).toEqual([
      "fondant-au-chocolat",
      "tarte-au-citron",
    ]);
  });

  it("resolves hero images to ImageMetadata", async () => {
    const tarte = await getEntry("recipes", "tarte-au-citron");
    const hero = tarte?.data.hero;

    expect(hero).toBeDefined();
    expect(hero?.src).toBeTypeOf("object");
    expect(hero?.src.width).toBe(1200);
    expect(hero?.src.height).toBe(800);
    expect(hero?.alt.fr).toContain("Tarte");
  });

  it("keeps localized string pairs on nested steps", async () => {
    const tarte = await getEntry("recipes", "tarte-au-citron");
    expect(tarte?.data.steps[0]?.title.en).toBe("Make the pastry");
    expect(tarte?.data.steps[1]?.image).toBeDefined();
  });

  it("resolves the category reference", async () => {
    const fondant = await getEntry("recipes", "fondant-au-chocolat");
    expect(fondant?.data.category.id).toBe("desserts");
  });

  it("resolves localized strings for the active locale", async () => {
    const tarte = await getEntry("recipes", "tarte-au-citron");
    if (!tarte) {
      throw new Error("Missing recipe: tarte-au-citron");
    }

    const title: LocalizedString = tarte.data.title;
    expect(translate(title, "fr")).toBe("Tarte au citron meringuée");
    expect(translate(title, "en")).toBe("Lemon meringue pie");
  });
});

describe("recipe helpers", () => {
  it("formats durations per locale", () => {
    expect(formatDuration(0, "fr")).toBeNull();
    expect(formatDuration(45, "fr")).toBe("45 min");
    expect(formatDuration(90, "fr")).toBe("1 h 30");
    expect(formatDuration(90, "en")).toBe("1 hr 30");
    expect(formatDuration(120, "en")).toBe("2 hr");
  });

  it("derives totals and counts", () => {
    expect(totalTime(40, 25)).toBe(65);
    expect(ingredientCount([{ ingredients: [1, 2] }, { ingredients: [3] }])).toBe(3);
  });
});
