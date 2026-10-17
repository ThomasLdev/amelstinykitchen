import { useTranslations } from "@i18n";
import { formatDuration, totalTime } from "@lib/content/recipe";
import { formatIngredient, type ResolvedRecipe } from "@lib/seo/recipe";

/**
 * A recipe as plain Markdown for LLMs and agents (`.md` twin, llms-full.txt):
 * the same facts as the page, without the interface.
 */
export function recipeMarkdown(recipe: ResolvedRecipe): string {
  const t = useTranslations(recipe.locale);
  const duration = (minutes: number) => formatDuration(minutes, recipe.locale);

  const facts = [
    [t.recipe.prep, duration(recipe.preparationTime)],
    [t.recipe.cook, duration(recipe.cookingTime)],
    [t.recipe.total, duration(totalTime(recipe.preparationTime, recipe.cookingTime))],
    [t.recipe.servings.label, String(recipe.servings)],
    [t.markdown.category, recipe.category],
    [t.markdown.cuisine, recipe.cuisine],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `- **${label}**${t.markdown.separator}${value}`);

  const ingredients = recipe.ingredientGroups.flatMap((group) => [
    ...(group.label ? [`### ${group.label}`, ""] : []),
    ...group.ingredients.map((ingredient) => `- ${formatIngredient(ingredient, recipe.locale)}`),
    "",
  ]);

  const steps = recipe.steps.map(
    (step, index) =>
      `${index + 1}. ${step.title && step.text ? `**${step.title}** — ${step.text}` : step.text || step.title}`,
  );

  return [
    `# ${recipe.title}`,
    "",
    ...(recipe.description ? [recipe.description, ""] : []),
    `${t.markdown.source}${t.markdown.separator}${recipe.url}`,
    "",
    ...facts,
    "",
    ...(ingredients.length > 0 ? [`## ${t.recipe.view.ingredients}`, "", ...ingredients] : []),
    ...(steps.length > 0 ? [`## ${t.recipe.view.steps}`, "", ...steps, ""] : []),
    ...(recipe.chefNote ? [`## ${recipe.chefNote.title}`, "", recipe.chefNote.body, ""] : []),
  ].join("\n");
}
