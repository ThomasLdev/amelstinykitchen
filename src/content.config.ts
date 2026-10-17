import { defineCollection } from "astro:content";
import { cms } from "@lib/content/cms";
import {
  category,
  difficulty,
  draft,
  excerpt,
  isFeatured,
  locale,
  markdown,
  metaDescription,
  metaTitle,
  paths,
  publishDate,
  sameInBothLocales,
  seasons,
  sharedSchemas,
  tags,
  taxonomyImage,
  text,
  translationKey,
  updatedDate,
} from "@lib/content/fields";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Recipes and posts are stored one file per locale (`recipes/fr/…`,
 * `recipes/en/…`), paired by `translationKey`. Tags and categories keep one
 * file per entry with both locales inside, so references stay a stable id.
 * `.meta(cms(…))`: see src/lib/content/cms.ts.
 */

/**
 * Content root. The e2e suite points it at `e2e/fixtures/content` so tests
 * never depend on the editorial content (see playwright.config.ts).
 */
const contentDir = process.env.CONTENT_DIR ?? "./src/content";

const tagsCollection = defineCollection({
  loader: glob({ base: `${contentDir}/tags`, pattern: "**/*.json" }),
  schema: ({ image }) => {
    const tag = z.object({
      title: text("Titre"),
      paths,
      isFeatured,
      image: taxonomyImage(image),
    });

    return z.object({ fr: tag, en: tag }).superRefine(sameInBothLocales(["isFeatured", "image"]));
  },
});

const categoriesCollection = defineCollection({
  loader: glob({ base: `${contentDir}/categories`, pattern: "**/*.json" }),
  schema: ({ image }) => {
    const categoryEntry = z.object({
      title: text("Titre"),
      paths,
      description: z
        .string()
        .default("")
        .meta(cms({ label: "Description", widget: "text", translate: true })),
      isFeatured,
      position: z
        .number()
        .int()
        .default(0)
        .meta(cms({ label: "Position" })),
      image: taxonomyImage(image),
    });

    return z
      .object({ fr: categoryEntry, en: categoryEntry })
      .superRefine(sameInBothLocales(["isFeatured", "position", "image"]));
  },
});

const recipes = defineCollection({
  loader: glob({ base: `${contentDir}/recipes`, pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) => {
    const { mediaList, section } = sharedSchemas(image);

    const ingredient = z.object({
      name: text("Ingrédient"),
      /** Scalable amount; `null` when it should not scale with the number of servings. */
      quantity: z
        .number()
        .nonnegative()
        .nullable()
        .default(null)
        .meta(
          cms({
            label: "Quantité",
            hint: "Laisser vide si la quantité ne dépend pas du nombre de portions.",
          }),
        ),
      unit: z
        .string()
        .default("")
        .meta(cms({ label: "Unité", translate: true })),
      /** Rendered quantity override (e.g. "½", "1 zeste de citron"). */
      display: text(
        "Affichage",
        "Remplace la quantité affichée (ex. « ½ », « 1 pincée »).",
      ).optional(),
    });

    const ingredientGroup = z.object({
      label: z
        .string()
        .default("")
        .meta(cms({ label: "Groupe", translate: true, hint: "Ex. « Pâte sablée ». Optionnel." })),
      ingredients: z
        .array(ingredient)
        .default([])
        .meta(cms({ label: "Ingrédients" })),
    });

    const step = z.object({
      title: text("Titre"),
      content: markdown("Contenu"),
      tip: z
        .object({
          type: z
            .enum(["tip", "warning"])
            .default("tip")
            .meta(cms({ label: "Type", options: { tip: "Astuce", warning: "Attention" } })),
          text: text("Texte"),
        })
        .optional()
        .meta(cms({ label: "Astuce" })),
      media: mediaList("Illustrations"),
    });

    const minutes = (label: string) =>
      z.number().int().nonnegative().default(0).meta(cms({ label }));

    return (
      z
        .object({
          locale,
          translationKey,
          title: text("Titre"),
          paths,
          excerpt,
          metaTitle: metaTitle.optional(),
          metaDescription: metaDescription.optional(),
          category,
          tags,
          seasons,
          /** schema.org `recipeCuisine` (e.g. "Française"). */
          cuisine: text("Cuisine", "Ex. « Française ».").optional(),
          /** schema.org `keywords`; the tag titles are used when empty. */
          keywords: z
            .array(text("Mot-clé"))
            .default([])
            .meta(
              cms({ label: "Mots-clés", hint: "Pour le SEO ; les tags sont utilisés si vide." }),
            ),
          /** One or more recipe visuals; the first is the hero, rendered as a carousel when there are several. */
          media: mediaList("Visuels"),
          difficulty,
          preparationTime: minutes("Préparation (min)"),
          cookingTime: minutes("Cuisson (min)"),
          servings: z
            .number()
            .int()
            .positive()
            .default(4)
            .meta(cms({ label: "Portions" })),
          isFeatured,
          draft,
          publishDate,
          updatedDate,
          ingredientGroups: z
            .array(ingredientGroup)
            .default([])
            .meta(cms({ label: "Groupes d'ingrédients" })),
          steps: z
            .array(step)
            .default([])
            .meta(cms({ label: "Étapes" })),
          /** Narrative fallback shown when a recipe has no steps. */
          sections: z
            .array(section)
            .default([])
            .meta(
              cms({
                label: "Sections",
                hint: "Affichées seulement si la recette n'a pas d'étapes.",
              }),
            ),
          chefNote: z
            .object({ title: text("Titre"), body: markdown("Texte") })
            .optional()
            .meta(
              cms({
                label: "Astuce de la recette",
                hint: "Encadré mis en avant en fin de recette.",
              }),
            ),
        })
        // Google requires an image for Recipe rich results.
        .refine((recipe) => recipe.draft || recipe.media.length > 0, {
          message: "A published recipe needs at least one `media` (Recipe rich results).",
        })
        .refine(
          (recipe) => recipe.draft || (recipe.metaDescription ?? recipe.excerpt).trim() !== "",
          {
            message:
              "A published recipe needs an `excerpt` or a `metaDescription` (meta description).",
          },
        )
    );
  },
});

const posts = defineCollection({
  loader: glob({ base: `${contentDir}/posts`, pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) => {
    const { media, section } = sharedSchemas(image);

    return z.object({
      locale,
      translationKey,
      title: text("Titre"),
      paths,
      excerpt,
      metaTitle: metaTitle.optional(),
      metaDescription: metaDescription.optional(),
      category,
      tags,
      hero: media.optional().meta(cms({ label: "Visuel principal" })),
      isFeatured,
      draft,
      publishDate,
      updatedDate,
      sections: z
        .array(section)
        .default([])
        .meta(cms({ label: "Sections" })),
    });
  },
});

export const collections = {
  recipes,
  posts,
  categories: categoriesCollection,
  tags: tagsCollection,
};
