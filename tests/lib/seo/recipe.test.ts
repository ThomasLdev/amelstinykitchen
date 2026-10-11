import { formatIngredient, isoDuration, stripHtml } from "@lib/seo/recipe";
import { describe, expect, it } from "vitest";

describe("isoDuration", () => {
  it("formats minutes as ISO 8601 and hides empty durations", () => {
    expect(isoDuration(0)).toBeUndefined();
    expect(isoDuration(45)).toBe("PT45M");
    expect(isoDuration(65)).toBe("PT1H5M");
    expect(isoDuration(120)).toBe("PT2H");
  });
});

describe("formatIngredient", () => {
  it("puts a numeric amount before the name, with the locale's decimal separator", () => {
    expect(formatIngredient({ name: "Farine", quantity: 250, unit: "g" }, "fr")).toBe(
      "250 g Farine",
    );
    expect(formatIngredient({ name: "Lait", quantity: 0.5, unit: "l" }, "fr")).toBe("0,5 l Lait");
    expect(formatIngredient({ name: "Eggs", quantity: 4, unit: "" }, "en")).toBe("4 Eggs");
  });

  it("puts free-text amounts in brackets after the name", () => {
    expect(formatIngredient({ name: "Sel", quantity: null, unit: "une pincée" }, "fr")).toBe(
      "Sel (une pincée)",
    );
    expect(
      formatIngredient({ name: "Citron", quantity: 1, unit: "", display: "1 zeste" }, "fr"),
    ).toBe("Citron (1 zeste)");
    expect(formatIngredient({ name: "Poivre", quantity: null, unit: "" }, "fr")).toBe("Poivre");
  });
});

describe("stripHtml", () => {
  it("keeps the text of inline HTML and decodes entities", () => {
    expect(stripHtml("<p>Cuire <strong>15&nbsp;min</strong> &amp; servir</p>")).toBe(
      "Cuire 15 min & servir",
    );
  });
});
