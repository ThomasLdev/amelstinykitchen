import type { CollectionEntry } from "astro:content";
import fr from "@i18n/fr";
import {
  catalogRecipe,
  getPublishedRecipes,
  loadRecipeCatalog,
  loadTaxonomies,
} from "@lib/content/recipe-catalog";
import { afterEach, describe, expect, it, vi } from "vitest";

const stored = (id: string, data: Record<string, unknown>) => ({
  id,
  data: {
    locale: id.slice(0, 2),
    draft: false,
    publishDate: new Date("2026-03-01"),
    title: id,
    excerpt: "",
    keywords: [],
    category: { id: "tartes" },
    tags: [],
    seasons: [],
    preparationTime: 0,
    cookingTime: 0,
    ingredientGroups: [],
    ...data,
  },
});

const store: Record<string, ReturnType<typeof stored>[] | object[]> = {
  recipes: [
    stored("fr/ancienne", { publishDate: new Date("2026-01-01") }),
    stored("fr/b-meme-jour", {}),
    stored("fr/a-meme-jour", {}),
    stored("fr/brouillon", { draft: true, publishDate: new Date("2026-06-01") }),
    stored("en/old", { publishDate: new Date("2026-01-01") }),
  ],
  categories: [{ id: "tartes", data: { fr: { title: "Tartes" }, en: { title: "Pies" } } }],
  tags: [{ id: "citron", data: { fr: { title: "Citron" }, en: { title: "Lemon" } } }],
};

// The real filter callback runs against hand-made entries, never the editorial content.
vi.mock("astro:content", () => ({
  getCollection: async (name: string, filter?: (entry: unknown) => boolean) =>
    (store[name] ?? []).filter((entry) => filter?.(entry) ?? true),
}));

afterEach(() => vi.unstubAllEnvs());

const ids = (recipes: Array<{ id: string }>) => recipes.map(({ id }) => id);

describe("getPublishedRecipes", () => {
  it("leaves drafts out of production builds, newest first, the id breaking ties", async () => {
    vi.stubEnv("PROD", true);

    expect(ids(await getPublishedRecipes("fr"))).toEqual([
      "fr/a-meme-jour",
      "fr/b-meme-jour",
      "fr/ancienne",
    ]);
  });

  it("shows drafts in dev, and every locale when none is given", async () => {
    vi.stubEnv("PROD", false);

    expect(ids(await getPublishedRecipes())).toEqual([
      "fr/brouillon",
      "fr/a-meme-jour",
      "fr/b-meme-jour",
      "en/old",
      "fr/ancienne",
    ]);
  });
});

describe("loadTaxonomies", () => {
  it("indexes categories and tags by id, seen in one locale", async () => {
    const { categories, tags } = await loadTaxonomies("en");

    expect(categories.get("tartes")?.data.title).toBe("Pies");
    expect(tags.get("citron")?.data.title).toBe("Lemon");
  });
});

describe("loadRecipeCatalog", () => {
  it("lists the published recipes of a locale with their localized category", async () => {
    vi.stubEnv("PROD", true);
    const catalog = await loadRecipeCatalog("fr");

    expect(ids(catalog.map(({ recipe }) => recipe))).toEqual([
      "fr/a-meme-jour",
      "fr/b-meme-jour",
      "fr/ancienne",
    ]);
    expect(catalog.every(({ categoryLabel }) => categoryLabel === "Tartes")).toBe(true);
  });
});

const localized = (id: string, title: string) => ({ id, data: { title } });
const taxonomies = {
  categories: new Map([["tartes", localized("tartes", "Tartes")]]),
  tags: new Map([["citron", localized("citron", "Citron")]]),
} as unknown as Parameters<typeof catalogRecipe>[1];

const recipe = {
  id: "fr/tarte",
  data: {
    title: "Tarte",
    excerpt: "",
    keywords: [],
    category: { id: "tartes" },
    tags: [{ id: "citron" }, { id: "supprime" }],
    seasons: ["winter", "summer"],
    preparationTime: 20,
    cookingTime: 30,
    ingredientGroups: [],
  },
} as unknown as CollectionEntry<"recipes">;

describe("catalogRecipe", () => {
  it("localizes the labels, in season order, and skips a tag that no longer exists", () => {
    const entry = catalogRecipe(recipe, taxonomies, "fr");

    expect(entry.categoryLabel).toBe("Tartes");
    expect(entry.tags).toEqual([{ id: "citron", title: "Citron" }]);
    expect(entry.seasons).toEqual(["summer", "winter"]);
    expect(entry.seasonLabels).toEqual([fr.recipes.seasons.summer, fr.recipes.seasons.winter]);
    expect(entry.time).toBe(50);
    expect(entry.search.labels).toBe(
      ["Tartes", "Citron", fr.recipes.seasons.summer, fr.recipes.seasons.winter].join(" "),
    );
  });
});
