import { reference } from "astro:content";
import { cms } from "@lib/content/cms";
import { SEASONS } from "@lib/content/season";
import { z } from "astro/zod";

export const locale = z
  .enum(["fr", "en"])
  .meta(cms({ label: "Langue", widget: "hidden", default: "{{locale}}", translate: true }));

/** Written by the CMS (`canonical_slug` in cms/config.mjs), same in both files of a pair. */
export const translationKey = z.string().meta(cms(false));

export const difficulty = z
  .enum(["easy", "medium", "advanced"])
  .meta(
    cms({ label: "Difficulté", options: { easy: "Facile", medium: "Moyen", advanced: "Avancé" } }),
  );

export const seasons = z
  .array(
    z.enum(SEASONS).meta(
      cms({
        label: "Saison",
        options: { spring: "Printemps", summer: "Été", autumn: "Automne", winter: "Hiver" },
      }),
    ),
  )
  .default([])
  .meta(cms({ label: "Saisons", hint: "Laisser vide pour une recette de toute l'année." }));

export const text = (label: string, hint?: string) =>
  z.string().meta(cms({ label, translate: true, ...(hint && { hint }) }));

export const paths = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, digits and single hyphens only.")
  .meta(
    cms({
      label: "Slug d'URL",
      translate: true,
      hint: "Segment d'URL : minuscules, chiffres et tirets, sans accents (ex. tarte-au-citron).",
    }),
  );

/** Taxonomy fields entered once in the CMS must not differ between locales. */
export const sameInBothLocales =
  (keys: string[]) =>
  (value: Record<"fr" | "en", Record<string, unknown>>, ctx: z.RefinementCtx) => {
    for (const key of keys) {
      if (JSON.stringify(value.fr[key]) !== JSON.stringify(value.en[key])) {
        ctx.addIssue({
          code: "custom",
          path: ["en", key],
          message: `\`${key}\` must be the same in both locales.`,
        });
      }
    }
  };

export const metaTitle = text(
  "Titre SEO",
  "Remplace le titre dans l'onglet et les moteurs de recherche.",
);

export const metaDescription = z
  .string()
  .meta(cms({ label: "Description SEO", widget: "text", translate: true }));

export const excerpt = z
  .string()
  .default("")
  .meta(cms({ label: "Chapô", widget: "text", translate: true }));

export const markdown = (label: string) =>
  z.string().meta(cms({ label, widget: "markdown", translate: true }));

export const category = reference("categories").meta(
  cms({ label: "Catégorie", widget: "relation", collection: "categories" }),
);

export const tags = z
  .array(reference("tags").meta(cms({ label: "Tag", widget: "relation", collection: "tags" })))
  .default([])
  .meta(cms({ label: "Tags" }));

export const isFeatured = z
  .boolean()
  .default(false)
  .meta(cms({ label: "Mis en avant" }));

export const draft = z
  .boolean()
  .default(false)
  .meta(cms({ label: "Brouillon", hint: "Un brouillon n'est pas publié en production." }));

export const publishDate = z.coerce.date().meta(cms({ label: "Date de publication" }));

export const updatedDate = z.coerce
  .date()
  .optional()
  .meta(cms({ label: "Date de mise à jour" }));

/** Shared media + narrative-section schemas, bound to the collection image helper. */
export function sharedSchemas<T extends z.ZodType>(image: () => T) {
  const media = z.object({
    src: image().meta(cms({ label: "Image", widget: "image" })),
    alt: text("Texte alternatif", "Décrit l'image pour les lecteurs d'écran."),
    title: text("Légende").optional(),
  });

  const mediaList = (label: string) =>
    z
      .array(media)
      .default([])
      .meta(cms({ label, hint: "Plusieurs images s'affichent en carrousel." }));

  const section = z.object({
    title: text("Titre"),
    content: markdown("Contenu"),
    media: mediaList("Illustrations"),
  });

  return { media, mediaList, section };
}

export const taxonomyImage = <T extends z.ZodType>(image: () => T) =>
  image()
    .optional()
    .meta(cms({ label: "Image", widget: "image" }));
