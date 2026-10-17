/** Sveltia CMS config: collection settings by hand, fields generated (see src/lib/content/cms.ts). */

const settings = {
  backend: { name: "github", repo: "ThomasLdev/amelstinykitchen", branch: "main" },
  media_folder: "/src/assets",
  // Root-absolute: Vite resolves `/src/…` from the project root, so `image()` accepts it.
  public_folder: "/src/assets",
  slug: { encoding: "ascii", clean_accents: true },
  i18n: {
    structure: "multiple_folders",
    locales: ["fr", "en"],
    default_locale: "fr",
    initial_locales: "all",
    // Written in both files of a pair; the site pairs translations on it.
    canonical_slug: { key: "translationKey", value: "{{slug}}" },
  },
};

const media = (folder) => ({ media_folder: folder, public_folder: folder });

/** `schema` names the Astro collection; `singleFile` = both locales in one file. */
const collections = [
  {
    schema: "recipes",
    name: "recipes",
    label: "Recettes",
    label_singular: "Recette",
    folder: "/src/content/recipes",
    extension: "md",
    format: "frontmatter",
    slug: "{{paths | localize}}",
    ...media("/src/assets/recipes"),
  },
  {
    schema: "posts",
    name: "posts",
    label: "Articles",
    label_singular: "Article",
    folder: "/src/content/posts",
    extension: "md",
    format: "frontmatter",
    slug: "{{paths | localize}}",
    ...media("/src/assets/posts"),
  },
  {
    schema: "categories",
    singleFile: true,
    name: "categories",
    label: "Catégories",
    label_singular: "Catégorie",
    folder: "/src/content/categories",
    extension: "json",
    format: "json",
    slug: "{{paths}}",
    ...media("/src/assets/categories"),
  },
  {
    schema: "tags",
    singleFile: true,
    name: "tags",
    label: "Tags",
    label_singular: "Tag",
    folder: "/src/content/tags",
    extension: "json",
    format: "json",
    slug: "{{paths}}",
    ...media("/src/assets/tags"),
  },
];

const isEmptyDefault = (value) =>
  value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length);

/** `T | null` (nullable) is edited as an optional `T`. */
const unwrapNullable = (node) =>
  (node.anyOf?.length === 2 && node.anyOf.find((branch) => branch.type !== "null")) || node;

function widget(node, hints, path) {
  if (hints.widget === "relation") {
    if (!hints.collection) throw new Error(`${path}: a relation needs \`collection\``);
    return {
      widget: "relation",
      collection: hints.collection,
      value_field: "{{slug}}",
      search_fields: ["title"],
      display_fields: ["title"],
    };
  }
  if (hints.widget) return { widget: hints.widget };

  const value = unwrapNullable(node);
  if (value.enum) {
    return {
      widget: "select",
      options: value.enum.map((option) => ({
        label: hints.options?.[option] ?? option,
        value: option,
      })),
    };
  }

  switch (value.type) {
    case "string":
      return value.format === "date-time"
        ? { widget: "datetime", time_format: false, format: "YYYY-MM-DD" }
        : {
            widget: "string",
            ...(value.pattern && { pattern: [value.pattern, hints.hint ?? "Format invalide."] }),
          };
    case "boolean":
      return { widget: "boolean" };
    case "integer":
    case "number": {
      const integer = value.type === "integer";
      const min =
        value.minimum ??
        (value.exclusiveMinimum === undefined
          ? undefined
          : value.exclusiveMinimum + (integer ? 1 : 0));
      return {
        widget: "number",
        value_type: integer ? "int" : "float",
        ...(min !== undefined && { min }),
      };
    }
    case "object":
      return { widget: "object", fields: toFields(value, path) };
    case "array": {
      const items = value.items;
      if (items.cms?.widget === "relation" || items.enum) {
        return { ...widget(items, items.cms, `${path}[]`), multiple: true };
      }
      if (items.type === "object") return { widget: "list", fields: toFields(items, path) };
      return { widget: "list", field: toField("item", items, true, `${path}[]`) };
    }
    default:
      throw new Error(`${path}: no CMS widget for ${JSON.stringify(value).slice(0, 80)}`);
  }
}

const isTranslated = (field) =>
  field.translate || field.fields?.some(isTranslated) || (field.field && isTranslated(field.field));

function toField(name, node, required, path) {
  const hints = node.cms;
  if (hints === false) return null;
  if (!hints) throw new Error(`${path}: missing \`.meta(cms(…))\` in src/content.config.ts`);

  const field = { name, label: hints.label, ...widget(node, hints, path) };
  if (hints.hint) field.hint = hints.hint;
  if (!required) field.required = false;
  const fallback = hints.default ?? node.default;
  if (!isEmptyDefault(fallback)) field.default = fallback;
  if (hints.translate) field.translate = true;
  return field;
}

function toFields(node, path = "") {
  const required = new Set(node.required ?? []);
  return Object.entries(node.properties)
    .filter(([name]) => name !== "$schema")
    .map(([name, child]) =>
      toField(name, child, required.has(name), path ? `${path}.${name}` : name),
    )
    .filter(Boolean);
}

/** Replaces the internal `translate` flag with Sveltia's field-level `i18n`. */
function withI18n(field) {
  const { translate: _translate, ...rest } = field;
  const out = { ...rest, i18n: isTranslated(field) ? true : "duplicate" };
  if (rest.fields) out.fields = rest.fields.map(withI18n);
  if (rest.field) out.field = withI18n(rest.field);
  return out;
}

/** Sveltia fields of a collection (one locale's shape), from its JSON schema. */
export const cmsFields = (schema, path = "") => toFields(schema, path).map(withI18n);

/** @param {Record<string, any>} schemas Collection JSON schemas, keyed by collection name. */
export function buildConfig(schemas) {
  return {
    ...settings,
    collections: collections.map(({ schema: name, singleFile, ...collection }) => {
      const schema = schemas[name];
      if (!schema) throw new Error(`Missing JSON schema for the "${name}" collection`);
      const root = singleFile ? schema.properties[settings.i18n.default_locale] : schema;

      return {
        ...collection,
        identifier_field: "title",
        create: true,
        i18n: singleFile ? { structure: "single_file" } : true,
        fields: cmsFields(root, name),
      };
    }),
  };
}
