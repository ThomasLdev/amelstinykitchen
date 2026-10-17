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
npm run test:e2e   # Playwright (e2e)
npm run knip       # fichiers/exports/deps morts
npm run spell      # cspell FR/EN
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

## i18n (FR/EN uniquement)

Deux langues, pas plus. Pas de skill i18n dédié : on suit la convention
documentée dans le skill `astro-content`.

- `i18n` d'Astro dans `astro.config.mjs` : `locales: ['fr', 'en']`,
  `defaultLocale: 'fr'`. Routing `/[lang]/...`.
- **Une seule** collection par type de contenu ; chaque entrée porte `locale`
  et un `translationKey` partagé entre la paire FR/EN.
- Fichiers rangés par langue : `src/content/blog/fr/...`, `.../en/...`.
- URL construites via `getRelativeLocaleUrl` / `Astro.currentLocale` — jamais
  de `/fr` ou `/en` codés en dur.
- Fallback **explicite** : une traduction manquante est masquée ou redirigée
  vers le FR, jamais servie silencieusement sous une URL EN.

## Astro best practices (obligatoire)

On respecte **strictement** la doc officielle. Avant d'écrire ou de modifier du
code Astro, charger le skill correspondant :

- **Composants, layouts, slots, props, styles, îlots, images** →
  skill `astro-components`.
- **Content collections, `content.config.ts`, schémas Zod, loaders,
  `getCollection`/`render`, routes dynamiques, i18n** → skill `astro-content`.
- **CSS, tokens, palettes, thème, composants du front public, accessibilité** →
  skill `design-system`.
- **Tests unitaires/e2e, fixtures, choix du niveau de test** →
  skill `astro-testing`.

Pour toute question version-spécifique, la doc fait foi :
https://docs.astro.build — consulter en priorité
[routing](https://docs.astro.build/en/guides/routing/),
[components](https://docs.astro.build/en/basics/astro-components/),
[content collections](https://docs.astro.build/en/guides/content-collections/),
[styling](https://docs.astro.build/en/guides/styling/),
[i18n](https://docs.astro.build/en/guides/internationalization/).

## Review

Après un changement notable (composants, contenu, routes), lancer l'agent
`astro-reviewer` (lecture seule) pour auditer le code par rapport à ces règles.

## Ignore files

- `.gitignore` : ce qui n'est pas versionné.
- `.ignore` : versionné mais exclu de la recherche/exploration (lockfiles,
  minifiés, binaires) pour économiser des tokens.
- `opencode.json` → `watcher.ignore` : dossiers exclus du file watcher.
