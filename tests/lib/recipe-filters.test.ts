import {
  activeFilterCount,
  categoryCounts,
  DEFAULT_STATE,
  type FilterState,
  followDefaultSort,
  matches,
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
  search: { title: id, labels: "", ingredients: [], excerpt: "" },
  ...overrides,
});

const hit = (score: number) => ({ score, terms: new Set<string>() });

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
    expect(matches(tart, state({ tags: ["citron", "vegetarien"] }), undefined)).toBe(true);
    expect(matches(tart, state({ tags: ["citron", "chocolat"] }), undefined)).toBe(false);
  });

  it("keeps only the search hits while a query is typed", () => {
    expect(matches(tart, state(), new Map([["tarte au citron", hit(1)]]))).toBe(true);
    expect(matches(tart, state(), new Map())).toBe(false);
  });

  it("can ignore the category to count the other options", () => {
    const filters = state({ category: "plats", season: "winter" });
    expect(matches(tart, filters, undefined)).toBe(false);
    expect(matches(tart, filters, undefined, "category")).toBe(true);
  });
});

describe("sortRecipes", () => {
  const recipes = [
    facet("b-old", { date: 1, time: 0 }),
    facet("a-new", { date: 3, time: 45 }),
    facet("c-quick", { date: 2, time: 10 }),
  ];
  const ids = (list: RecipeFacet[]) => list.map((recipe) => recipe.id);

  it("orders by relevance score, the newest first on equal scores", () => {
    const hits = new Map([
      ["b-old", hit(5)],
      ["a-new", hit(2)],
      ["c-quick", hit(2)],
    ]);
    expect(ids(sortRecipes(recipes, "relevance", hits))).toEqual(["b-old", "a-new", "c-quick"]);
  });

  it("sends recipes without a known time last when sorting by duration", () => {
    expect(ids(sortRecipes(recipes, "quick"))).toEqual(["c-quick", "a-new", "b-old"]);
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
    const counts = categoryCounts(
      recipes,
      state({ category: "plats", season: "winter" }),
      undefined,
    );

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

  it("defaults to relevance with a query and to the newest without, kept out of the URL", () => {
    expect(stateFromParams(new URLSearchParams("q=tarte")).sort).toBe("relevance");
    expect(stateFromParams(new URLSearchParams("sort=random")).sort).toBe("recent");
    expect(stateFromParams(new URLSearchParams("sort=relevance")).sort).toBe("recent");
    expect(stateToParams(state({ query: "tarte", sort: "relevance" })).toString()).toBe("q=tarte");
  });
});

describe("followDefaultSort", () => {
  const before = state();

  it("switches between newest and relevance as the query comes and goes", () => {
    const typed = followDefaultSort(before, state({ query: "tarte" }));
    expect(typed.sort).toBe("relevance");
    expect(followDefaultSort(typed, state({ sort: "relevance" })).sort).toBe("recent");
  });

  it("drops relevance once the query is gone, even when picked, and ignores stop words", () => {
    const picked = state({ query: "tarte", sort: "relevance" });
    expect(followDefaultSort(picked, state({ sort: "relevance" })).sort).toBe("recent");
    expect(followDefaultSort(before, state({ query: "de" })).sort).toBe("recent");
  });

  it("keeps a sort the visitor picked", () => {
    const picked = followDefaultSort(before, state({ sort: "quick" }));
    expect(followDefaultSort(picked, state({ query: "tarte", sort: "quick" })).sort).toBe("quick");
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
