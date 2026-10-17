import type { CollectionEntry } from "astro:content";
import en from "@i18n/en";
import fr from "@i18n/fr";
import { factsLine, recipeCard } from "@lib/content/recipe-card";
import { describe, expect, it } from "vitest";

const recipe = (data: Record<string, unknown> = {}) =>
  ({
    id: "fr/tarte",
    data: {
      translationKey: "tarte",
      title: "Tarte",
      paths: "tarte",
      preparationTime: 20,
      cookingTime: 70,
      difficulty: "easy",
      media: [],
      ...data,
    },
  }) as unknown as CollectionEntry<"recipes">;

describe("recipeCard", () => {
  it("links the card in its locale and lists total time then difficulty", () => {
    expect(recipeCard(recipe(), "fr")).toMatchObject({
      href: "/fr/recipes/tarte/",
      meta: `1 h 30 · ${fr.recipe.difficulty.easy}`,
      transitionName: "recipe-media-tarte",
    });
    expect(recipeCard(recipe(), "en").meta).toBe(`1 hr 30 · ${en.recipe.difficulty.easy}`);
  });

  it("leaves an unknown time out of the facts", () => {
    expect(recipeCard(recipe({ preparationTime: 0, cookingTime: 0 }), "fr").meta).toBe(
      fr.recipe.difficulty.easy,
    );
  });
});

describe("factsLine", () => {
  it("joins the known facts only", () => {
    expect(factsLine(["Tartes", null, undefined, "", "Hiver"])).toBe("Tartes · Hiver");
  });
});
