import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import IndexPage from "../src/pages/index.astro";

describe("index page", () => {
  it("renders the heading", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(IndexPage);
    expect(html).toContain("<h1>Astro</h1>");
  });
});
