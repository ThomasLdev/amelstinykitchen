import Prose from "@components/Prose.astro";
import { describe, expect, it } from "vitest";
import { count, createContainer } from "../helpers";

const container = await createContainer();

describe("Prose", () => {
  it("renders the Markdown of a step as HTML", async () => {
    const html = await container.renderToString(Prose, {
      props: { markdown: "Fouettez **vivement**.\n\n- Sucre\n- Œufs" },
    });

    expect(html).toContain("<strong>vivement</strong>");
    expect(count(html, /<li>/g)).toBe(2);
  });

  it("keeps plain text as escaped paragraphs split on blank lines", async () => {
    const html = await container.renderToString(Prose, {
      props: { text: "Premier **paragraphe**.\n\n<b>Second</b>" },
    });

    expect(count(html, /<p[\s>]/g)).toBe(2);
    expect(html).toContain("**paragraphe**");
    expect(html).toContain("&lt;b&gt;Second&lt;/b&gt;");
  });
});
