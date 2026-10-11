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
  hero: {
    badge: "Signature",
    kicker: "À la une",
    cta: "Voir la recette",
  },
  home: {
    hero: {
      title: "Tarte rustique aux fruits de saison",
      description:
        "Une pâte sablée, des fruits gorgés de soleil et un filet de miel : la simplicité qui fait tout.",
      prep: "15 min",
      cook: "45 min",
      total: "1 h",
      tags: ["Tarte", "Fruits", "Végétarien"],
    },
    tags: {
      kicker: "Catégories",
      title: "Explorez par",
      titleEm: "saison",
      sub: "Des idées pour cuisiner ce que le marché offre aujourd'hui.",
      items: [
        { name: "Printemps", meta: "12 recettes" },
        { name: "Été", meta: "18 recettes" },
        { name: "Automne", meta: "9 recettes" },
        { name: "Hiver", meta: "7 recettes" },
        { name: "Pâtisserie", meta: "24 recettes" },
      ],
    },
    philosophy: {
      kicker: "Notre philosophie",
      quote: "Bien manger, c'est d'abord prendre le temps.",
      author: "Amel",
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
      save: "Sauvegarder la recette",
    },
    servings: {
      label: "Portions",
      decrease: "Diminuer les portions",
      increase: "Augmenter les portions",
      forOne: "pour 1 personne",
      forMany: "pour %count% personnes",
    },
    ingredients: {
      kicker: "Liste de courses",
      title: "Les",
      titleEm: "ingrédients",
      reset: "Reset",
    },
    steps: {
      kicker: "La méthode",
      title: "Les",
      titleEm: "étapes",
      tip: "Astuce.",
      warning: "Attention.",
    },
    chef: {
      label: "Le mot de la pâtissière",
      initial: "A",
    },
  },
};

export type Dictionary = typeof fr;

export default fr;
