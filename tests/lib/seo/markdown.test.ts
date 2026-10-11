import { recipeMarkdown } from "@lib/seo/markdown";
import { describe, expect, it } from "vitest";
import { recipe } from "./fixture";

describe("recipeMarkdown", () => {
  it("renders the source link, the facts, grouped ingredients and numbered steps", () => {
    const markdown = recipeMarkdown(recipe);

    expect(markdown).toMatch(/^# Tarte\n/);
    expect(markdown).toContain("Source : https://example.com/fr/recipes/tarte/");
    expect(markdown).toContain("- **Total** : 1 h 05");
    expect(markdown).toContain("### Pâte\n\n- 250 g Farine");
    expect(markdown).toContain("- Sel (une pincée)");
    expect(markdown).toContain("1. **Préparer** — Mélangez.\n2. Cuire");
  });
});
