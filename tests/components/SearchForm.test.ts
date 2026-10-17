import SearchForm from "@components/SearchForm.astro";
import fr from "@i18n/fr";
import { describe, expect, it } from "vitest";
import { createContainer } from "../helpers";

const container = await createContainer();

const props = {
  action: "/fr/recipes/",
  label: fr.home.search.label,
  placeholder: fr.home.search.placeholder,
  submitLabel: fr.home.search.submit,
};

describe("SearchForm", () => {
  it("sends a labelled `q` query to the recipes page with a GET form", async () => {
    const html = await container.renderToString(SearchForm, { props: { ...props, id: "q-test" } });

    expect(html).toContain("<search");
    expect(html).toMatch(/<form[^>]*action="\/fr\/recipes\/"[^>]*method="get"/);
    expect(html).toMatch(/<label[^>]*for="q-test"/);
    expect(html).toMatch(/<input[^>]*id="q-test"[^>]*name="q"[^>]*type="search"/);
    // The submit button keeps its text name even when it shows only an icon.
    expect(html).toMatch(new RegExp(`<button[^>]*type="submit"[\\s\\S]*${fr.home.search.submit}`));
  });

  it("keeps a native label, visually hidden, when `hideLabel` is set", async () => {
    const html = await container.renderToString(SearchForm, {
      props: { ...props, id: "q-hidden", hideLabel: true },
    });

    expect(html).toMatch(/<label(?=[^>]*for="q-hidden")(?=[^>]*class="sr-only")/);
    expect(html).not.toContain("search__label");
    expect(html).not.toMatch(/<input[^>]*aria-label/);
  });
});
