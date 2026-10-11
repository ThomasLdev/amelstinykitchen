import fr from "@i18n/fr";
import HomePage from "@pages/[lang]/index.astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

type PageComponent = Parameters<
  Awaited<ReturnType<typeof AstroContainer.create>>["renderToString"]
>[0];

const homePage = HomePage as unknown as PageComponent;

describe("home page", () => {
  it("renders the French hero heading and chrome", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(homePage, { params: { lang: "fr" } });

    expect(html).toContain(fr.home.hero.title);
    expect(html).toContain("nav-wrapper");
    expect(html).toContain('aria-label="Navigation principale"');
    expect(html).toContain("<main");
    expect(html).toContain("<footer");
  });

  it("renders the English copy for the en locale", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(homePage, { params: { lang: "en" } });

    expect(html).toContain("Rustic seasonal fruit tart");
  });
});
