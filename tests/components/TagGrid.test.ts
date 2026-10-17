import TagGrid from "@components/TagGrid.astro";
import { describe, expect, it } from "vitest";
import cover from "../fixtures/cover.png";
import { createContainer } from "../helpers";

const container = await createContainer();

const season = (name: string, value: "autumn" | "winter", hidden: boolean) => ({
  name,
  href: `/fr/recipes/?season=${value}`,
  badge: "De saison",
  image: cover,
  season: value,
  hidden,
});

describe("TagGrid", () => {
  it("renders every season card for the script, only the build's one visible", async () => {
    const html = await container.renderToString(TagGrid, {
      props: {
        items: [
          season("Automne", "autumn", false),
          season("Hiver", "winter", true),
          { name: "Citron", href: "/fr/recipes/?tag=citron" },
        ],
      },
    });

    expect(html).toMatch(/<li[^>]*data-season-card="autumn"(?![^>]*hidden)[^>]*>/);
    expect(html).toMatch(/<li[^>]*data-season-card="winter"[^>]*hidden[^>]*>/);
    expect(html).toContain('href="/fr/recipes/?tag=citron"');
  });

  it("serves the season photo as a decorative, modern-format backdrop", async () => {
    const html = await container.renderToString(TagGrid, {
      props: { items: [season("Automne", "autumn", false)] },
    });

    expect(html).toContain('type="image/avif"');
    expect(html).toMatch(/<img[^>]* alt[\s>]/);
    expect(html).toMatch(/<img[^>]* loading="lazy"/);
  });
});
