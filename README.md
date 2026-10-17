# Amel's tiny kitchen

Blog de recettes bilingue (FR/EN) construit avec [Astro](https://docs.astro.build),
site 100 % statique déployé sur Cloudflare Workers. Le contenu s'édite en local
avec [Sveltia CMS](https://sveltiacms.app) : pas d'admin en ligne, les fichiers
sont écrits directement dans le dépôt.

## Sommaire

- [Installation](#installation)
- [Éditer le contenu avec le CMS](#éditer-le-contenu-avec-le-cms)
- [Publier une modification](#publier-une-modification)
- [Déployer le site](#déployer-le-site)
- [Commandes](#commandes)
- [Pour les développeurs](#pour-les-développeurs)

## Installation

Prérequis :

- [Node.js](https://nodejs.org) **22.12 ou plus** (`node -v` pour vérifier) ;
- [Git](https://git-scm.com) et un accès au dépôt GitHub ;
- pour le CMS : **Google Chrome, Microsoft Edge ou Brave** (Firefox et Safari
  ne savent pas écrire dans un dossier local).

```bash
git clone git@github.com:ThomasLdev/amelstinykitchen.git
cd amelstinykitchen
npm install
npm run dev
```

Le site tourne sur <http://localhost:4321/fr/>.

## Éditer le contenu avec le CMS

### Ouvrir le CMS

1. Lancer le site en local : `npm run dev`.
2. Ouvrir <http://localhost:4321/admin/> dans Chrome, Edge ou Brave.
3. Cliquer sur **« Travailler avec un dépôt local »** et choisir le dossier
   `amelstinykitchen` (la racine du projet). Le navigateur demande
   l'autorisation de modifier les fichiers : accepter.

Le CMS n'existe qu'en local : il n'est jamais publié sur le site.

### Ce qu'on peut éditer

| Collection | Contenu |
|---|---|
| **Recettes** | fiches recettes : visuels, ingrédients, étapes, astuces… |
| **Articles** | articles de blog |
| **Catégories** | catégories des recettes (Pâtisserie, Desserts…) |
| **Tags** | tags et saisons (Citron, Été…) |

Chaque champ du formulaire a un libellé et, si besoin, une aide sous le champ.
Les champs facultatifs peuvent rester vides.

### Français et anglais

Le français est la langue principale ; l'anglais est une traduction.

- **Les textes** (titre, slug d'URL, étapes, textes alternatifs…) se saisissent
  dans chaque langue, via les onglets **FR / EN** de l'éditeur.
- **Les autres champs** (temps, portions, difficulté, quantités, images, tags,
  catégorie, dates…) se saisissent **une seule fois en français** : ils sont
  recopiés automatiquement dans la version anglaise (en lecture seule côté EN).
- **Une traduction manquante est masquée** : une recette sans version anglaise
  n'apparaît tout simplement pas sur le site anglais. On peut donc publier en
  français d'abord et traduire plus tard.

### Créer une recette

1. **Recettes → Nouvelle recette.**
2. Remplir le **titre** et le **slug d'URL** dans chaque langue. Le slug est la
   fin de l'adresse de la page (`tarte-au-citron` →
   `/fr/recipes/tarte-au-citron/`) : minuscules, sans accents ni espaces,
   mots séparés par des tirets. Il donne aussi son nom au fichier : le choisir
   avec soin, il ne doit plus changer une fois la recette publiée.
3. Choisir la **catégorie** et les **tags** (ils doivent exister : les créer
   avant dans Catégories / Tags si besoin).
4. Ajouter au moins **un visuel** : la première image est l'image principale ;
   plusieurs images s'affichent en carrousel. Toujours renseigner le **texte
   alternatif** (il décrit l'image pour les personnes malvoyantes et pour
   Google).
5. Renseigner les **ingrédients** par groupe (« Pâte », « Garniture »…) :
   - **Quantité** : un nombre (`250`, `0.5`). Elle s'adapte quand le lecteur
     change le nombre de portions. La laisser vide pour une quantité qui ne doit
     pas varier (« 1 pincée de sel »).
   - **Unité** : `g`, `ml`, `c. à soupe`… (traduite dans chaque langue).
   - **Affichage** (facultatif) : remplace la quantité affichée, ex. « ½ » ou
     « le zeste d'un citron ».
6. Écrire les **étapes**, avec si besoin une **astuce** (ou un avertissement)
   et des illustrations.
7. Enregistrer.

Une recette sans étapes peut à la place utiliser des **sections** (texte
libre) : elles ne s'affichent que si la recette n'a aucune étape.

### Brouillons

Cocher **Brouillon** pour travailler une recette sans la publier : elle est
visible en local (`npm run dev`) mais **jamais sur le site en ligne**. Une
recette publiée (non brouillon) doit avoir au moins un visuel et un chapô (ou
une description SEO) : sinon le build refuse de la publier et indique pourquoi.

### SEO

- **Chapô** : court résumé affiché sur les cartes, réutilisé comme description
  pour Google.
- **Titre SEO** et **Description SEO** (facultatifs) : remplacent le titre et le
  chapô dans l'onglet du navigateur et les résultats de recherche.
- **Mots-clés** (facultatifs) : à défaut, les tags sont utilisés.

### Vérifier le résultat

Le site local (<http://localhost:4321/fr/>) se met à jour à chaque
enregistrement : ouvrir la page de la recette dans un autre onglet pour
vérifier le rendu, en français et en anglais.

## Publier une modification

Le CMS écrit les fichiers mais ne les envoie pas sur GitHub : c'est à faire avec
Git (en ligne de commande, ou avec un client comme GitHub Desktop).

```bash
git switch -c contenu/tarte-aux-pommes   # une branche par lot de modifications
git add src/content src/assets
git commit -m "Ajoute la tarte aux pommes"
git push -u origin contenu/tarte-aux-pommes
```

Ouvrir ensuite une **pull request** sur GitHub : la CI vérifie que tout est
valide (contenu, build, tests). Une fois fusionnée dans `main`, la modification
part en ligne au **prochain déploiement**.

> Après un `git pull`, recharger la page du CMS pour qu'il voie les fichiers à
> jour.

## Déployer le site

Le site est déployé sur **Cloudflare Workers** (assets statiques, voir
`wrangler.jsonc`). Le déploiement de production est **manuel et se fait à
partir d'un tag Git**, jamais d'une branche.

### 1. Créer un tag sur `main`

```bash
git switch main
git pull
git tag v1.2.0          # version suivante, au format vX.Y.Z
git push origin v1.2.0
```

### 2. Lancer le déploiement

Sur GitHub : **Actions → Production deployment → Run workflow**, saisir le tag
(`v1.2.0`) puis valider. Ou en ligne de commande :

```bash
gh workflow run deploy-production.yml -f tag=v1.2.0
```

Le workflow construit le site depuis ce tag et le publie avec
`wrangler deploy`. Deux déploiements ne tournent jamais en même temps.

**Revenir en arrière** : relancer le workflow avec le tag précédent.

### Configuration requise (une seule fois)

Dans les réglages du dépôt GitHub, environnement **`production`** :

| Nom | Type | Valeur |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | secret | token API Cloudflare avec le droit « Workers Scripts: Edit » |
| `CLOUDFLARE_ACCOUNT_ID` | variable | identifiant du compte Cloudflare |

### Déployer depuis sa machine (dépannage)

```bash
npx wrangler login      # une fois
npm run deploy          # build + wrangler deploy
```

`npm run preview:cf` sert le build localement dans l'environnement Workers,
pour vérifier avant de déployer.

## Commandes

| Commande | Action |
|---|---|
| `npm run dev` | site + CMS en local sur `localhost:4321` |
| `npm run build` | build de production dans `dist/` |
| `npm run preview` | prévisualise le build |
| `npm run check` | vérifie les types et le contenu (`astro check`) |
| `npm run lint` / `lint:fix` | lint et format (Biome) |
| `npm run test` | tests unitaires (Vitest) |
| `npm run test:e2e` | tests end-to-end (Playwright, `npx playwright install chromium` la première fois) |
| `npm run knip` | code et dépendances inutilisés |
| `npm run spell` | orthographe FR/EN (cspell) |
| `npm run deploy` | build + déploiement Cloudflare depuis sa machine |

## Pour les développeurs

Les conventions détaillées (composants, CSS, tests, i18n) sont dans
[`AGENTS.md`](AGENTS.md) et les skills de `.claude/skills/`.

### Structure du contenu

```text
src/content/
├── recipes/
│   ├── fr/tarte-au-citron-meringuee.md   # un fichier par langue…
│   └── en/lemon-meringue-pie.md          # …reliés par `translationKey`
├── posts/{fr,en}/…
├── categories/patisserie.json            # { "fr": {…}, "en": {…} }
└── tags/citron.json
src/assets/{recipes,posts,categories,tags}/   # images, référencées en /src/assets/…
```

- Recettes et articles : un fichier par langue, avec `locale` et un
  `translationKey` commun (le slug français, écrit par le CMS).
- Tags et catégories : un fichier par entrée contenant les deux langues, pour
  que les références restent un identifiant stable (`citron`).
- Le build refuse les erreurs d'une édition à la main : fichier dans le
  mauvais dossier de langue, deux fichiers sur la même URL ou la même
  `translationKey`, slug invalide, champ partagé (temps, tags, saison…)
  différent entre FR et EN.

### Le schéma pilote le CMS

`src/content.config.ts` est la **seule source** : les champs du CMS sont
générés depuis les schémas Zod (via les JSON Schema qu'Astro écrit dans
`.astro/collections/`). Pour ajouter un champ :

```ts
cuisine: z
  .string()
  .optional()
  .meta(cms({ label: "Cuisine", translate: true, hint: "Ex. « Française »." })),
```

- `label` (obligatoire) : libellé du formulaire ; `hint` : aide sous le champ ;
- `translate: true` : saisi dans chaque langue, sinon saisi une fois et recopié ;
- `widget` : `text`, `markdown`, `image`, `relation` (avec `collection`),
  `hidden` ; `options` : libellés des valeurs d'un enum ;
- `cms(false)` : champ exclu du formulaire.

Un champ sans `.meta(cms(…))` fait échouer le chargement du CMS, avec le nom du
champ en cause. Seuls les réglages de collection (dossier, nom de fichier,
dossier des médias) sont écrits à la main, dans `cms/config.mjs`.
L'intégration `cms/integration.mjs` sert `/admin/` uniquement avec
`npm run dev` : rien n'est ajouté au build. Sveltia est une `devDependency`
épinglée (son bundle est servi depuis `node_modules`) ; pour la mettre à jour :
`npm install -D --save-exact @sveltia/cms@<version>`.
