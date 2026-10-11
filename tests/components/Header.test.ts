import Header from "@components/Header.astro";
import { describe, expect, it } from "vitest";
import { createContainer } from "../helpers";

const container = await createContainer();

describe("Header", () => {
  it("marks the active locale route with aria-current", async () => {
    const html = await container.renderToString(Header, {
      props: { locale: "fr" },
      request: new Request("https://example.com/fr/"),
    });

    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Navigation principale");
  });
});
