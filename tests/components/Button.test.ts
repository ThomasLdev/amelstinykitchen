import Button from "@components/Button.astro";
import { describe, expect, it } from "vitest";
import { createContainer } from "../helpers";

const container = await createContainer();

describe("Button", () => {
  it("renders a link when href is provided", async () => {
    const html = await container.renderToString(Button, {
      props: { href: "/fr/", variant: "primary" },
      slots: { default: "Voir" },
    });

    expect(html).toContain('href="/fr/"');
    expect(html).toContain("btn--primary");
    expect(html).not.toContain("<button");
  });

  it("renders a button without href", async () => {
    const html = await container.renderToString(Button, { slots: { default: "OK" } });

    expect(html).toContain('type="button"');
    expect(html).not.toContain("<a ");
  });
});
