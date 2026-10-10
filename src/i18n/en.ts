import type { Dictionary } from "./fr";

const en: Dictionary = {
  meta: {
    title: "Amel's Tiny Kitchen",
    description: "A notebook of simple, generous recipes to cook with the seasons.",
  },
  brand: {
    mark: "a",
    name: "Amel's",
    nameAccent: "Tiny Kitchen",
  },
  a11y: {
    skipToContent: "Skip to content",
  },
  header: {
    navAriaLabel: "Main navigation",
    home: "Home",
    recipes: "Recipes",
  },
  footer: {
    tagline: "Simple, generous recipes meant to be shared.",
    recipesTitle: "Recipes",
    recipesAriaLabel: "Recipe categories",
    recipesLinks: ["Spring", "Summer", "Autumn", "Winter"],
    copyright: "All rights reserved.",
    socialsAriaLabel: "Social media",
    instagram: "Instagram",
    pinterest: "Pinterest",
  },
  hero: {
    badge: "Signature",
    kicker: "Featured",
    cta: "View recipe",
  },
  home: {
    hero: {
      title: "Rustic seasonal fruit tart",
      description:
        "A shortcrust base, sun-ripened fruit and a drizzle of honey: simplicity that does it all.",
      prep: "15 min",
      cook: "45 min",
      total: "1 hr",
      tags: ["Tart", "Fruit", "Vegetarian"],
    },
    tags: {
      kicker: "Categories",
      title: "Browse by",
      titleEm: "season",
      sub: "Ideas for cooking whatever the market offers today.",
      items: [
        { name: "Spring", meta: "12 recipes" },
        { name: "Summer", meta: "18 recipes" },
        { name: "Autumn", meta: "9 recipes" },
        { name: "Winter", meta: "7 recipes" },
        { name: "Baking", meta: "24 recipes" },
      ],
    },
    philosophy: {
      kicker: "Our philosophy",
      quote: "Eating well starts with taking your time.",
      author: "Amel",
    },
  },
  recipe: {
    prep: "Prep",
    cook: "Cook",
    total: "Total",
    difficulty: {
      easy: "Easy",
      medium: "Medium",
      advanced: "Advanced",
    },
    steps: {
      tip: "Tip",
      warning: "Careful",
    },
  },
};

export default en;
