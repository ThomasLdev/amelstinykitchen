# amelstinykitchen

Projet de blog construit en astro

## Commands

```bash
npm run dev        # ou: npx astro dev --background (voir ci-dessous)
npm run build      # build de production
npm run preview    # prévisualiser le build
npm run check      # type-check (.astro + collections) via astro check
npm run lint       # Biome (lint + format check)
npm run lint:fix   # Biome, applique les corrections
npm run test       # Vitest (unit + Container API)
npm run test:coverage # Vitest + coverage, seuils bloquants (aussi en CI)
npm run test:e2e   # Playwright (e2e)
npm run knip       # fichiers/exports/deps morts
```

Le serveur de dev tourne en arrière-plan :

```bash
npx astro dev --background
npx astro dev status | stop | logs
```

## Tooling & qualité

- **Biome** (lint + format) pour TS/CSS/JSON et `.astro` (support expérimental
  activé) — `biome.json`. Pas d'ESLint ni de Prettier.
- **`astro check`** pour les types (Biome ne type-check pas).
- **Vitest** (`vitest.config.ts`, via `getViteConfig`) pour l'unit/intégration ;
  les composants `.astro` se testent avec la **Container API**
  (`astro/container`). Tests dans `tests/**/*.test.ts`.
- **Playwright** (`playwright.config.ts`) pour l'e2e, dans `e2e/**/*.spec.ts`
  (penser à `npx playwright install chromium`).

## Stack & conventions

- Astro `7.x`, TypeScript **strict** (voir `tsconfig.json`).
- Sortie statique par défaut. Pas de JS client sauf nécessité (îlots).
- Fichiers de code dans `src/`, assets non transformés dans `public/`.
- Une page = un fichier dans `src/pages/` (seul dossier réservé par Astro).
- Composants `PascalCase.astro` dans `src/components/`, layouts dans
  `src/layouts/`, styles globaux dans `src/styles/`.

## Front & CSS

CSS natif moderne, **pas de Tailwind** ni de préprocesseur. Le détail (tokens,
layers, palettes, a11y, HTML natif avant JS) est dans le skill `design-system`.

- **Tout le CSS de mise en forme est scopé au composant** : styles dans le
  `<style>` du `.astro` (pas de fichier CSS par composant), wrappé dans
  `@layer components`.
- **En global, uniquement le théming** : `src/styles/tokens.css` (custom
  properties) + `src/styles/theme.css` (thème `html`/`body`, focus,
  reduced-motion, reset minimal), orchestrés par `app.css` (`@layer`), importé
  une fois dans le layout de base.
- Les helpers de layout/utilitaires sont des **composants scopés**
  (`Container`, `Section`, `SrOnly`…), pas des classes globales.
- Couleurs/polices/espaces uniquement via custom properties de `tokens.css`.
- **Haut/bas de page** portés par `<main>` de `BaseLayout` (`--page-space-start`
  / `--page-space-end`) : aucun composant n'ajoute d'espace avant le premier
  bloc ni après le dernier. Le **breadcrumb** passe toujours par le slot
  `breadcrumb` de `BaseLayout` (position fixe, `view-transition-name`).
- HTML/CSS natif d'abord, JS (`<script>` ou îlot) en dernier recours.
- **Zéro décalage au chargement** : rien ne bouge (layout, taille ou retour à
  la ligne du texte, placement) entre le premier rendu et la page chargée.
  Toute zone qui se remplit plus tard a sa place réservée dès le HTML :
  images avec ratio connu (jamais `aspect-ratio: auto` sur une image dont la
  hauteur dépend du fichier), blocs asynchrones avec skeleton de même taille.
  Un contrôle qui n'a de sens qu'avec JS est rendu visible et masqué par
  `@media (scripting: none)`, jamais révélé par le script (`hidden` retiré au
  boot). Les variantes de police visibles au-dessus de la ligne de flottaison
  sont préchargées.
- **Classes = style, `data-*` = JS.** Un script ou un test ne sélectionne
  jamais une classe CSS : renommer une classe ne doit rien casser hors du
  `<style>`. Les hooks JS sont des attributs `data-*` ; un état posé par le JS
  passe par un attribut ARIA (`aria-pressed`, `aria-current`…) ou `data-*`.

## JS client : un comportement = un module

- **Le script vit avec son composant** : le composant animé importe son script
  (`<script>import "@scripts/…";</script>`, dédupliqué par Astro), pas la page.
  Un module d'entrée s'initialise lui-même
  (`document.querySelectorAll("[data-x]").forEach(initX)`).
- **Pas de fichier fourre-tout** : une fonctionnalité qui grossit se découpe en
  modules `create…(root, deps)` qui renvoient leur fonction de rendu (lecture
  du formulaire, résultats, compteurs, chips…) ; l'orchestrateur ne garde que
  l'état et le câblage. Modèle : `src/scripts/recipes/`.
- **Décisions pures dans `src/lib/`**, sans DOM, testées en unitaire (filtres,
  tri, recherche, état d'URL). Le script ne fait que lire et écrire le DOM.
- **Comportement partagé = composant partagé** : `Sheet.astro` +
  `scripts/sheet.ts` gèrent fermeture, backdrop, glisser et mode sidebar ; le
  propriétaire ne fait qu'ouvrir et décider de ce que signifie fermer.
- **Libellés passés au script** via `data-strings`, typés par une interface
  exportée du script et vérifiés côté `.astro` avec `satisfies`.
- **Bundle client** : un script n'importe jamais `@i18n` (il embarquerait les
  deux dictionnaires) ; `@i18n/plural` ou `data-strings` à la place. Une lib
  lourde se charge à la demande avec `import()` (ex. le moteur MiniSearch).

## i18n (FR/EN uniquement)

Deux langues, pas plus. Pas de skill i18n dédié : la convention est ici, la
mécanique (`astro:i18n`, routing) dans la doc via le MCP `astro-docs`.

- `i18n` d'Astro dans `astro.config.mjs` : `locales: ['fr', 'en']`,
  `defaultLocale: 'fr'`. Routing `/[lang]/...`.
- **Une seule** collection par type de contenu ; chaque entrée porte `locale`
  et un `translationKey` partagé entre la paire FR/EN.
- Fichiers rangés par langue : `src/content/recipes/fr/...`, `.../en/...`
  (recettes, articles). Exception : tags et catégories gardent un fichier par
  entrée avec `{ fr: {…}, en: {…} }`, pour que les `reference()` restent un id
  stable (lus via `localize()` de `@lib/content/i18n`).
- Paires reliées par `translationKey` (`translationsOf()`) : pas de hreflang
  ni de lien de langue vers une traduction absente.
- URL construites via `getRelativeLocaleUrl` / `Astro.currentLocale` — jamais
  de `/fr` ou `/en` codés en dur.
- Locales via `@i18n` : `locales`, `toLocale()` pour le param `[lang]`,
  `localeParams` comme `getStaticPaths` d'une page par locale. Jamais de
  `locale === "fr"` dans la logique : unités et formats viennent des
  dictionnaires ou d'`Intl` (ex. `formatQuantity`, seule mise en forme des
  quantités pour la page, le scaler et le SEO).
- Fallback **explicite** : une traduction manquante est masquée ou redirigée
  vers le FR, jamais servie silencieusement sous une URL EN.

## CMS (Sveltia, local uniquement)

Le contenu s'édite via Sveltia CMS sur `npm run dev` → `localhost:4321/admin/`
(Chrome/Edge/Brave, « Travailler avec un dépôt local »). Servi par
l'intégration `cms/integration.mjs` en dev seulement, jamais buildé. Sveltia
est une `devDependency` épinglée (`@sveltia/cms`), servie depuis `node_modules`.

- **Le schéma Zod est la seule source** : les champs CMS sont générés
  (`cms/config.mjs`) depuis `.astro/collections/*.schema.json`. Chaque champ
  porte `.meta(cms({ label, translate?, widget?, … }))` (`@lib/content/cms`) ;
  un champ sans hints fait échouer la config. `translate: true` = saisi par
  langue, sinon saisi une fois et dupliqué.
- Seuls les réglages de collection (dossier, slug, médias) sont écrits à la
  main dans `cms/config.mjs`.
- Images en chemin racine `/src/assets/...` (accepté par `image()`).
- **Seul le contenu des étapes est en markdown** (`markdown()`, rendu par
  `<Prose markdown>`). Les autres textes longs sont du texte simple
  (`longText()`, rendu par `<Prose text>`, échappé). Jamais de `set:html` sur
  du contenu en dehors de `Prose`.

## Astro best practices (obligatoire)

On respecte **strictement** la doc officielle, consultée via le MCP
**`astro-docs`** (`https://mcp.docs.astro.build/mcp`, déclaré dans `.mcp.json`
et `opencode.json`). Avant d'écrire ou de modifier du code Astro (composants,
layouts, slots, îlots, images, content collections, loaders, schémas Zod,
routes dynamiques, i18n), **chercher la page concernée via le MCP** plutôt que
de se fier à sa mémoire : la doc fait foi pour `astro@7.x`.

Les skills du projet ne couvrent que nos conventions propres :

- **CSS, tokens, palettes, thème, composants du front public, accessibilité** →
  skill `design-system`.
- **Tests unitaires/e2e, fixtures, choix du niveau de test** →
  skill `astro-testing`.

Conventions maison en plus de la doc :

- Props typées via une interface `Props`, défauts par déstructuration.
- `getCollection()` n'a pas d'ordre garanti : toujours trier explicitement.
- **Un helper par règle de domaine, jamais recopié** (`src/lib/content/`) :
  `getPublishedRecipes()` (brouillons, locale, tri), `loadTaxonomies()`,
  `recipePath()` / `recipeHref()` (jamais `recipes/${paths}` à la main),
  `recipeCard()` / `factsLine()` pour les cartes, `recipeSearchFields()` pour
  ce qu'on indexe. Un loader qui lit les collections sépare le fetch du mapping
  pur (ex. `catalogRecipe()`), pour que le mapping soit testable.
- Le frontmatter d'une page assemble : la logique métier va dans `src/lib/`.
- **Dépendances** : préférer la plateforme ; une nouvelle lib se justifie
  (gain réel, poids client mesuré). Un sous-paquet d'astro qu'on importe
  directement est déclaré à la même version qu'astro.
- Commentaires : **en anglais**, uniquement pour du code obscur ou une
  particularité (contrainte, contournement, choix a11y inattendu), une ligne
  courte. Jamais de paraphrase ni de docblock « ce que fait la fonction » sur
  un déroulé normal. Les fixtures de contenu font exception (voir `astro-testing`).

## Review

Après un changement notable (composants, contenu, routes), lancer l'agent
`astro-reviewer` (lecture seule) pour auditer le code par rapport à ces règles.

## Ignore files

- `.gitignore` : ce qui n'est pas versionné.
- `.ignore` : versionné mais exclu de la recherche/exploration (lockfiles,
  minifiés, binaires) pour économiser des tokens.
- `opencode.json` → `watcher.ignore` : dossiers exclus du file watcher.
