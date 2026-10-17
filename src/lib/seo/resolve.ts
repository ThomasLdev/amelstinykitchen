import { type CollectionEntry, getEntries, getEntry } from "astro:content";
import { getAbsoluteLocaleUrl } from "astro:i18n";
import { recipePath } from "@lib/content/recipe";
import { schemaImages, stepImage } from "@lib/seo/images";
import { type ResolvedRecipe, stripHtml } from "@lib/seo/recipe";

/** Absolute URL of the Markdown twin served by `[slug].md.ts`. */
const recipeMarkdownUrl = (recipe: CollectionEntry<"recipes">) =>
  getAbsoluteLocaleUrl(recipe.data.locale, recipePath(recipe)).replace(/\/$/, ".md");

/** `images: false` skips image generation for text-only outputs (Markdown, feeds). */
export async function resolveRecipe(
  recipe: CollectionEntry<"recipes">,
  site: URL,
  { images = true }: { images?: boolean } = {},
): Promise<ResolvedRecipe> {
  const { data } = recipe;
  const { locale } = data;
  const category = await getEntry(data.category);
  const tags = await getEntries(data.tags);
  const keywords =
    data.keywords.length > 0 ? data.keywords : tags.map((tag) => tag.data[locale].title);
  const hero = data.media[0];

  return {
    locale,
    url: getAbsoluteLocaleUrl(locale, recipePath(recipe)),
    markdownUrl: recipeMarkdownUrl(recipe),
    title: data.title,
    description: data.metaDescription ?? data.excerpt,
    category: category?.data[locale].title,
    cuisine: data.cuisine,
    keywords,
    preparationTime: data.preparationTime,
    cookingTime: data.cookingTime,
    servings: data.servings,
    publishDate: data.publishDate,
    updatedDate: data.updatedDate,
    images: images && hero ? await schemaImages(hero.src, site) : [],
    ingredientGroups: data.ingredientGroups.map((group) => ({
      label: group.label || undefined,
      ingredients: group.ingredients,
    })),
    steps: await Promise.all(
      data.steps.map(async (step) => ({
        title: step.title,
        text: stripHtml(step.content),
        image: images && step.media[0] ? await stepImage(step.media[0].src, site) : undefined,
      })),
    ),
    chefNote: data.chefNote && {
      title: data.chefNote.title,
      body: stripHtml(data.chefNote.body),
    },
  };
}
