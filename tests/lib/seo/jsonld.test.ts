import { breadcrumbLd, recipeLd, serializeJsonLd } from "@lib/seo/jsonld";
import { describe, expect, it } from "vitest";
import { recipe } from "./fixture";

const author = { name: "Amel", url: "https://example.com/fr/", sameAs: [] };

describe("recipeLd", () => {
  it("maps a recipe to the fields Google requires for recipe rich results", () => {
    const ld = recipeLd(recipe, author);

    expect(ld).toMatchObject({
      "@type": "Recipe",
      name: "Tarte",
      prepTime: "PT40M",
      cookTime: "PT25M",
      totalTime: "PT1H5M",
      recipeYield: "8",
      keywords: "citron, meringue",
      recipeIngredient: ["250 g Farine", "Sel (une pincée)"],
      datePublished: "2026-03-01T00:00:00.000Z",
      dateModified: "2026-03-01T00:00:00.000Z",
    });
    expect(ld.author).toEqual({ "@type": "Person", name: "Amel", url: "https://example.com/fr/" });
  });

  it("anchors each step to the page and falls back to the title when it has no text", () => {
    expect(recipeLd(recipe, author).recipeInstructions).toEqual([
      {
        "@type": "HowToStep",
        name: "Préparer",
        text: "Mélangez.",
        url: "https://example.com/fr/recipes/tarte/#step-1",
        image: "https://example.com/s.jpg",
      },
      {
        "@type": "HowToStep",
        name: "Cuire",
        text: "Cuire",
        url: "https://example.com/fr/recipes/tarte/#step-2",
      },
    ]);
  });

  it("leaves out missing data, but keeps prepTime and cookTime paired", () => {
    const ld = recipeLd({ ...recipe, cookingTime: 0, keywords: [], images: [] }, author);

    expect(ld.cookTime).toBe("PT0M");
    expect(ld).not.toHaveProperty("keywords");
    expect(ld).not.toHaveProperty("image");
    expect(ld).not.toHaveProperty("recipeCuisine");
  });
});

describe("breadcrumbLd", () => {
  it("numbers the items and lets the current page go without a URL", () => {
    expect(
      breadcrumbLd([{ name: "Accueil", url: "https://example.com/" }, { name: "Tarte" }]),
    ).toMatchObject({
      itemListElement: [
        { position: 1, name: "Accueil", item: "https://example.com/" },
        { position: 2, name: "Tarte" },
      ],
    });
  });
});

describe("serializeJsonLd", () => {
  it("cannot close the surrounding script element", () => {
    const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

    expect(json).not.toContain("</script>");
    expect(JSON.parse(json).name).toBe("</script><script>alert(1)</script>");
  });
});
