---
name: design-system
description: Design system du blog — CSS natif moderne (layers, tokens, nesting), thème à palettes/densités, composants Astro à styles scopés, HTML natif avant JS, accessibilité WCAG 2.2 AA. Use when creating, editing, or composing a public front component (.astro), writing CSS or tokens in src/styles/, adding a button/card/section, switching palette, or making an interactive element (dialog, accordion, popover). Ne pas activer pour la logique de contenu/collections (voir AGENTS.md) ni pour le contenu éditorial.
---

# Design System — Astro

CSS pur moderne, **pas de Tailwind**, pas de préprocesseur. Composants `.astro`
avec styles **scopés par composant**. On garde l'esprit du design existant
(tinie-bakerie) : tokens, layers, palettes, HTML natif d'abord.

## Sources de vérité

- **Design de référence** : le projet tinie-bakerie (`assets/styles/src/*` +
  ses composants) — on en reprend l'esprit, pas la stack Symfony/Twig.
- **Tokens** : `src/styles/tokens.css` — toutes les custom properties + palettes
  (`peach` défaut, `sage`, `cream`) + densités (`aerated` défaut, `compact`).
- **Architecture CSS globale** : `src/styles/app.css` — ordre des `@layer` +
  imports de `tokens.css` et `theme.css`. **Global = théming uniquement.**
- **Mécanique Astro** (props, slots, `class:list`, îlots) : MCP `astro-docs`.
  Ce skill-ci fixe les **normes de design**.

## Architecture CSS — global = théming uniquement

Règle : **tout le CSS de mise en forme vit dans le composant `.astro` scopé.**
En global, on ne garde que le **théming** (tokens + valeurs de thème de
`html`/`body`) et une **normalisation minimale** non-design.

```
src/styles/
├── app.css      # entrypoint : ordre des layers + imports
├── tokens.css   # custom properties : couleurs, palettes, densités, espaces,
│                #   rayons, ombres, polices, transitions, breakpoints
└── theme.css    # :root/html/body : color-scheme, bg, color, typo de base,
                 #   :focus-visible, prefers-reduced-motion + reset minimal
```

- `app.css` est importé **une seule fois**, dans le layout de base :
  `import "../styles/app.css";` dans `src/layouts/BaseLayout.astro`.
- **Ordre des layers** (du moins au plus prioritaire) :
  `tokens → base → components` (`base` = `theme.css`).

```css
/* src/styles/app.css */
@layer tokens, base, components;

@import "./tokens.css" layer(tokens);
@import "./theme.css" layer(base);
```

- **Pas de `layout.css` ni `utilities.css` globaux.** Les helpers de layout
  (`.wrap`, `.section`, `.stack`, `.h-scroll`) et utilitaires (`.sr-only`,
  `.skip-link`, `.kicker`…) deviennent des **composants Astro scopés** :
  `Container.astro`, `Section.astro`, `Stack.astro`, `SrOnly.astro`,
  `SkipLink.astro`…, ou des classes dans le `<style>` du composant concerné.
- **Pas de style d'éléments** (`h1-h4`, `p`, `em`) en global au-delà de la typo
  de `body` du thème : le rendu du texte riche vit dans le composant `<Prose>`
  scopé, pas dans un `base.css`. `<Prose markdown>` rend le markdown (contenu
  des étapes uniquement) ; `<Prose text>` rend du texte simple échappé, en
  paragraphes sur les lignes vides. Pas d'autre `set:html` de contenu.

## Styles par composant (convention Astro)

Contrairement à la version Symfony (un `components/<x>.css` importé dans
`app.css`), **en Astro le CSS d'un composant vit dans son propre fichier
`.astro`**, dans un bloc `<style>` **scopé par défaut** :

```astro
---
interface Props {
  variant?: "primary" | "ghost" | "soft";
  size?: "sm" | "md";
  class?: string;
}
const { variant = "primary", size = "md", class: className } = Astro.props;
---
<a class:list={["btn", `btn--${variant}`, `btn--${size}`, className]}>
  <slot />
</a>

<style>
  @layer components {
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      min-height: 3rem;
      padding: 0.875rem 1.375rem;
      border-radius: var(--radius-pill);
      font-family: var(--font-mono);
      font-size: 0.6875rem;
      text-transform: uppercase;
      transition: background var(--transition-base), color var(--transition-base);

      &.btn--primary {
        background: var(--accent);
        color: var(--on-accent);
        &:hover { background: var(--accent-ink); }
      }
      &.btn--ghost {
        background: transparent;
        color: var(--ink);
        border: 1px solid var(--line);
      }
    }
  }
</style>
```

Règles clés :

- **Pas de fichier CSS séparé par composant**, pas d'`@import` dans `app.css`.
  Le `<style>` du `.astro` est compilé, scopé, et injecté par Astro.
- **Wrapper `@layer components`** dans le `<style>` pour garder un ordre de
  cascade déterministe face aux feuilles globales (base < components <
  utilities). L'attribut de scope d'Astro ajoute la spécificité interne au layer.
- **`is:global` interdit par défaut.** À réserver aux rares cas réellement
  globaux, avec justification en commentaire. Pour atteindre des enfants rendus
  par un slot ou un composant tiers, utiliser `:global(...)` ciblé.
- **Pas de sélecteurs de balise** dans un composant (`& b`, `& a`, `& ul`).
  Ajouter une classe. Exceptions : `theme.css` (son rôle).
- **Nesting natif** et `&` autorisés (le concat SASS `&__el` n'existe pas en CSS
  natif — ne pas l'utiliser).
- **Piège `:global()` imbriqué** : dans `.prose { … }`, `:global(.prose > p)`
  devient `.prose .prose > p` et ne matche rien. Pour viser les enfants du bloc
  lui-même : `& > :global(:first-child)`.

### Naming

Astro **scope les styles**, donc l'unicité globale des classes n'est plus
nécessaire : BEM n'est **pas obligatoire**. On garde des **noms sémantiques**
en kebab-case, orientés bloc (`.recipe-card`, `.recipe-card__media`). BEM
(`.block__el--mod`) reste autorisé et recommandé pour les composants complexes.
Les helpers de layout sont des composants dédiés (`Container`, `Section`,
`Stack`), pas des classes globales.

### Forwarder `class` et attributs (équivalent `{{ attributes }}`)

Un composant Astro ne transmet **pas** automatiquement `class` à sa racine.
Il faut accepter et appliquer :

```astro
---
interface Props { class?: string; [key: string]: unknown }
const { class: className, ...rest } = Astro.props;
---
<article class:list={["recipe-card", className]} {...rest}>…</article>
```

Utiliser `class:list` pour composer classes conditionnelles/modificateurs.

## Règles d'or CSS

- **Pas de Tailwind**, pas de classes utilitaires atomiques (`mt-4 px-2`).
- **Custom properties** pour tout ce qui est tokenizable. **Jamais** de couleur
  hex/rgb/rgba ni de `font-family` littéral hors `tokens.css`. Contrat de
  theming : changer de thème = ne toucher que `tokens.css` (ou ajouter une
  palette `[data-palette="..."]`). Si tu écris `#fff`, `rgba(...)` ou une police
  en dur dans un composant → crée un token (`--on-accent`, `--overlay`,
  `--shadow-x`) et référence-le.
- **`@layer`** : `tokens → base → components`. Chaque composant wrappe son
  `<style>` dans `@layer components`. Rien hors layer dans `src/styles/`.
- **Logical properties** (`padding-inline`, `margin-block`) plutôt que
  left/right.
- **`clamp()`** pour la typo fluide, **`color-mix(in oklab, …)`** pour les
  variations, **container queries** quand un composant doit réagir à son
  conteneur plutôt qu'au viewport.
- **`prefers-reduced-motion`** géré dans `theme.css`. Toute animation ajoutée
  doit se neutraliser en reduced-motion.

## Test du retrait

Pour chaque déclaration : **« si je l'enlève, est-ce que ça casse ? »**. Non =
inutile. Coupables habituels : défauts navigateur, doublons avec `theme.css`,
redéclaration de tokens.

## CSS d'abord, JS en dernier recours

**Règle ferme** : si un comportement est faisable en CSS/HTML moderne, ne
**jamais** l'implémenter en JS. En Astro, « JS » = `<script>` bundlé du
composant ou un îlot framework (`client:*`) — donc coût réel (poids, hydratation).

| Besoin | CSS/HTML natif (préférer) | JS (Astro `<script>` / îlot) |
|---|---|---|
| Disclosure / accordéon | `<details>` + `<summary>` | toggle manuel |
| Modal / dialog | `<dialog>` + `showModal()` (1 ligne de JS) | îlot modal custom |
| Popover, dropdown, tooltip | API `popover` + `popovertarget`, ou `:focus-within` | dropdown JS |
| Toggle | `<input type="checkbox">` + `:checked` + sibling | toggle JS |
| « élément a un enfant focusé » | `:focus-within` | listeners focusin/out |
| « parent contient X » | `:has(...)` | querySelector |
| Bloquer le focus d'un arbre | attribut `inert` | boucle tabindex |
| Carrousel simple | `scroll-snap-type` + `scroll-snap-align` | lib JS |
| Animation au scroll | `animation-timeline: scroll()` / `view()` | IntersectionObserver |
| Réagir à la taille du conteneur | `@container` | ResizeObserver |
| Entrée/sortie d'élément | `@starting-style` + `transition-behavior: allow-discrete` | classes JS |
| Compteurs | `counter-reset` / `counter-increment` | innerHTML |
| Truncation multi-ligne | `-webkit-line-clamp` | mesure JS |
| Smooth scroll ancre | `scroll-behavior: smooth` | `scrollIntoView` |
| Texte fluide | `clamp()` + `vw` | resize listener |
| UI input native | `accent-color`, `color-scheme` | setProperty |
| Layout adaptatif sans MQ | `flex-wrap`, `auto-fit/auto-fill`, `min()/max()` | matchMedia |
| Transition de page | `<ClientRouter />` (`astro:transitions`) | manuel |

**Quand passer en JS** : logique métier / état, interactions impossibles en CSS
(focus trap réel, séquences clavier complexes, communication entre îlots),
support navigateur non stable sur la cible.

**Coût de la décision** : si tu hésites et que la solution CSS demande 2 min de
recherche (MDN / moderncss.dev), prends-les.

## Unités : px vs rem

| Type de valeur | Unité | Pourquoi |
|---|---|---|
| `font-size` | **`rem`** | Scale avec la préférence navigateur (WCAG 1.4.4). |
| `padding`, `margin`, `gap` (texte/composant) | **`rem`** | Respiration proportionnelle. |
| `line-height` | sans unité (`1.5`) | Multiplicateur du `font-size` parent. |
| `letter-spacing` | `em` | Proportionnel à la taille du texte. |
| `border-width`, `border-radius`, `outline` | `px` | Primitives visuelles fixes. |
| `box-shadow` (offset/blur/spread) | `px` | Idem. |
| Hit targets (boutons, inputs) | `px` (≥ 44px) | Cible tactile physique. |
| Icônes / SVG / logo-mark | `px` | Primitives visuelles fixes. |
| Breakpoints `@media` | `px` | Voir Responsive. |

**Body** : jamais `body { font-size: 16px }`. Rien (défaut = 1rem) ou
`font-size: 100%`. **Spacing** : `--space-*` en `rem` dans `clamp()`.
Conversion : `px / 16 = rem`.

## Responsive & breakpoints

- **Mobile-first** : styles par défaut pour mobile, `@media (min-width: …)` pour
  amplifier. Éviter `max-width` sauf exception justifiée.
- **Media queries co-localisées** dans le composant (avec le nesting, on lit
  tout d'un bloc).
- **Breakpoints unifiés** (tokens, `tokens.css`) :
  `--bp-sm: 600px` · `--bp-md: 720px` · `--bp-lg: 900px` · `--bp-xl: 1200px`.
- **Limite native** : les custom properties ne marchent **pas** dans `@media`.
  On **duplique la valeur** (`@media (min-width: 900px)`) ; `tokens.css` reste
  la source de vérité (find-replace si ça bouge).
- Pas de breakpoint hors liste sans raison : préférer une **container query**
  (`@container`) si c'est un comportement lié au conteneur.

## Palettes & densités

Switch via `data-palette` et `data-density` sur `<html>`, posés dans
`src/layouts/BaseLayout.astro` :

```astro
<html lang={Astro.currentLocale} data-palette="peach" data-density="aerated">
```

- `data-palette` : `peach` (défaut), `sage`, `cream`
- `data-density` : `aerated` (défaut), `compact`

Un éventuel panel « Tweaks » est optionnel (îlot Astro / `<script>`), non activé
par défaut.

## Composants Astro — conventions

- Un composant = un fichier `src/components/<Name>.astro` (PascalCase).
- Props typées via `interface Props`, valeurs par défaut à la déstructuration.
- Forwarder `class` (et attributs) sur la racine (voir plus haut).
- Slots (défaut + nommés) pour la composition, avec fallback content.
- Icônes : **ne pas copier-coller du SVG inline** du design. Utiliser un
  composant `Icon.astro` unique alimenté par un set (ex. `astro-icon`/Iconify)
  ou des fichiers `src/icons/*.svg` importés. Un seul point d'entrée pour les
  icônes.
- **Classes = style, `data-*` = JS** (règle ferme). Le script et les tests
  n'utilisent jamais une classe comme sélecteur : chaque élément lu par le JS
  porte un hook `data-*` dédié (`data-recipe-list`, `data-filters-open`…), et la
  classe reste libre d'être renommée.
- États (ouvert/fermé, actif…) posés par le JS : un attribut ARIA quand il
  existe (`aria-pressed`, `aria-current`, `aria-expanded`), sinon `data-*`
  (`data-nav-state`) ; le CSS peut lire cet état. Jamais de classe `is-*`.
- **Le script vit avec son composant** : le composant importe son script
  (`<script>import "@scripts/…";</script>`), pour que le comportement suive le
  composant sur toutes les pages. Des libellés à réécrire côté client passent
  par `data-strings`, typés par l'interface exportée du script (`satisfies`).
- **Panneau / bottom sheet** : composer `Sheet.astro` (fermeture, backdrop,
  glisser vers le bas, mode `sidebar` en desktop) avec `SheetAction` /
  `SheetSubmit` ; ne pas réécrire ces comportements dans un nouveau composant.
- Un bloc rendu sans JS reste utilisable ; les contrôles qui n'ont de sens
  qu'avec le script sont rendus `hidden data-enhanced` et révélés par lui.

## Accessibilité (WCAG 2.2 AA — non négociable)

Chaque composant ajouté/modifié passe cette checklist avant d'être fini.

### Structure

- Sémantique HTML d'abord : `<button>` pour une action, `<a href>` pour une
  navigation. Jamais `<div onclick>`.
- Un seul `<h1>` par page, pas de saut de niveau.
- Éléments natifs (`<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`,
  `<details>`, `<dialog>`) avant ARIA. ARIA = dernier recours.

### Clavier

- Tout interactif atteignable au Tab, ordre de focus = ordre visuel.
- `:focus-visible` visible (ring posé dans `theme.css`, ne jamais le supprimer
  sans équivalent).
- ESC ferme overlays/modales/drawers/dropdowns.
- Panneaux (modales, drawers) : mémoriser `document.activeElement` à l'ouverture,
  focus sur le 1er interactif, `inert` sur les frères pour bloquer l'arrière-plan,
  restaurer le focus à la fermeture. `<dialog>` + `showModal()` gère nativement
  focus trap, ESC, `inert` du fond → préférer ça.

### Contraste

- Texte courant ≥ 4.5:1 ; texte large et composants UI ≥ 3:1.
- Vérifier sur **les 3 palettes**.
- Jamais d'info portée uniquement par la couleur.

### Cibles & mouvement

- Cibles ≥ 44×44px effectif ; inputs `font-size: 1rem` mini (anti-zoom iOS).
- `prefers-reduced-motion` neutralise les transitions ; valider toute animation.
- Pas d'auto-play ni d'animation infinie.

### Images

- `alt` toujours présent (`alt=""` si décoratif). Texte important jamais
  uniquement dans une image.

### Formulaires

- `<label for>` associé ; erreurs via `aria-describedby`/`aria-errormessage` +
  `aria-invalid="true"` ; `required` natif.

### Live regions

- Mises à jour non critiques → `aria-live="polite"` ; urgentes → `assertive`
  ou `role="alert"`.

### Langue & i18n des textes a11y (règle ferme)

- `<html lang="…">` toujours posé (dans le layout de base).
- Bloc en langue différente → `lang="…"` local.
- **Tout texte rendu est traduit FR + EN**, y compris l'invisible : `aria-label`,
  `alt`, `title`, `.sr-only`, skip links, libellés d'icônes.
- Les chaînes d'UI (chrome, labels a11y) vivent dans un module typé
  `src/i18n/` (un objet par locale) ou dans la collection, jamais en dur FR dans
  un composant réutilisé. Ajouter une clé = l'ajouter **en fr ET en**.
- Modèle de contenu bilingue : section i18n de `AGENTS.md`.

### Definition of Done — composant

- [ ] Markup sémantique (pas de div soup, ARIA seulement si nécessaire)
- [ ] Navigable clavier seul (Tab/Enter/ESC selon nature)
- [ ] Focus visible sur chaque interactif
- [ ] Contraste vérifié sur les 3 palettes
- [ ] Cibles ≥ 44×44 (zone effective)
- [ ] Aucune info uniquement par la couleur
- [ ] Animations neutralisées en `prefers-reduced-motion`
- [ ] Overlay/modale : focus géré (natif `<dialog>` ou trap) + ESC + restoration
- [ ] Textes a11y traduits FR + EN
- [ ] Lighthouse A11y ≥ 95 (cible 100), pas de violation `axe`

### Outils

- Lighthouse (A11y seul), axe DevTools, test clavier complet, `forced-colors`
  (Windows High Contrast via DevTools → Rendering).

### Références externes (lookup à la demande)

- MDN Accessibility — https://developer.mozilla.org/en-US/docs/Web/Accessibility
- WAI-ARIA APG (patterns widgets) — https://www.w3.org/WAI/ARIA/apg/patterns/
- moderncss.dev — https://moderncss.dev/topics/

Règle : en cas de doute clavier/ARIA, **lire la spec avant de coder**.

## Workflow d'ajout d'un composant

1. Repérer le bloc dans le design de référence (tinie-bakerie) — markup + CSS.
2. Si le bloc introduit des couleurs/espaces/rayons absents → ajouter d'abord
   les **tokens** dans `tokens.css` (jamais en dur dans le composant).
3. Créer `src/components/<Name>.astro` : frontmatter (props typées) + template
   sémantique + `<style>` scopé (`@layer components`).
4. Forwarder `class`/attributs sur la racine ; prévoir slots + fallbacks.
5. Composer la page dans `src/pages/...` avec les composants de layout
   (`Container`, `Section`) et les autres composants (pas de CSS spécifique à
   la page sauf justification).
6. Si interactif : viser le natif d'abord (`<details>`, `<dialog>`, popover…) ;
   `<script>`/îlot seulement si nécessaire.
7. Vérifier les **3 palettes × 2 densités** (`<html data-palette="sage"
   data-density="compact">` temporaire).

## Playbook d'intégration (design → Astro)

1. **Lire la source** : identifier les blocs récurrents (header, hero, grille de
   cartes, footer) → candidats composants.
2. **Diff tokens** : ajouter d'abord ce qui manque.
3. **Découper en composants** : un `<Name>.astro` par bloc récurrent.
4. **Layout de page** : composer avec `Container` / `Section` + composants.
5. **Vérifier** palettes × densités + checklist a11y.

## Anti-patterns

- ❌ Classes utilitaires atomiques (`mt-4 px-2 text-sm`).
- ❌ Hardcoder des couleurs/polices hors `tokens.css`.
- ❌ Écrire du CSS hors layer dans `src/styles/`.
- ❌ Helpers de layout/utilitaires globaux (`layout.css`, `utilities.css`) :
  ce sont des composants scopés (`Container`, `Section`, `SrOnly`…).
- ❌ Mettre de la mise en forme (hors tokens/thème `html`/`body`) en global.
- ❌ Fichier CSS séparé par composant ou `@import` de composant dans `app.css`.
- ❌ `<style is:global>` sans justification ; `:global()` non ciblé.
- ❌ Sélecteurs de balise dans un composant.
- ❌ `style="…"` inline (sauf data-uri / cas unique justifié).
- ❌ SVG inline copié-collé du design (passer par le composant `Icon`).
- ❌ Réintroduire Tailwind, PostCSS, ou un préprocesseur.
- ❌ JS là où le CSS/HTML natif suffit.
- ❌ Sélectionner une classe CSS depuis un script ou un test (hook `data-*`).
- ❌ `set:html` sur du contenu ailleurs que dans `<Prose markdown>`.
