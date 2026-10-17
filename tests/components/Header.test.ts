import Header from "@components/Header.astro";
import { describe, expect, it } from "vitest";
import { createContainer } from "../helpers";

const container = await createContainer();

describe("Header", () => {
  it("marks only the link of the current page with aria-current", async () => {
    const html = await container.renderToString(Header, {
      props: { locale: "fr" },
      request: new Request("https://example.com/fr/recipes"),
    });

    expect(html).toMatch(/<a[^>]*href="\/fr\/recipes\/?"[^>]*aria-current="page"/);
    expect(html).not.toMatch(/<a[^>]*href="\/fr\/?"[^>]*aria-current/);
  });
});
