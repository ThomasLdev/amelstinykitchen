import { defineCollection, reference } from "astro:content";
import { localizedString } from "@lib/content/i18n";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Every entry is authored once (id = translationKey) and carries its neutral
 * data (images, timings, enums, quantities…) a single time. Only textual
 * fields are localized inline as `{ fr, en }`.
 */

const emptyLocalized = { fr: "", en: "" };

const sectionType = z.enum(["default", "two_columns", "two_columns_media_left"]);
const difficulty = z.enum(["easy", "medium", "advanced"]);

/** Shared media + narrative-section schemas, bound to the collection image helper. */
function sharedSchemas(image: () => z.ZodType) {
  const media = z.object({
    src: image(),
    alt: localizedString,
    title: localizedString.optional(),
  });

  const section = z.object({
    type: sectionType.default("default"),
    title: localizedString,
    content: localizedString,
    image: media.optional(),
  });

  return { media, section };
}

const tags = defineCollection({
  loader: glob({ base: "./src/content/tags", pattern: "**/*.json" }),
  schema: ({ image }) =>
    z.object({
      title: localizedString,
      paths: localizedString,
      isFeatured: z.boolean().default(false),
      image: image().optional(),
    }),
});

const categories = defineCollection({
  loader: glob({ base: "./src/content/categories", pattern: "**/*.json" }),
  schema: ({ image }) =>
    z.object({
      title: localizedString,
      paths: localizedString,
      description: localizedString.default(emptyLocalized),
      isFeatured: z.boolean().default(false),
      position: z.number().int().default(0),
      image: image().optional(),
    }),
});

const recipes = defineCollection({
  loader: glob({ base: "./src/content/recipes", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) => {
    const { media, section } = sharedSchemas(image);

    const ingredient = z.object({
      name: localizedString,
      /** Scalable amount; `null` when it should not scale with the number of servings. */
      quantity: z.number().nonnegative().nullable().default(null),
      unit: localizedString.default(emptyLocalized),
      /** Rendered quantity override (e.g. "½", "1 zeste de citron"). */
      display: localizedString.optional(),
    });

    const ingredientGroup = z.object({
      label: localizedString.default(emptyLocalized),
      ingredients: z.array(ingredient).default([]),
    });

    const step = z.object({
      title: localizedString,
      content: localizedString,
      tip: z
        .object({
          type: z.enum(["tip", "warning"]).default("tip"),
          text: localizedString,
        })
        .optional(),
      image: media.optional(),
    });

    return z.object({
      title: localizedString,
      paths: localizedString,
      excerpt: localizedString.default(emptyLocalized),
      metaTitle: localizedString.optional(),
      metaDescription: localizedString.optional(),
      category: reference("categories"),
      tags: z.array(reference("tags")).default([]),
      hero: media.optional(),
      difficulty,
      preparationTime: z.number().int().nonnegative().default(0),
      cookingTime: z.number().int().nonnegative().default(0),
      servings: z.number().int().positive().default(4),
      isFeatured: z.boolean().default(false),
      draft: z.boolean().default(false),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      ingredientGroups: z.array(ingredientGroup).default([]),
      steps: z.array(step).default([]),
      /** Narrative fallback shown when a recipe has no steps. */
      sections: z.array(section).default([]),
      chefNote: z
        .object({
          title: localizedString,
          body: localizedString,
        })
        .optional(),
    });
  },
});

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) => {
    const { media, section } = sharedSchemas(image);

    return z.object({
      title: localizedString,
      paths: localizedString,
      excerpt: localizedString.default(emptyLocalized),
      metaTitle: localizedString.optional(),
      metaDescription: localizedString.optional(),
      category: reference("categories"),
      tags: z.array(reference("tags")).default([]),
      hero: media.optional(),
      isFeatured: z.boolean().default(false),
      draft: z.boolean().default(false),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      sections: z.array(section).default([]),
    });
  },
});

export const collections = { recipes, posts, categories, tags };
