/**
 * Full-text recipe search, shared by the server (what gets indexed) and the
 * client (the index itself), so both read the same fields the same way.
 */

import MiniSearch from "minisearch";

/** Searchable text of a recipe; steps are left out, too generic ("four", "mélanger"). */
export interface SearchFields {
  title: string;
  /** Category, tags, seasons and SEO keywords. */
  labels: string;
  /** One entry per ingredient, so a match can be shown with its full name. */
  ingredients: string[];
  excerpt: string;
}

/** One recipe of the header search index (`/[lang]/search-index.json`). */
export interface SearchEntry {
  id: string;
  href: string;
  title: string;
  /** Category and total time. */
  meta: string;
  /** 112 px square thumbnail. */
  image?: string;
  /** Publication timestamp (ms), to order equal scores. */
  date: number;
  search: SearchFields;
}

interface SearchHit {
  score: number;
  /** Recipe words that matched, normalized, whatever the query spelling (typo, word start). */
  terms: ReadonlySet<string>;
}

/** Recipe id → hit; `undefined` when no query is typed. */
export type SearchHits = ReadonlyMap<string, SearchHit> | undefined;

/** Case- and accent-insensitive form, so "tarte" finds "Tarte" and "ete" finds "Été". */
function normalizeText(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      // Ligatures have no decomposed form, typed without them they must still match.
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae")
      .trim()
  );
}

// With AND, a linking word missing from the recipe ("velouté de poireaux") would empty the results.
const STOP_WORDS = new Set(
  "a au aux avec d de des du en et l la le les pour sans un une an and for in of the to with".split(
    " ",
  ),
);

const processTerm = (term: string): string | null => {
  const normalized = normalizeText(term);
  return normalized && !STOP_WORDS.has(normalized) ? normalized : null;
};

/** Shorter query words ("b", "be") would match nearly every recipe: they wait for a third letter. */
const MIN_QUERY_TERM = 3;
/** Below this, one typo is a different word ("sel" / "sol"). */
const MIN_FUZZY_TERM = 5;

const processQueryTerm = (term: string): string | null => {
  const normalized = processTerm(term);
  return normalized && normalized.length >= MIN_QUERY_TERM ? normalized : null;
};

/** Only stop words or short words ("de", "b") is no query yet, rather than a query without results. */
export const hasQuery = (query: string): boolean =>
  query.split(/[\p{Z}\p{P}]+/u).some(processQueryTerm);

export function createRecipeSearch(
  recipes: Array<{ id: string; search: SearchFields }>,
): (query: string) => SearchHits {
  const index = new MiniSearch<{ id: string } & SearchFields>({
    fields: ["title", "labels", "ingredients", "excerpt"],
    extractField: (doc, field) => {
      const value = doc[field as keyof typeof doc];
      return Array.isArray(value) ? value.join(" ") : value;
    },
    processTerm,
    searchOptions: {
      boost: { title: 3, labels: 2, ingredients: 1.5 },
      processTerm: processQueryTerm,
      combineWith: "AND",
      prefix: true,
      fuzzy: (term) => (term.length >= MIN_FUZZY_TERM ? 0.2 : false),
    },
  });
  index.addAll(recipes.map(({ id, search }) => ({ id, ...search })));

  return (query) => {
    if (!hasQuery(query)) return undefined;
    return new Map(
      index
        .search(query)
        .map((hit) => [
          String(hit.id),
          { score: hit.score, terms: new Set(Object.keys(hit.match)) },
        ]),
    );
  };
}

/** Where the matched words sit in a displayed text, as [start, end) offsets. */
export function findTerms(text: string, terms: ReadonlySet<string>): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (const word of text.matchAll(/[\p{L}\p{N}]+/gu)) {
    const term = processTerm(word[0]);
    if (term && terms.has(term)) ranges.push([word.index, word.index + word[0].length]);
  }
  return ranges;
}

/** Ingredients holding a matched word, named in full and once each: the cards do not list them. */
export function matchedIngredients(ingredients: string[], terms: ReadonlySet<string>): string[] {
  return [...new Set(ingredients)].filter((name) => findTerms(name, terms).length > 0);
}
