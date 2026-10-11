import RecipeStats from "@components/RecipeStats.astro";
import { describe, expect, it } from "vitest";
import { count, createContainer } from "../helpers";

const container = await createContainer();

describe("RecipeStats", () => {
  it("only lists the timings that exist, difficulty always", async () => {
    const html = await container.renderToString(RecipeStats, {
      props: {
        prepLabel: "Prépa.",
        cookLabel: "Cuisson",
        totalLabel: "Total",
        difficultyLabel: "Difficulté",
        difficultyValue: "Facile",
        preparationTime: "20 min",
        cookingTime: null,
        totalTime: "20 min",
      },
    });

    expect(count(html, /<dt/g)).toBe(3);
    expect(html).not.toContain("Cuisson");
    expect(html).toContain("Facile");
  });
});
