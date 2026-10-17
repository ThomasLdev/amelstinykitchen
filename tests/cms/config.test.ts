import { cms } from "@lib/content/cms";
import { z } from "astro/zod";
import { describe, expect, it } from "vitest";
import { buildConfig, cmsFields } from "../../cms/config.mjs";

// Same options as Astro's `.astro/collections/*.schema.json` (content/types-generator).
const jsonSchema = (schema: z.ZodType) =>
  z.toJSONSchema(schema, {
    unrepresentable: "any",
    io: "input",
    override: (ctx) => {
      if (ctx.zodSchema._zod.def.type === "date") {
        ctx.jsonSchema.type = "string";
        ctx.jsonSchema.format = "date-time";
      }
    },
  });

const reference = z
  .union([z.string(), z.object({ id: z.string(), collection: z.string() })])
  .meta(cms({ label: "Tag", widget: "relation", collection: "tags" }));

const recipe = z.object({
  translationKey: z.string().meta(cms(false)),
  title: z.string().meta(cms({ label: "Titre", translate: true })),
  paths: z
    .string()
    .regex(/^[a-z-]+$/)
    .meta(cms({ label: "Slug", translate: true, hint: "Minuscules et tirets." })),
  difficulty: z
    .enum(["easy", "hard"])
    .meta(cms({ label: "Difficulté", options: { easy: "Facile" } })),
  tags: z
    .array(reference)
    .default([])
    .meta(cms({ label: "Tags" })),
  publishDate: z.coerce.date().meta(cms({ label: "Date" })),
  steps: z
    .array(
      z.object({
        text: z.string().meta(cms({ label: "Texte", widget: "markdown", translate: true })),
        minutes: z
          .number()
          .int()
          .positive()
          .meta(cms({ label: "Minutes" })),
      }),
    )
    .default([])
    .meta(cms({ label: "Étapes" })),
});

const fields = cmsFields(jsonSchema(recipe));
const field = (name: string) =>
  fields.find((candidate: { name: string }) => candidate.name === name);

describe("CMS config generator", () => {
  it("translates only the fields marked so, and lists holding one", () => {
    expect(field("title").i18n).toBe(true);
    expect(field("difficulty").i18n).toBe("duplicate");
    expect(field("steps").i18n).toBe(true);
    expect(field("steps").fields.map((child: { i18n: unknown }) => child.i18n)).toEqual([
      true,
      "duplicate",
    ]);
  });

  it("keeps out the fields the CMS writes itself", () => {
    expect(fields.map((candidate: { name: string }) => candidate.name)).toEqual([
      "title",
      "paths",
      "difficulty",
      "tags",
      "publishDate",
      "steps",
    ]);
  });

  it("maps schema types and hints to Sveltia widgets", () => {
    expect(field("difficulty").options).toEqual([
      { label: "Facile", value: "easy" },
      { label: "hard", value: "hard" },
    ]);
    expect(field("tags")).toMatchObject({
      widget: "relation",
      collection: "tags",
      multiple: true,
      required: false,
    });
    expect(field("paths").pattern).toEqual(["^[a-z-]+$", "Minuscules et tirets."]);
    expect(field("publishDate")).toMatchObject({ widget: "datetime", format: "YYYY-MM-DD" });
    expect(field("steps").fields[1]).toMatchObject({ widget: "number", value_type: "int", min: 1 });
  });

  it("fails on a field without CMS hints", () => {
    expect(() => cmsFields(jsonSchema(z.object({ title: z.string() })))).toThrow(/title/);
  });

  it("edits a both-locales-in-one-file collection from its default-locale shape", () => {
    const tag = z.object({ title: z.string().meta(cms({ label: "Titre", translate: true })) });
    const taxonomy = jsonSchema(z.object({ fr: tag, en: tag }));
    const { collections } = buildConfig({
      recipes: jsonSchema(recipe),
      posts: jsonSchema(recipe),
      categories: taxonomy,
      tags: taxonomy,
    });
    const tags = collections.find((collection: { name: string }) => collection.name === "tags");

    expect(tags).toMatchObject({
      i18n: { structure: "single_file" },
      fields: [{ name: "title", label: "Titre", widget: "string", i18n: true }],
    });
  });
});
