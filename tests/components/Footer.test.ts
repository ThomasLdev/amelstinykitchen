import Footer from "@components/Footer.astro";
import { describe, expect, it } from "vitest";
import { createContainer } from "../helpers";

const container = await createContainer();

describe("Footer", () => {
  it("links each season to the recipes list filtered by it", async () => {
    const html = await container.renderToString(Footer, { props: { locale: "fr" } });

    for (const season of ["spring", "summer", "autumn", "winter"]) {
      expect(html).toMatch(new RegExp(`href="/fr/recipes/\\?season=${season}"`));
    }
  });

  it("links to the translated page in the other language", async () => {
    const html = await container.renderToString(Footer, {
      props: { locale: "en", alternates: { fr: "recipes/tarte", en: "recipes/pie" } },
    });
    const link = html.match(/<a[^>]*class="footer__lang[^>]*>/)?.[0] ?? "";

    expect(link).toMatch(/href="\/fr\/recipes\/tarte\/?"/);
    expect(link).toContain('hreflang="fr"');
    expect(link).toContain('lang="fr"');
    expect(html).toContain("Français");
  });

  it.each([
    ["without a translation", { fr: "recipes/tarte" }],
    ["without alternates", undefined],
  ])("hides the language switch %s", async (_, alternates) => {
    const html = await container.renderToString(Footer, { props: { locale: "fr", alternates } });

    expect(html).not.toContain("footer__lang");
  });
});
