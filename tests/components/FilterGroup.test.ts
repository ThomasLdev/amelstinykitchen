import FilterGroup from "@components/FilterGroup.astro";
import fr from "@i18n/fr";
import { describe, expect, it } from "vitest";
import { count, createContainer } from "../helpers";

const container = await createContainer();

describe("FilterGroup", () => {
  const options = [
    { value: "", label: fr.recipes.filters.all, count: 3 },
    { value: "desserts", label: "Desserts", count: 2 },
  ];

  it("is a named group of labelled inputs exposing the count hooks", async () => {
    const html = await container.renderToString(FilterGroup, {
      props: {
        type: "radio",
        name: "category",
        legend: fr.recipes.filters.category,
        options,
        appearance: "list",
      },
    });

    expect(html).toMatch(
      new RegExp(`<fieldset[\\s\\S]*<legend[^>]*>${fr.recipes.filters.category}</legend>`),
    );
    expect(count(html, /<label[^>]*>\s*<input[^>]*type="radio"[^>]*name="category"/g)).toBe(2);
    expect(html).toContain('data-filter-count="desserts"');
    // A radio group always has a choice: "all" by default.
    expect(html).toMatch(/<input(?=[^>]*\svalue(?:="")?[\s>])(?=[^>]*\schecked)[^>]*>/);
  });
});
