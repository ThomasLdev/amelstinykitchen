---
name: astro-testing
description: Stratégie et conventions de test du blog Astro — décide entre test unitaire (Vitest + Container API) et end-to-end (Playwright) selon le gain du test, structure un fichier par composant/feature, gère les fixtures de contenu isolées du contenu éditorial. Use when adding, changing or reviewing tests (tests/**, e2e/**), vitest.config.ts, playwright.config.ts, test fixtures, or when a change to a component, script, page or content schema needs test coverage. Ne pas activer pour écrire le composant lui-même (voir design-system).
---

# Tests — Astro

Principe : **on teste ce qui peut casser, pas chaque micro-comportement.** Un
test doit protéger contre une régression plausible et coûteuse. Le test
unitaire valide vite un composant ou une logique ; l'e2e valide un parcours
utilisateur réel sur le build de production.

Outils : **Vitest** (`vitest.config.ts` via `getViteConfig`) + **Container
API** (`astro/container`) pour l'unitaire, **Playwright** pour l'e2e. Doc :
https://docs.astro.build/en/guides/testing/ — la doc fait foi.

## 1. Décider : est-ce que ça vaut un test ?

Écrire un test seulement si **au moins une** de ces conditions est vraie :

- La régression serait **silencieuse** (rien ne casse au build ni visuellement
  au premier coup d'œil) : arrondi, seuil, attribut a11y, `srcset`, hook JS.
- Le comportement porte une **logique** (calcul, état, condition, fallback).
- C'est un **contrat** entre deux morceaux de code (markup `data-*` lu par un
  script, clé i18n, route générée, schéma de contenu).
- C'est un **parcours** qu'un visiteur fait vraiment et dont la casse coûte
  (lire une recette, ajuster les portions, imprimer, naviguer en mobile).
- Un **bug** vient d'être corrigé (test de non-régression ciblé).

Ne **pas** tester :

- Le style/CSS visuel (couleurs, espacements, tailles) → revue visuelle.
- Les comportements du framework ou du navigateur (Astro scope le CSS, un
  `<details>` s'ouvre…).
- Les valeurs par défaut triviales, le texte statique, chaque variante d'un
  composant purement présentationnel.
- Le même comportement deux fois (unitaire **et** e2e) sans raison.

## 2. Choisir le niveau : unitaire ou e2e

Prendre le niveau **le plus bas qui prouve vraiment le comportement**.

| Ce qu'on veut prouver | Niveau | Pourquoi |
|---|---|---|
| Fonction pure (format, arrondi, calcul, seuil de décision) | **Unitaire** (`tests/lib`, `tests/scripts`) | Rapide, exhaustif sur les cas limites |
| HTML rendu d'un composant : hooks `data-*`, attributs a11y (`aria-*`, `for`/`id`, `<fieldset>`), branches de rendu (slot, prop optionnelle, fallback) | **Unitaire** Container API (`tests/components`) | Contrat de markup, pas besoin de navigateur |
| Images : formats AVIF/WebP, recadrage, `srcset` sans upscale, une seule image `priority` | **Unitaire** Container API | Lisible dans le HTML rendu (`w=…&h=…`, `fetchpriority`) |
| Interaction qui dépend du **DOM réel**, du **CSS** (`:has()`, media queries, `display`) ou d'un **script client** | **E2E** | Vitest tourne en `node`, sans layout ni CSS |
| Persistance navigateur (`localStorage`), scroll, focus, impression (`emulateMedia`) | **E2E** | Nécessite un vrai moteur |
| Routes générées, i18n FR/EN, 404, brouillons non publiés | **E2E** sur le build de prod | Prouve `getStaticPaths` + filtrage réel |
| Comportement spécifique mobile/desktop | **E2E**, projet `mobile` ou `desktop` | Viewport et media queries réels |

Règle de bascule : si un test unitaire devient du « faux DOM » (simuler le
CSS, mocker `window`, reconstruire un layout), **passer en e2e**. Si un e2e ne
vérifie qu'un attribut du HTML sans interaction, **descendre en unitaire**.

**Rendre la logique testable** : sortir la décision d'un script client dans un
module **pur, sans effet de bord à l'import** (ex. `src/scripts/nav-state.ts`
appelé par `nav.ts`). Un module qui fait `document.querySelectorAll` au
chargement ne peut pas être importé dans Vitest (`document` n'existe pas).
Exporter une fonction pure existante (`formatQuantity`) pour la tester est
légitime.

## 3. Organisation : un fichier par composant / feature

Jamais de fichier de test global.

```
tests/                         # Vitest (tests/**/*.test.ts)
├── components/<Component>.test.ts   # un par composant .astro
├── scripts/<module>.test.ts         # logique pure des scripts client
├── lib/<module>.test.ts             # helpers src/lib
├── pages/<page>.test.ts             # rendu d'une page (si utile)
├── fixtures/                        # images de test (jamais src/assets)
└── helpers.ts                       # createContainer(), count()
e2e/                           # Playwright (e2e/**/*.spec.ts)
├── fixtures.ts                      # routes + locators partagés
├── fixtures/content/                # contenu de test (voir §5)
├── global-teardown.ts               # re-sync .astro après le run
├── <feature>.spec.ts                # desktop
├── <feature>.mobile.spec.ts         # mobile (projet "mobile")
└── recipe/<feature>.spec.ts         # features d'une page groupées par dossier
```

- Nom du `describe` = composant ou feature ; nom du `it`/`test` = le
  comportement attendu, en phrase (« scales numeric quantities only, within
  bounds »).
- Un fichier e2e = une feature (page, portions, checklist, galerie,
  impression, onglets mobile, nav mobile…), pas une page entière.

## 4. Unitaire : Vitest + Container API

```ts
import Ingredients from "@components/Ingredients.astro";
import { describe, expect, it } from "vitest";
import { count, createContainer } from "../helpers";

const container = await createContainer();

describe("Ingredients", () => {
  it("wires each ingredient to a labelled checkbox and the scaler hooks", async () => {
    const html = await container.renderToString(Ingredients, {
      props: { groups, total: 3, servings: 8, recipeId: "tarte", locale: "fr" },
      slots: { footer: "<button>…</button>" },
    });
    expect(count(html, /data-recipe-checklist-item/g)).toBe(3);
    expect(html).toContain('for="ingredient-r-0-0"');
  });
});
```

- Un container par fichier (`await createContainer()` au top-level).
- Asserter le **contrat** (hooks `data-*`, attributs a11y, branches,
  nombre d'éléments), pas le markup complet ni les classes CSS.
- `<Image>`/`<Picture>` fonctionnent dans le container : importer une image de
  `tests/fixtures/` donne un `ImageMetadata` ; les URLs `/_image?…&w=960&h=720
  &f=avif&fit=cover` permettent de vérifier formats et recadrage.
- Pages : caster le composant de page pour `renderToString` et passer
  `params`. Les pages qui dépendent de `getCollection`/props de
  `getStaticPaths` (dont la home) → e2e, avec la logique de sélection sortie
  dans un module pur testé en unitaire (ex. `src/lib/content/home.ts`).
- Libellés UI : importer les dictionnaires (`@i18n/fr`, `@i18n/en`) plutôt que
  recopier les chaînes.

## 5. E2E : Playwright sur un build de fixtures

**Jamais le contenu éditorial** (`src/content`) : il change, et un test ne
doit pas casser parce qu'une recette a été réécrite.

Mise en place (déjà câblée) :

- `content.config.ts` lit `CONTENT_DIR` (défaut `./src/content`) pour la
  `base` de chaque loader `glob`.
- `playwright.config.ts` → `webServer` : `npx astro build --outDir dist-e2e
  --force && npx astro preview --outDir dist-e2e --port 4322 --ignore-lock`,
  avec `env: { CONTENT_DIR: "./e2e/fixtures/content" }` et
  `reuseExistingServer: false` (ne jamais réutiliser le dev server, qui sert le
  contenu éditorial).
- `astro.config.mjs` : `cacheDir` séparé quand `CONTENT_DIR` est défini.
- Projets : `desktop` (ignore `*.mobile.spec.ts`) et `mobile` (Pixel 7, ne
  lance que `*.mobile.spec.ts`).

Fixtures de contenu (`e2e/fixtures/content/`, même arborescence que
`src/content`) :

- **Une entrée par cas fonctionnel**, nommée par son rôle
  (`recette-complete`, `recette-narrative`, `recette-brouillon`), avec un
  commentaire YAML qui dit ce qu'elle couvre.
- Couvrir les branches : quantité scalable / unité seule / `display`, astuce
  et avertissement, plusieurs médias, sans étapes (fallback), `draft: true`.
- Images générées (aplats), dans `e2e/fixtures/content/assets/`.
- Exposer routes et faits dans `e2e/fixtures.ts` (`RECIPE_FR`,
  `COMPLETE.ingredients`…) : les specs n'écrivent pas les slugs en dur.
- Ajouter une feature qui dépend du contenu → enrichir/ajouter une fixture,
  pas tester sur `src/content`.

Écrire les specs :

- Locators par **rôle et nom accessible** d'abord (`getByRole("button",
  { name: fr.recipe.servings.increase })`), hooks `data-*` ensuite.
  Les noms viennent des dictionnaires i18n.
- Asserter avec les matchers auto-retry (`toHaveText`, `toBeVisible`,
  `toHaveAttribute`), jamais de `waitForTimeout`.
- Vérifier l'état **et** son effet quand c'est la valeur du test (radio
  coché **et** panneau visible).

## 6. Pièges connus

- **`.astro/` est partagé et non configurable** (fixé à `root/.astro/`). Le
  build de fixtures y réécrit le store de contenu et `content-assets.mjs` :
  un `astro dev` lancé en parallèle perd ses images
  (`LocalImageUsedWrongly`). `e2e/global-teardown.ts` relance `astro sync`
  sur le contenu éditorial à la fin du run ; le dev reste perturbé
  **pendant** le run. Réparation manuelle : `npx astro sync`.
- **`astro preview` peut tourner en arrière-plan avec un lock** : sans
  `--ignore-lock`, Playwright voit le process sortir (« exited early ») si
  une preview tourne déjà. Les binaires dans `webServer.command` passent par
  `npx`.
- **Impression** : une page A4 fait ~700px de large, donc les règles
  « mobile » s'appliquent en print. Tester avec `setViewportSize({ width:
  700 })` + `emulateMedia({ media: "print" })`. Les règles réservées à
  l'écran doivent être en `@media screen and (…)`.
- **Pages de fixtures courtes** : un scroll trop grand atteint le footer et
  change le comportement (nav masquée). Utiliser de petits déplacements.
- **Navigateur en arrière-plan** (automatisation de Chrome hors Playwright) :
  `requestAnimationFrame`, les events `scroll`, `IntersectionObserver` et le
  focus sont suspendus → ne pas conclure à un bug, tester via Playwright.
- `localStorage` est vierge à chaque test Playwright (contexte neuf) : un
  test de persistance fait `page.reload()` dans le même test.

## 6 bis. CI (GitHub Actions)

- **Parallélisme** : `fullyParallel: true` et `workers: "100%"` en CI. C'est
  sûr ici : site statique en lecture seule, un contexte navigateur neuf par
  test. Toute fixture qui écrirait un état serveur casserait cette hypothèse.
- **Logs en direct** : reporter `[["list"], ["github"], ["html"]]` en CI
  (`github` seul n'affiche rien avant la fin) et `webServer.stdout: "pipe"`
  pour voir le build de fixtures. Rapport HTML publié en artefact.
- **Navigateurs** : job `e2e` dans le conteneur
  `mcr.microsoft.com/playwright:v<version>-noble` (Chromium + dépendances
  système préinstallés) au lieu de `playwright install --with-deps` à chaque
  run. **Le tag doit suivre la version de `@playwright/test`.**
- `timeout-minutes` sur le job pour qu'un blocage ne tourne pas des heures.
- Le `globalTeardown` (`astro sync`) est sauté en CI. En local, lancer avec
  `CI=1` le saute aussi : refaire `npx astro sync` si un dev server tourne.

## 7. Commandes & Definition of Done

```bash
npm run test       # Vitest
npm run test:e2e   # Playwright (build de fixtures + preview :4322)
npx playwright install chromium   # une fois
```

Avant de considérer un changement testé :

- [ ] Chaque test répond à une condition du §1 ; rien de redondant.
- [ ] Niveau choisi selon §2 (le plus bas qui prouve le comportement).
- [ ] Un fichier par composant/feature, au bon endroit (§3).
- [ ] Aucune dépendance au contenu éditorial ni aux images de `src/assets`.
- [ ] Libellés tirés des dictionnaires i18n ; routes de `e2e/fixtures.ts`.
- [ ] `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run check`,
      `npm run knip` et `npm run spell` passent.
