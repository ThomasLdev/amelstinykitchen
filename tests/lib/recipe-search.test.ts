// cspell:ignore citon choco oeufs
import { createRecipeSearch, type SearchFields } from "@lib/content/recipe-search";
import { describe, expect, it } from "vitest";

const recipe = (id: string, fields: Partial<SearchFields>) => ({
  id,
  search: { title: "", labels: "", ingredients: "", excerpt: "", ...fields },
});

const search = createRecipeSearch([
  recipe("tarte", {
    title: "Tarte au citron meringuée",
    labels: "Pâtisserie Citron Végétarien Hiver",
    ingredients: "Farine Beurre Citrons Sucre",
  }),
  recipe("fondant", {
    title: "Fondant au chocolat",
    labels: "Desserts Chocolat",
    ingredients: "Chocolat noir Beurre Œufs",
  }),
  recipe("soupe", {
    title: "Velouté d'hiver",
    labels: "Plats",
    ingredients: "Poireaux Pommes de terre Crème",
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

  it("treats an empty or stop-word-only query as no search", () => {
    expect(search("  ")).toBeUndefined();
    expect(search("de la")).toBeUndefined();
  });
});
