import RecipeHead from "@components/RecipeHead.astro";
import { describe, expect, it } from "vitest";
import { count, createContainer } from "../helpers";

const container = await createContainer();

describe("RecipeHead", () => {
  it("offers the jump link only when the recipe body has an anchor", async () => {
    const base = { locale: "fr" as const, title: "Tarte", kicker: "Pâtisserie · Citron" };
    const withAnchor = await container.renderToString(RecipeHead, {
      props: { ...base, recipeAnchor: "recipe" },
    });
    const without = await container.renderToString(RecipeHead, { props: base });

    expect(withAnchor).toContain('href="#recipe"');
    expect(without).not.toContain('href="#recipe"');
    expect(count(withAnchor, /<h1/g)).toBe(1);
    expect(withAnchor).toContain("Pâtisserie · Citron");
    expect(withAnchor).toContain("data-recipe-action-share");
    expect(withAnchor).toContain("data-recipe-action-print");
  });
});
