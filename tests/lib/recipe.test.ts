import {
  formatDuration,
  ingredientCount,
  isPublished,
  selectRelatedRecipes,
  totalTime,
} from "@lib/content/recipe";
import { describe, expect, it } from "vitest";

describe("recipe helpers", () => {
  it("formats durations per locale and hides empty values", () => {
    expect(formatDuration(0, "fr")).toBeNull();
    expect(formatDuration(45, "fr")).toBe("45 min");
    expect(formatDuration(90, "fr")).toBe("1 h 30");
    expect(formatDuration(90, "en")).toBe("1 hr 30");
    expect(formatDuration(120, "en")).toBe("2 hr");
  });

  it("derives total time and ingredient count", () => {
    expect(totalTime(40, 25)).toBe(65);
    expect(ingredientCount([{ ingredients: [1, 2] }, { ingredients: [3] }])).toBe(3);
  });
});

describe("isPublished", () => {
  it("hides drafts in production only", () => {
    const draft = { data: { draft: true } };
    expect(isPublished(draft, true)).toBe(false);
    expect(isPublished(draft, false)).toBe(true);
    expect(isPublished({ data: { draft: false } }, true)).toBe(true);
  });
});

describe("selectRelatedRecipes", () => {
  const entry = (id: string, category: string, tags: string[], day: number) => ({
    id,
    data: {
      category: { id: category },
      tags: tags.map((tag) => ({ id: tag })),
      publishDate: new Date(2026, 0, day),
    },
  });
  const current = entry("current", "desserts", ["citron", "ete"], 1);

  it("ranks by shared category then tags, newest first, without the recipe itself", () => {
    const candidates = [
      current,
      entry("one-tag", "plats", ["citron"], 5),
      entry("same-category", "desserts", [], 2),
      entry("category-and-tag", "desserts", ["ete"], 3),
      entry("newer-one-tag", "plats", ["ete"], 6),
      entry("unrelated", "plats", ["hiver"], 9),
    ];

    expect(selectRelatedRecipes(current, candidates).map(({ id }) => id)).toEqual([
      "category-and-tag",
      "same-category",
      "newer-one-tag",
    ]);
  });
});
