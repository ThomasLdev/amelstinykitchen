// cspell:ignore citon choco chocolt coeur crme oeufs
import {
  byRelevance,
  findTerms,
  matchedIngredients,
  recipeSearchFields,
  type SearchFields,
} from "@lib/content/recipe-search";
import { createRecipeSearch } from "@lib/content/recipe-search-engine";
import { describe, expect, it } from "vitest";

const recipe = (id: string, fields: Partial<SearchFields>) => ({
  id,
  search: { title: "", labels: "", ingredients: [], excerpt: "", ...fields },
});

const search = createRecipeSearch([
  recipe("tarte", {
    title: "Tarte au citron meringuée",
    labels: "Pâtisserie Citron Végétarien Hiver",
    ingredients: ["Farine", "Beurre", "Citrons", "Sucre"],
  }),
  recipe("fondant", {
    title: "Fondant au chocolat",
    labels: "Desserts Chocolat",
    ingredients: ["Chocolat noir", "Beurre", "Œufs"],
  }),
  recipe("soupe", {
    title: "Velouté d'hiver",
    labels: "Plats",
    ingredients: ["Poireaux", "Pommes de terre", "Crème"],
  }),
]);

const ids = (query: string) => [...(search(query)?.keys() ?? [])];

describe("createRecipeSearch", () => {
  it("finds a recipe by one of its ingredients", () => {
    expect(ids("poireaux")).toEqual(["soupe"]);
  });

  it("tolerates a typo, a word start, missing accents and ligatures", () => {
    expect(ids("citon")).toEqual(["tarte"]);
    expect(ids("choco")).toEqual(["fondant"]);
    expect(ids("veloute")).toEqual(["soupe"]);
    expect(ids("oeufs")).toEqual(["fondant"]);
  });

  it("requires every word, ignoring stop words", () => {
    expect(ids("beurre chocolat")).toEqual(["fondant"]);
    expect(ids("soupe de poireaux")).toEqual([]);
    expect(ids("velouté de poireaux")).toEqual(["soupe"]);
  });

  it("ranks a title match above an ingredient match", () => {
    expect(ids("hiver")).toEqual(["soupe", "tarte"]);
  });

  it("treats an empty, stop-word-only or too short query as no search", () => {
    expect(search("  ")).toBeUndefined();
    expect(search("de la")).toBeUndefined();
    expect(search("b")).toBeUndefined();
    expect(search("be")).toBeUndefined();
  });

  it("waits for three letters to search word starts, ignoring shorter words", () => {
    expect(ids("beu").sort()).toEqual(["fondant", "tarte"]);
    expect(ids("chocolat b")).toEqual(["fondant"]);
  });

  it("tolerates typos only on long enough words", () => {
    // "crme" is one letter away from "creme": a typo on a long word, a different word on a short one.
    expect(ids("crme")).toEqual([]);
    expect(ids("chocolt")).toEqual(["fondant"]);
  });
});

describe("findTerms", () => {
  it("returns the recipe words that matched, whatever the query's spelling", () => {
    expect([...(search("choco")?.get("fondant")?.terms ?? [])]).toEqual(["chocolat"]);
    expect([...(search("chocolt beurre")?.get("fondant")?.terms ?? [])].sort()).toEqual([
      "beurre",
      "chocolat",
    ]);
  });

  it("locates them in a displayed text, accents and ligatures included", () => {
    const terms = new Set(["veloute", "coeur"]);
    const text = "Un velouté au cœur fondant";
    expect(findTerms(text, terms).map(([start, end]) => text.slice(start, end))).toEqual([
      "velouté",
      "cœur",
    ]);
  });
});

describe("matchedIngredients", () => {
  it("names each matched ingredient once and in full", () => {
    const ingredients = ["Chocolat noir", "Beurre", "Chocolat noir", "Sucre"];
    expect(matchedIngredients(ingredients, new Set(["chocolat", "beurre"]))).toEqual([
      "Chocolat noir",
      "Beurre",
    ]);
  });
});

describe("byRelevance", () => {
  const hit = (score: number) => ({ score, terms: new Set<string>() });

  it("orders by score, then the newest, then the id for a stable order", () => {
    const hits = new Map([
      ["b", hit(1)],
      ["a", hit(1)],
      ["c", hit(1)],
      ["d", hit(5)],
    ]);
    const entries = [
      { id: "b", date: 1 },
      { id: "a", date: 1 },
      { id: "c", date: 2 },
      { id: "d", date: 0 },
    ];
    expect(entries.sort(byRelevance(hits)).map(({ id }) => id)).toEqual(["d", "c", "a", "b"]);
  });
});

describe("recipeSearchFields", () => {
  it("indexes the labels with the SEO keywords, and each ingredient by name", () => {
    const fields = recipeSearchFields(
      {
        title: "Tarte",
        keywords: ["dessert"],
        excerpt: "Acidulée",
        ingredientGroups: [
          { ingredients: [{ name: "Farine" }] },
          { ingredients: [{ name: "Citron" }] },
        ],
      },
      ["Tartes", "Été"],
    );

    expect(fields).toEqual({
      title: "Tarte",
      labels: "Tartes Été dessert",
      ingredients: ["Farine", "Citron"],
      excerpt: "Acidulée",
    });
  });
});
