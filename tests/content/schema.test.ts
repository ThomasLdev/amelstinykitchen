import { z } from "astro/zod";
import { describe, expect, it } from "vitest";
import { collections } from "../../src/content.config";

type SchemaFactory = (context: { image: () => z.ZodType }) => z.ZodType;
const recipeSchema = (collections.recipes.schema as unknown as SchemaFactory)({
  image: () => z.string(),
});

const recipe = (data: Record<string, unknown> = {}) => ({
  locale: "fr",
  translationKey: "tarte",
  title: "Tarte",
  paths: "tarte",
  excerpt: "Une tarte.",
  category: "tartes",
  difficulty: "easy",
  publishDate: "2026-03-01",
  media: [{ src: "/src/assets/tarte.jpg", alt: "Une tarte" }],
  ...data,
});

const messages = (data: Record<string, unknown>) =>
  recipeSchema.safeParse(recipe(data)).error?.issues.map((issue) => issue.message) ?? [];

describe("recipes schema", () => {
  it("accepts a complete published recipe", () => {
    expect(messages({})).toEqual([]);
  });

  it("requires a cover and a description before publishing, not for a draft", () => {
    expect(messages({ media: [] })).toEqual([expect.stringMatching(/needs at least one `media`/)]);
    expect(messages({ excerpt: "  " })).toEqual([expect.stringMatching(/needs an `excerpt`/)]);
    expect(messages({ draft: true, media: [], excerpt: "" })).toEqual([]);
  });

  it("rejects a slug that is not URL-safe", () => {
    expect(messages({ paths: "Tarte au citron" })).toHaveLength(1);
  });
});
