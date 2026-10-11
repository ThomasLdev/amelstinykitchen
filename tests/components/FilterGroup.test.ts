import FilterGroup from "@components/FilterGroup.astro";
import { describe, expect, it } from "vitest";
import { count, createContainer } from "../helpers";

const container = await createContainer();

describe("FilterGroup", () => {
  const options = [
    { value: "", label: "Toutes", count: 3 },
    { value: "desserts", label: "Desserts", count: 2 },
  ];

  it("is a named group of labelled inputs exposing the count hooks", async () => {
    const html = await container.renderToString(FilterGroup, {
      props: { type: "radio", name: "category", legend: "Catégorie", options, appearance: "list" },
    });

    expect(html).toMatch(/<fieldset[\s\S]*<legend[^>]*>Catégorie<\/legend>/);
    expect(count(html, /<label[^>]*>\s*<input[^>]*type="radio"[^>]*name="category"/g)).toBe(2);
    expect(html).toContain('data-filter-count="desserts"');
    // A radio group always has a choice: "all" by default.
    expect(html).toMatch(/<input(?=[^>]*\svalue(?:="")?[\s>])(?=[^>]*\schecked)[^>]*>/);
  });
});
