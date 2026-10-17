import SeasonFeature from "@components/SeasonFeature.astro";
import { describe, expect, it } from "vitest";
import cover from "../fixtures/cover.png";
import { createContainer } from "../helpers";

const container = await createContainer();

const props = {
  season: "winter" as const,
  title: ["L'", "hiver", " en cuisine"] as [string, string, string],
  badge: "De saison",
  image: cover,
  recipes: [{ href: "/fr/recipes/soupe/", title: "Soupe", meta: "30 min", image: cover }],
  cta: { href: "/fr/recipes/?season=winter", label: "La recette d'hiver" },
};

describe("SeasonFeature", () => {
  it("exposes its season to the script, rendered hidden when it is not the build's", async () => {
    const html = await container.renderToString(SeasonFeature, {
      props: { ...props, hidden: true },
    });

    expect(html).toMatch(/<article[^>]*data-season-card="winter"[^>]*hidden/);
    expect(html).toContain('href="/fr/recipes/?season=winter"');
  });

  it("keeps its photos decorative and lazy, so hidden seasons download nothing", async () => {
    const html = await container.renderToString(SeasonFeature, { props });

    expect(html).toContain('type="image/avif"');
    for (const img of html.match(/<img[^>]*>/g) ?? []) {
      expect(img).toMatch(/ alt[\s>]/);
      expect(img).toContain('loading="lazy"');
    }
  });
});
