import Button from "@components/Button.astro";
import Footer from "@components/Footer.astro";
import Header from "@components/Header.astro";
import Icon from "@components/Icon.astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

describe("Button", () => {
  it("renders a link when href is provided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: "/fr/", variant: "primary" },
      slots: { default: "Voir" },
    });

    expect(html).toContain('href="/fr/"');
    expect(html).toContain("btn--primary");
    expect(html).not.toContain("<button");
  });

  it("renders a button without href", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, { slots: { default: "OK" } });

    expect(html).toContain('type="button"');
    expect(html).not.toContain("<a ");
  });
});

describe("Icon", () => {
  it("renders an inline, decorative svg at the requested size", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Icon, { props: { name: "house", size: 18 } });

    expect(html).toContain("<svg");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('width="18"');
  });
});

describe("Header", () => {
  it("marks the active locale route with aria-current", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header, {
      props: { locale: "fr" },
      request: new Request("https://example.com/fr/"),
    });

    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Navigation principale");
  });
});

describe("Footer", () => {
  it("renders the recipes disclosure and the current year", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer, { props: { locale: "fr" } });

    expect(html).toContain("<details");
    expect(html).toContain("Recettes");
    expect(html).toContain(String(new Date().getFullYear()));
  });
});
