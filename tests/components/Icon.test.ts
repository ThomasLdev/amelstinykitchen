import Icon from "@components/Icon.astro";
import { describe, expect, it } from "vitest";
import { createContainer } from "../helpers";

const container = await createContainer();

describe("Icon", () => {
  it("renders an inline, decorative svg at the requested size", async () => {
    const html = await container.renderToString(Icon, { props: { name: "house", size: 18 } });

    expect(html).toContain("<svg");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('width="18"');
  });
});
