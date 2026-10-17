import RecipeStats from "@components/RecipeStats.astro";
import fr from "@i18n/fr";
import { describe, expect, it } from "vitest";
import { count, createContainer } from "../helpers";

const container = await createContainer();

describe("RecipeStats", () => {
  it("only lists the timings that exist, difficulty always", async () => {
    const html = await container.renderToString(RecipeStats, {
      props: {
        prepLabel: fr.recipe.prep,
        cookLabel: fr.recipe.cook,
        totalLabel: fr.recipe.total,
        difficultyLabel: fr.recipe.difficultyLabel,
        difficultyValue: fr.recipe.difficulty.easy,
        preparationTime: "20 min",
        cookingTime: null,
        totalTime: "20 min",
      },
    });

    expect(count(html, /<dt/g)).toBe(3);
    expect(html).not.toContain(fr.recipe.cook);
    expect(html).toContain(fr.recipe.difficulty.easy);
  });
});
