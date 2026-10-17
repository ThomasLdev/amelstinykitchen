import Seo from "@components/Seo.astro";
import { describe, expect, it } from "vitest";
import { count, createContainer } from "../helpers";

const container = await createContainer();

const render = (props: Record<string, unknown>) =>
  container.renderToString(Seo, {
    props: { title: "Tarte", description: "Une tarte.", locale: "fr", ...props },
    request: new Request("https://amelstinykitchen.com/fr/recipes/tarte/"),
  });

describe("Seo", () => {
  it("links every translation reciprocally, with the French page as x-default", async () => {
    const html = await render({ alternates: { fr: "recipes/tarte", en: "recipes/pie" } });

    expect(html).toContain(
      '<link rel="canonical" href="https://amelstinykitchen.com/fr/recipes/tarte/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="fr" href="https://amelstinykitchen.com/fr/recipes/tarte/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="en" href="https://amelstinykitchen.com/en/recipes/pie/">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://amelstinykitchen.com/fr/recipes/tarte/">',
    );
    expect(html).toContain('<meta property="og:locale:alternate" content="en_US">');
  });

  it("declares the share image with its size for Open Graph and X", async () => {
    const html = await render({
      image: { url: "https://amelstinykitchen.com/a.jpg", width: 1200, height: 630, alt: "Tarte" },
    });

    expect(html).toContain('<meta property="og:image:width" content="1200">');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
  });

  it("keeps a noindex page out of the index, without canonical or hreflang", async () => {
    const html = await render({ noindex: true, alternates: { fr: "", en: "" } });

    expect(html).toContain('<meta name="robots" content="noindex, follow">');
    expect(count(html, /rel="canonical"|hreflang=/g)).toBe(0);
  });

  it("emits one JSON-LD script per entry", async () => {
    const html = await render({ jsonLd: [{ "@type": "Recipe" }, { "@type": "BreadcrumbList" }] });

    expect(count(html, /application\/ld\+json/g)).toBe(2);
  });
});
