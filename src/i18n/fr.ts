const fr = {
  meta: {
    title: "Amel's Tiny Kitchen",
    description: "Un carnet de recettes simples et généreuses, à cuisiner au fil des saisons.",
  },
  brand: {
    mark: "a",
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
      ideas: "Idées :",
    },
    featured: {
      badge: "À la une",
    },
    tags: {
      kicker: "Par envie",
      title: "Parcourir les",
      titleEm: "envies",
      sub: "Des idées pour cuisiner selon l'humeur du jour.",
      inSeason: "De saison",
      recipesCount: (count: number) =>
        count === 0 ? "Aucune recette" : count === 1 ? "1 recette" : `${count} recettes`,
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
    chef: {
      label: "L'astuce pour cette recette",
    },
  },
};

export type Dictionary = typeof fr;

export default fr;
