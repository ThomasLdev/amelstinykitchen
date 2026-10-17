import RecipeBrowser from "@components/RecipeBrowser.astro";
import fr from "@i18n/fr";
import type { RecipeFacet } from "@lib/content/recipe-filters";
import type { BrowserStrings } from "@scripts/recipes/browser";
import { describe, expect, it } from "vitest";
import { createContainer } from "../helpers";

const container = await createContainer();

const facet = (id: string, category: string): RecipeFacet => ({
  id,
  category,
  seasons: ["winter"],
  tags: ["citron"],
  time: 30,
  date: 0,
});
const item = (id: string, category: string) => ({
  card: { href: `/fr/recipes/${id}/`, title: id },
  facet: facet(id, category),
});

const props = {
  locale: "fr" as const,
  items: [item("tarte", "tartes"), item("cake", "gateaux"), item("flan", "tartes")],
  categories: [
    { value: "tartes", label: "Tartes" },
    { value: "gateaux", label: "Gâteaux" },
  ],
  seasons: [{ value: "winter", label: fr.recipes.seasons.winter }],
  tags: [{ value: "citron", label: "Citron" }],
};

// The markup below is what src/scripts/recipes/browser.ts reads: a renamed hook breaks the filters silently.
describe("RecipeBrowser", () => {
  it("hands the script its labels and one parsable facet per card", async () => {
    const html = await container.renderToString(RecipeBrowser, { props });

    const strings = JSON.parse(
      (html.match(/data-strings="([^"]*)"/)?.[1] ?? "{}").replaceAll("&quot;", '"'),
    ) as BrowserStrings;
    expect(strings.count).toEqual(fr.recipes.count);
    expect(strings.apply).toEqual(fr.recipes.apply);

    const facets = [...html.matchAll(/data-facet="([^"]*)"/g)].map(
      ([, json]) => JSON.parse((json ?? "").replaceAll("&quot;", '"')) as RecipeFacet,
    );
    expect(facets).toEqual(props.items.map(({ facet }) => facet));
    expect(html).toContain("data-recipe-list");
  });

  it("renders a count, a quick chip and a removable chip for every filter value", async () => {
    const html = await container.renderToString(RecipeBrowser, { props });

    // An empty value renders as a bare attribute, which the script reads as "".
    const hook = (name: string, value: string) =>
      new RegExp(value ? `${name}="${value}"` : `${name}[\\s>]`);
    for (const value of ["", "tartes", "gateaux"]) {
      expect(html).toMatch(hook("data-filter-count", value));
      expect(html).toMatch(hook("data-quick-category", value));
    }
    for (const [name, value] of [
      ["category", "tartes"],
      ["season", "winter"],
      ["tag", "citron"],
    ]) {
      expect(html).toMatch(
        new RegExp(`data-filter-remove="${name}"[^>]*data-filter-value="${value}"[^>]*hidden`),
      );
    }
    expect(html).toMatch(/data-filter-remove="q"[^>]*hidden/);
  });

  it("renders the script-driven controls up front, relevance offered only with a query", async () => {
    const html = await container.renderToString(RecipeBrowser, { props });

    // Revealing them at boot would push the results down.
    expect(html).not.toMatch(/<button[^>]*data-filters-open[^>]*\shidden[\s>]/);
    expect(html).toMatch(/<input[^>]*name="q"/);
    expect(html).toMatch(/<option[^>]*value="relevance"[^>]*hidden[^>]*disabled/);
    expect(html).toContain(`>${fr.recipes.count.other.replace("%count%", "3")}<`);
  });

  it("drops the category group when a single category is in use, and the tags group without tags", async () => {
    const html = await container.renderToString(RecipeBrowser, {
      props: { ...props, categories: props.categories.slice(0, 1), tags: [] },
    });

    expect(html).not.toMatch(/<input[^>]*name="category"/);
    expect(html).not.toMatch(/<input[^>]*name="tag"/);
    expect(html).toMatch(/<input[^>]*name="season"/);
  });
});
