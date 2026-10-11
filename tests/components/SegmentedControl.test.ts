import SegmentedControl from "@components/SegmentedControl.astro";
import { describe, expect, it } from "vitest";
import { count, createContainer } from "../helpers";

const container = await createContainer();

describe("SegmentedControl", () => {
  const options = [
    { value: "ingredients", label: "Ingrédients" },
    { value: "steps", label: "Étapes" },
  ];

  it("is a named radio group with a legend, first option checked by default", async () => {
    const html = await container.renderToString(SegmentedControl, {
      props: { name: "view", legend: "Afficher", options },
    });

    expect(html).toContain("<fieldset");
    expect(html).toContain("Afficher");
    expect(count(html, /type="radio" [^>]*name="view"|name="view"[^>]*type="radio"/g)).toBe(2);
    expect(html).toMatch(/value="ingredients"[^>]*checked/);
    expect(html).not.toMatch(/value="steps"[^>]*checked/);
  });

  it("honours an explicit value", async () => {
    const html = await container.renderToString(SegmentedControl, {
      props: { name: "view", legend: "Afficher", options, value: "steps" },
    });

    expect(html).toMatch(/value="steps"[^>]*checked/);
  });
});
