import type { Season } from "@lib/content/season";

const fr = {
  meta: {
    title: "Amel's Tiny Kitchen",
    description: "Un carnet de recettes simples et généreuses, à cuisiner au fil des saisons.",
  },
  brand: {
    name: "Amel's",
    nameAccent: "Tiny Kitchen",
  },
  a11y: {
    skipToContent: "Aller au contenu",
    breadcrumb: "Fil d'Ariane",
    carousel: "Galerie d'images",
    carouselRole: "carrousel",
    carouselPrevious: "Image précédente",
    carouselNext: "Image suivante",
    slide: "diapositive",
    slidePosition: (current: number, total: number) => `Image ${current} sur ${total}`,
  },
  header: {
    navAriaLabel: "Navigation principale",
    home: "Accueil",
    recipes: "Recettes",
    search: "Recherche",
  },
  footer: {
    /** Name of this language, in itself (language switch). */
    languageName: "Français",
    tagline: "Des recettes simples et généreuses, à partager sans façon.",
    recipesTitle: "Recettes",
    recipesAriaLabel: "Catégories de recettes",
    recipesLinks: ["Printemps", "Été", "Automne", "Hiver"],
    copyright: "Tous droits réservés.",
    socialsAriaLabel: "Réseaux sociaux",
    instagram: "Instagram",
    pinterest: "Pinterest",
  },
  home: {
    intro: {
      kicker: "La cuisine d'Amel",
      title: "Des recettes simples et généreuses, à partager",
      titleEm: "sans façon.",
    },
    search: {
      label: "Que cuisine-t-on aujourd'hui ?",
      placeholder: "Une recette, un ingrédient…",
      submit: "Chercher",
    },
    featured: {
      badge: "À la une",
    },
    tags: {
      kicker: "Par envie",
      title: "Parcourir les",
      titleEm: "envies",
      sub: "Des idées pour cuisiner selon l'humeur du jour.",
      nav: "Envies",
      all: "Tout voir",
      inSeason: "De saison",
      /** Before, emphasized, after: the article depends on the season. */
      seasonTitle: {
        spring: ["Le ", "printemps", " en cuisine"],
        summer: ["L'", "été", " en cuisine"],
        autumn: ["L'", "automne", " en cuisine"],
        winter: ["L'", "hiver", " en cuisine"],
      } satisfies Record<Season, [string, string, string]>,
      seasonRecipes: {
        spring: (count: number) =>
          count === 1 ? "La recette de printemps" : `Les ${count} recettes de printemps`,
        summer: (count: number) =>
          count === 1 ? "La recette d'été" : `Les ${count} recettes d'été`,
        autumn: (count: number) =>
          count === 1 ? "La recette d'automne" : `Les ${count} recettes d'automne`,
        winter: (count: number) =>
          count === 1 ? "La recette d'hiver" : `Les ${count} recettes d'hiver`,
      },
    },
    popular: {
      kicker: "En ce moment",
      title: "Les plus",
      titleEm: "aimées",
      viewAll: "Toutes les recettes",
    },
  },
  recipe: {
    prep: "Prépa.",
    cook: "Cuisson",
    total: "Total",
    difficultyLabel: "Difficulté",
    difficulty: {
      easy: "Facile",
      medium: "Intermédiaire",
      advanced: "Avancé",
    },
    breadcrumb: {
      home: "Accueil",
      recipes: "Recettes",
    },
    actions: {
      print: "Imprimer la recette",
      share: "Partager la recette",
      jump: "Voir la recette",
    },
    servings: {
      label: "Portions",
      decrease: "Diminuer les portions",
      increase: "Augmenter les portions",
    },
    ingredients: {
      title: "Les",
      titleEm: "ingrédients",
      progress: "%count% / %total% prêts",
      reset: "Tout décocher",
      done: "J'ai tout, voir les étapes",
    },
    view: {
      legend: "Afficher",
      ingredients: "Ingrédients",
      steps: "Étapes",
    },
    steps: {
      title: "Les",
      titleEm: "étapes",
      tip: "Astuce.",
      warning: "Attention.",
    },
    related: {
      kicker: "À cuisiner aussi",
      title: "Dans le même",
      titleEm: "esprit",
    },
    chef: {
      label: "L'astuce pour cette recette",
    },
  },
  markdown: {
    /** French typography: a space before the colon. */
    separator: " : ",
    source: "Source",
    category: "Catégorie",
    cuisine: "Cuisine",
    recipes: "Recettes",
  },
  notFound: {
    title: "Page introuvable",
    kicker: "Erreur 404 · page introuvable",
    heading: "Cette page n'est plus",
    headingEm: "au menu",
    text: "Le lien est peut-être ancien, ou la recette a changé de nom. Cherchez-la directement, ou repartez d'un endroit connu.",
    searchLabel: "Rechercher une recette",
    home: "Retour à l'accueil",
    recipes: "Toutes les recettes",
    suggestions: "En attendant, de quoi se consoler",
    cravings: "Ou par envie",
  },
  recipes: {
    meta: {
      title: "Toutes les recettes",
      description: "Toutes les recettes d'Amel, à filtrer par catégorie, saison ou envie.",
    },
    title: "Toutes les",
    titleEm: "recettes",
    breadcrumb: "Toutes les recettes",
    search: {
      label: "Rechercher dans les recettes",
      placeholder: "Une recette, un tag…",
    },
    sort: {
      label: "Trier par",
      popular: "Les plus aimées",
      recent: "Les plus récentes",
      quick: "Les plus rapides",
    },
    filters: {
      title: "Filtres",
      open: "Filtres",
      close: "Fermer les filtres",
      reset: "Réinitialiser",
      category: "Catégorie",
      season: "Saison",
      tags: "Tags",
      all: "Toutes",
      quick: "Catégories",
    },
    seasons: {
      spring: "Printemps",
      summer: "Été",
      autumn: "Automne",
      winter: "Hiver",
    },
    active: {
      remove: "Retirer le filtre %label%",
      query: "« %query% »",
      clear: "Tout effacer",
    },
    /** Client-side plurals, `%count%` is replaced by the number. */
    count: {
      zero: "0 recette",
      one: "1 recette",
      other: "%count% recettes",
    },
    apply: {
      zero: "Aucune recette",
      one: "Voir 1 recette",
      other: "Voir %count% recettes",
    },
    empty: {
      title: "Aucune recette ne correspond",
      text: "Essayez de retirer un filtre ou d'élargir la saison.",
    },
  },
};

export type Dictionary = typeof fr;

export default fr;
