import Ingredients from "@components/Ingredients.astro";
import { describe, expect, it } from "vitest";
import { count, createContainer } from "../helpers";

const container = await createContainer();

describe("Ingredients", () => {
  const groups = [
    {
      label: "Pâte",
      ingredients: [
        { id: "r-0-0", name: "Farine", quantity: 250, unit: "g" },
        { id: "r-0-1", name: "Sel", quantity: null, unit: "une pincée" },
        { id: "r-0-2", name: "Zeste", quantity: 1, unit: "", display: "1 zeste de citron" },
      ],
    },
  ];
  const props = { groups, total: 3, servings: 8, recipeId: "tarte" };

  it("wires each ingredient to a labelled checkbox and the scaler hooks", async () => {
    const html = await container.renderToString(Ingredients, {
      props: { ...props, locale: "fr" },
    });

    expect(count(html, /data-recipe-checklist-item/g)).toBe(3);
    expect(html).toContain('id="ingredient-r-0-0"');
    expect(html).toContain('for="ingredient-r-0-0"');
    // Only numeric quantities scale; a display override or a unit-only amount is static.
    expect(count(html, /data-base-quantity=/g)).toBe(1);
    expect(html).toContain('data-base-quantity="250"');
    expect(html).toContain("1 zeste de citron");
    expect(html).toContain("une pincée");
    expect(html).toContain('data-recipe-checklist-storage="recipe-tarte-ingredients"');
  });

  it("renders the scalable quantity in the locale's notation before the script runs", async () => {
    const html = await container.renderToString(Ingredients, {
      props: {
        ...props,
        groups: [
          { ingredients: [{ id: "r-1-0", name: "Levure", quantity: 0.5, unit: "c. à c." }] },
        ],
        locale: "fr",
      },
    });

    expect(html).toMatch(/data-base-quantity="0\.5"[^>]*>\s*0,5\s*</);
  });

  it("labels the servings value and localises the progress counter", async () => {
    const fr = await container.renderToString(Ingredients, { props: { ...props, locale: "fr" } });
    const en = await container.renderToString(Ingredients, { props: { ...props, locale: "en" } });

    expect(fr).toMatch(/<output[^>]*aria-labelledby="ingredients-portions-tarte"/);
    expect(fr).toContain('id="ingredients-portions-tarte"');
    expect(fr).toMatch(/data-recipe-checklist-count[^>]*>0<\/span>\s*\/ 3 prêts/);
    expect(en).toMatch(/data-recipe-checklist-count[^>]*>0<\/span>\s*\/ 3 ready/);
  });

  it("renders the footer slot", async () => {
    const html = await container.renderToString(Ingredients, {
      props: { ...props, locale: "fr" },
      slots: { footer: "<button>Voir les étapes</button>" },
    });

    expect(html).toContain("Voir les étapes");
  });
});
