import type { Locale } from "@i18n";
import { totalTime } from "@lib/content/recipe";
import { formatIngredient, isoDuration, type ResolvedRecipe } from "@lib/seo/recipe";

type JsonLd = Record<string, unknown>;

interface Publisher {
  name: string;
  url: string;
  sameAs: string[];
}

function compact(object: JsonLd): JsonLd {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined && !(Array.isArray(value) && value.length === 0),
    ),
  );
}

function personLd({ name, url, sameAs }: Publisher): JsonLd {
  return compact({ "@type": "Person", name, url, sameAs });
}

export function websiteLd(input: {
  url: string;
  name: string;
  description: string;
  locale: Locale;
  publisher: Publisher;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    url: input.url,
    description: input.description,
    inLanguage: input.locale,
    publisher: personLd(input.publisher),
  };
}

/** Summary page of the Google recipe carousel: a top-level ItemList of positions and URLs. */
export function itemListLd(input: { url: string; name: string; items: string[] }): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url: input.url,
    itemListElement: input.items.map((url, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url,
    })),
  };
}

export function breadcrumbLd(items: { name: string; url?: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) =>
      compact({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url }),
    ),
  };
}

/**
 * schema.org Recipe (Google rich results, Pinterest Rich Pins). Ratings,
 * nutrition and video are left out on purpose: there is no data for them and
 * made-up values are against Google's guidelines.
 */
export function recipeLd(recipe: ResolvedRecipe, author: Publisher): JsonLd {
  const total = totalTime(recipe.preparationTime, recipe.cookingTime);
  // Google wants prepTime and cookTime together: a no-bake recipe gets "PT0M".
  const pairedDuration = (minutes: number) =>
    total > 0 ? (isoDuration(minutes) ?? "PT0M") : undefined;

  return compact({
    "@context": "https://schema.org",
    "@type": "Recipe",
    "@id": `${recipe.url}#recipe`,
    name: recipe.title,
    description: recipe.description || undefined,
    url: recipe.url,
    image: recipe.images,
    author: personLd(author),
    datePublished: recipe.publishDate.toISOString(),
    dateModified: (recipe.updatedDate ?? recipe.publishDate).toISOString(),
    inLanguage: recipe.locale,
    prepTime: pairedDuration(recipe.preparationTime),
    cookTime: pairedDuration(recipe.cookingTime),
    totalTime: isoDuration(total),
    recipeYield: String(recipe.servings),
    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine,
    keywords: recipe.keywords.length > 0 ? recipe.keywords.join(", ") : undefined,
    recipeIngredient: recipe.ingredientGroups.flatMap((group) =>
      group.ingredients.map((ingredient) => formatIngredient(ingredient, recipe.locale)),
    ),
    recipeInstructions: recipe.steps.map((step, index) =>
      compact({
        "@type": "HowToStep",
        name: step.title || undefined,
        text: step.text || step.title,
        url: `${recipe.url}#step-${index + 1}`,
        image: step.image,
      }),
    ),
  });
}

/** JSON for an inline `<script type="application/ld+json">`, safe against `</script>`. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
