import type { ResolvedRecipe } from "@lib/seo/recipe";

export const recipe: ResolvedRecipe = {
  locale: "fr",
  url: "https://example.com/fr/recipes/tarte/",
  markdownUrl: "https://example.com/fr/recipes/tarte.md",
  title: "Tarte",
  description: "Une tarte.",
  category: "Pâtisserie",
  keywords: ["citron", "meringue"],
  preparationTime: 40,
  cookingTime: 25,
  servings: 8,
  publishDate: new Date("2026-03-01T00:00:00Z"),
  images: ["https://example.com/a.jpg"],
  ingredientGroups: [
    { label: "Pâte", ingredients: [{ name: "Farine", quantity: 250, unit: "g" }] },
    { ingredients: [{ name: "Sel", quantity: null, unit: "une pincée" }] },
  ],
  steps: [
    { title: "Préparer", text: "Mélangez.", image: "https://example.com/s.jpg" },
    { title: "Cuire", text: "" },
  ],
};
