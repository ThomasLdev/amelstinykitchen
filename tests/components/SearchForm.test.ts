import SearchForm from "@components/SearchForm.astro";
import fr from "@i18n/fr";
import { describe, expect, it } from "vitest";
import { count, createContainer } from "../helpers";

const container = await createContainer();

const props = {
  action: "/fr/search/",
  label: fr.home.search.label,
  placeholder: fr.home.search.placeholder,
  submitLabel: fr.home.search.submit,
};

describe("SearchForm", () => {
  it("sends a labelled `q` query to the search page with a GET form", async () => {
    const html = await container.renderToString(SearchForm, { props: { ...props, id: "q-test" } });

    expect(html).toContain("<search");
    expect(html).toMatch(/<form[^>]*action="\/fr\/search\/"[^>]*method="get"/);
    expect(html).toMatch(/<label[^>]*for="q-test"/);
    expect(html).toMatch(/<input[^>]*id="q-test"[^>]*name="q"[^>]*type="search"/);
    // The submit button keeps its text name even when it shows only an icon.
    expect(html).toMatch(new RegExp(`<button[^>]*type="submit"[\\s\\S]*${fr.home.search.submit}`));
  });

  it("renders shortcut ideas as a labelled list of links, only when given", async () => {
    const bare = await container.renderToString(SearchForm, { props });
    const withIdeas = await container.renderToString(SearchForm, {
      props: {
        ...props,
        ideasLabel: fr.home.search.ideas,
        ideas: [
          { label: "Citron", href: "/fr/search/?q=Citron" },
          { label: "Hiver", href: "/fr/search/?q=Hiver" },
        ],
      },
    });

    expect(bare).not.toContain("<ul");
    expect(count(withIdeas, /<a /g)).toBe(2);
    expect(withIdeas).toContain('href="/fr/search/?q=Citron"');
    expect(withIdeas).toMatch(/<ul[^>]*aria-labelledby="search-q-ideas"/);
  });
});
