import { plural } from "@i18n/plural";
import { describe, expect, it } from "vitest";

describe("plural", () => {
  it("picks the zero / one / other form", () => {
    const forms = { zero: "Aucune", one: "1 recette", other: "%count% recettes" };
    expect([0, 1, 4].map((count) => plural(forms, count))).toEqual([
      "Aucune",
      "1 recette",
      "4 recettes",
    ]);
  });
});
