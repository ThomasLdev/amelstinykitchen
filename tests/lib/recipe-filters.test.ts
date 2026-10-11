import {
  activeFilterCount,
  categoryCounts,
  DEFAULT_STATE,
  type FilterState,
  matches,
  normalizeText,
  plural,
  type RecipeFacet,
  sortRecipes,
  stateFromParams,
  stateToParams,
} from "@lib/content/recipe-filters";
import { describe, expect, it } from "vitest";

const facet = (id: string, overrides: Partial<RecipeFacet> = {}): RecipeFacet => ({
  id,
  category: "plats",
  seasons: [],
  tags: [],
  time: 30,
  date: 0,
  featured: false,
  search: normalizeText(id),
  ...overrides,
});

const state = (overrides: Partial<FilterState> = {}): FilterState => ({
  ...DEFAULT_STATE,
  ...overrides,
});

describe("matches", () => {
  const tart = facet("tarte au citron", {
    category: "patisserie",
    seasons: ["winter"],
    tags: ["citron", "vegetarien"],
  });

  it("requires every selected tag, not just one", () => {
    expect(matches(tart, state({ tags: ["citron", "vegetarien"] }))).toBe(true);
    expect(matches(tart, state({ tags: ["citron", "chocolat"] }))).toBe(false);
  });

  it("finds the name regardless of case and accents", () => {
    const summer = facet("salade d'été");
    expect(matches(summer, state({ query: "  SALADE d'ETE " }))).toBe(true);
  });

  it("can ignore the category to count the other options", () => {
    const filters = state({ category: "plats", season: "winter" });
    expect(matches(tart, filters)).toBe(false);
    expect(matches(tart, filters, "category")).toBe(true);
  });
});

describe("sortRecipes", () => {
  const recipes = [
    facet("b-old-featured", { featured: true, date: 1, time: 0 }),
    facet("a-new", { date: 3, time: 45 }),
    facet("c-quick", { date: 2, time: 10 }),
  ];
  const ids = (list: RecipeFacet[]) => list.map((recipe) => recipe.id);

  it("puts featured recipes first, then the newest", () => {
    expect(ids(sortRecipes(recipes, "popular"))).toEqual(["b-old-featured", "a-new", "c-quick"]);
  });

  it("sends recipes without a known time last when sorting by duration", () => {
    expect(ids(sortRecipes(recipes, "quick"))).toEqual(["c-quick", "a-new", "b-old-featured"]);
  });

  it("is deterministic on ties", () => {
    const tie = [facet("b"), facet("a")];
    expect(ids(sortRecipes(tie, "recent"))).toEqual(["a", "b"]);
  });
});

describe("categoryCounts", () => {
  it("counts each category under the other filters, with the total under ''", () => {
    const recipes = [
      facet("1", { category: "plats", seasons: ["winter"] }),
      facet("2", { category: "desserts", seasons: ["winter"] }),
      facet("3", { category: "desserts", seasons: ["summer"] }),
    ];
    const counts = categoryCounts(recipes, state({ category: "plats", season: "winter" }));

    expect(Object.fromEntries(counts)).toEqual({ "": 2, plats: 1, desserts: 1 });
  });
});

describe("URL state", () => {
  it("round-trips a filtered state and keeps a bare URL by default", () => {
    const filtered = state({
      category: "desserts",
      season: "winter",
      tags: ["citron", "vegetarien"],
      query: "tarte",
      sort: "quick",
    });

    expect(stateFromParams(stateToParams(filtered))).toEqual(filtered);
    expect(stateToParams(DEFAULT_STATE).toString()).toBe("");
  });

  it("ignores an unknown sort", () => {
    expect(stateFromParams(new URLSearchParams("sort=random")).sort).toBe("popular");
  });
});

describe("activeFilterCount", () => {
  it("counts category, season and each tag, but not the name filter", () => {
    expect(activeFilterCount(state({ category: "x", tags: ["a", "b"], query: "tarte" }))).toBe(3);
  });
});

describe("plural", () => {
  it("picks the zero / one / other form", () => {
    const forms = { zero: "Aucune", one: "1 recette", other: "%count% recettes" };
    expect([0, 1, 4].map((count) => plural(forms, count))).toEqual([
      "Aucune",
      "1 recette",
      "4 recettes",
    ]);
  });
});
