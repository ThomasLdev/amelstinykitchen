import type { Dictionary } from "./fr";

const en: Dictionary = {
  meta: {
    title: "Amel's Tiny Kitchen",
    description: "A notebook of simple, generous recipes to cook with the seasons.",
  },
  brand: {
    name: "Amel's",
    nameAccent: "Tiny Kitchen",
  },
  a11y: {
    skipToContent: "Skip to content",
    breadcrumb: "Breadcrumb",
    carousel: "Image gallery",
    carouselRole: "carousel",
    carouselPrevious: "Previous image",
    carouselNext: "Next image",
    slide: "slide",
    slidePosition: (current: number, total: number) => `Image ${current} of ${total}`,
  },
  header: {
    navAriaLabel: "Main navigation",
    home: "Home",
    recipes: "Recipes",
    search: "Search",
  },
  footer: {
    /** Name of this language, in itself (language switch). */
    languageName: "English",
    tagline: "Simple, generous recipes meant to be shared.",
    recipesTitle: "Recipes",
    recipesAriaLabel: "Recipe categories",
    recipesLinks: ["Spring", "Summer", "Autumn", "Winter"],
    copyright: "All rights reserved.",
    socialsAriaLabel: "Social media",
    instagram: "Instagram",
    pinterest: "Pinterest",
  },
  home: {
    intro: {
      kicker: "Amel's kitchen",
      title: "Simple, generous recipes to share",
      titleEm: "no fuss.",
    },
    search: {
      label: "What are we cooking today?",
      placeholder: "A recipe, an ingredient…",
      submit: "Search",
      ideas: "Ideas:",
    },
    featured: {
      badge: "Featured",
    },
    tags: {
      kicker: "By craving",
      title: "Browse",
      titleEm: "cravings",
      sub: "Ideas to cook whatever you feel like today.",
      inSeason: "In season",
      recipesCount: (count: number) =>
        count === 0 ? "No recipes" : count === 1 ? "1 recipe" : `${count} recipes`,
    },
    popular: {
      kicker: "Right now",
      title: "Most",
      titleEm: "loved",
      viewAll: "All recipes",
    },
  },
  recipe: {
    prep: "Prep",
    cook: "Cook",
    total: "Total",
    difficultyLabel: "Difficulty",
    difficulty: {
      easy: "Easy",
      medium: "Medium",
      advanced: "Advanced",
    },
    breadcrumb: {
      home: "Home",
      recipes: "Recipes",
    },
    actions: {
      print: "Print recipe",
      share: "Share recipe",
      jump: "Jump to recipe",
    },
    servings: {
      label: "Servings",
      decrease: "Decrease servings",
      increase: "Increase servings",
    },
    ingredients: {
      title: "The",
      titleEm: "ingredients",
      progress: "%count% / %total% ready",
      reset: "Uncheck all",
      done: "Got everything, show the steps",
    },
    view: {
      legend: "Show",
      ingredients: "Ingredients",
      steps: "Steps",
    },
    steps: {
      title: "The",
      titleEm: "steps",
      tip: "Tip.",
      warning: "Heads up.",
    },
    related: {
      kicker: "Cook next",
      title: "In the same",
      titleEm: "spirit",
    },
    chef: {
      label: "A word from the pastry chef",
    },
  },
  markdown: {
    separator: ": ",
    source: "Source",
    category: "Category",
    cuisine: "Cuisine",
    recipes: "Recipes",
  },
  notFound: {
    title: "Page not found",
    kicker: "Error 404 · page not found",
    heading: "This page is no longer",
    headingEm: "on the menu",
    text: "The link may be old, or the recipe has been renamed. Search for it directly, or head back somewhere familiar.",
    searchLabel: "Search for a recipe",
    home: "Back to the homepage",
    recipes: "All recipes",
    suggestions: "In the meantime, a little comfort",
    cravings: "Or by craving",
  },
  recipes: {
    meta: {
      title: "All recipes",
      description: "All of Amel's recipes, to filter by category, season or craving.",
    },
    title: "All",
    titleEm: "recipes",
    breadcrumb: "All recipes",
    search: {
      label: "Search recipes",
      placeholder: "A recipe, a tag…",
    },
    sort: {
      label: "Sort by",
      popular: "Most loved",
      recent: "Most recent",
      quick: "Quickest",
    },
    filters: {
      title: "Filters",
      open: "Filters",
      close: "Close filters",
      reset: "Reset",
      category: "Category",
      season: "Season",
      tags: "Tags",
      all: "All",
      quick: "Categories",
    },
    seasons: {
      spring: "Spring",
      summer: "Summer",
      autumn: "Autumn",
      winter: "Winter",
    },
    active: {
      remove: "Remove the %label% filter",
      query: "“%query%”",
      clear: "Clear all",
    },
    count: {
      zero: "0 recipes",
      one: "1 recipe",
      other: "%count% recipes",
    },
    apply: {
      zero: "No recipes",
      one: "Show 1 recipe",
      other: "Show %count% recipes",
    },
    empty: {
      title: "No recipe matches",
      text: "Try removing a filter or widening the season.",
    },
  },
};

export default en;
