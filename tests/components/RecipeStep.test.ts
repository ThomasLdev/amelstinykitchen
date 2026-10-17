import RecipeStep from "@components/RecipeStep.astro";
import fr from "@i18n/fr";
import { describe, expect, it } from "vitest";
import { createContainer } from "../helpers";

const container = await createContainer();
const props = { index: 2, title: "Cuire", content: "Au four.", locale: "fr" as const };

describe("RecipeStep", () => {
  it("labels a warning differently from a tip", async () => {
    const tip = await container.renderToString(RecipeStep, {
      props: { ...props, tip: { type: "tip", text: "Beurrez le moule." } },
    });
    const warning = await container.renderToString(RecipeStep, {
      props: { ...props, tip: { type: "warning", text: "Restez près du four." } },
    });

    expect(tip).toContain(fr.recipe.steps.tip);
    expect(warning).toContain(fr.recipe.steps.warning);
    expect(warning).not.toContain(fr.recipe.steps.tip);
  });
});
