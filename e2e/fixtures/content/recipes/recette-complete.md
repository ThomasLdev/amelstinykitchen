---
# Reference fixture for the e2e suite: every recipe-page feature is exercised.
# Homepage: newest published recipe (hero) and featured (signature card).
title:
  fr: "Recette complète"
  en: "Complete recipe"
paths:
  fr: "recette-complete"
  en: "complete-recipe"
excerpt:
  fr: "L’accroche de la recette de test."
  en: "The test recipe summary."
category: "categorie-test"
tags:
  - "tag-test"
difficulty: "medium"
preparationTime: 30
cookingTime: 15
servings: 4
isFeatured: true
publishDate: 2026-01-03
media:
  - src: "../assets/cover-1.png"
    alt:
      fr: "Première photo de couverture."
      en: "First cover photo."
  - src: "../assets/cover-2.png"
    alt:
      fr: "Seconde photo de couverture."
      en: "Second cover photo."
ingredientGroups:
  - label:
      fr: "Pâte"
      en: "Dough"
    ingredients:
      - name:
          fr: "Farine"
          en: "Flour"
        quantity: 200
        unit:
          fr: "g"
          en: "g"
      - name:
          fr: "Sel"
          en: "Salt"
        unit:
          fr: "une pincée"
          en: "a pinch"
  - label:
      fr: "Garniture"
      en: "Filling"
    ingredients:
      - name:
          fr: "Citron"
          en: "Lemon"
        quantity: 1
        display:
          fr: "1 zeste"
          en: "1 zest"
      - name:
          fr: "Sucre"
          en: "Sugar"
        quantity: 100
        unit:
          fr: "g"
          en: "g"
steps:
  - title:
      fr: "Première étape"
      en: "First step"
    content:
      fr: "Texte de la première étape."
      en: "First step text."
    tip:
      type: "tip"
      text:
        fr: "Une astuce de test."
        en: "A test tip."
    media:
      - src: "../assets/step.png"
        alt:
          fr: "Photo de l'étape."
          en: "Step photo."
  - title:
      fr: "Seconde étape"
      en: "Second step"
    content:
      fr: "Texte de la seconde étape."
      en: "Second step text."
    tip:
      type: "warning"
      text:
        fr: "Un avertissement de test."
        en: "A test warning."
chefNote:
  title:
    fr: "Le conseil de test"
    en: "The test advice"
  body:
    fr: "Corps du conseil de test."
    en: "Test advice body."
---
