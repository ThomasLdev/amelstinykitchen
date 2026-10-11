import RecipeCard from "@components/RecipeCard.astro";
import { describe, expect, it } from "vitest";
import cover from "../fixtures/cover.png";
import { createContainer } from "../helpers";

const container = await createContainer();

const props = {
  href: "/fr/recipes/tarte/",
  title: "Tarte",
  excerpt: "Une accroche.",
  meta: "1 h 05 · Intermédiaire",
  image: cover,
};

describe("RecipeCard", () => {
  it("links to the recipe, named by its title alone", async () => {
    const html = await container.renderToString(RecipeCard, { props });

    expect(html).toContain('href="/fr/recipes/tarte/"');
    // The link is named by its title, not by every fact inside it.
    const labelledBy = html.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(html).toMatch(new RegExp(`<h3[^>]*id="${labelledBy}"[^>]*>Tarte</h3>`));
    // Decorative image: the title already names the link.
    expect(html).toMatch(/<img[^>]* alt[\s>]/);
  });
});
