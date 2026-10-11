import Footer from "@components/Footer.astro";
import { describe, expect, it } from "vitest";
import { createContainer } from "../helpers";

const container = await createContainer();

describe("Footer", () => {
  it("renders the recipes disclosure and the current year", async () => {
    const html = await container.renderToString(Footer, { props: { locale: "fr" } });

    expect(html).toContain("<details");
    expect(html).toContain("Recettes");
    expect(html).toContain(String(new Date().getFullYear()));
  });
});
