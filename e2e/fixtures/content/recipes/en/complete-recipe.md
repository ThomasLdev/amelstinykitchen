---
# Reference fixture for the e2e suite: every recipe-page feature is exercised.
# Homepage: newest published recipe (hero) and featured (signature card).
locale: en
translationKey: recette-complete
title: Complete recipe
paths: complete-recipe
excerpt: The test recipe summary.
category: categorie-test
tags:
  - tag-test
difficulty: medium
preparationTime: 30
cookingTime: 15
servings: 4
isFeatured: true
publishDate: 2026-01-03
media:
  - src: /e2e/fixtures/content/assets/cover-1.png
    alt: First cover photo.
  - src: /e2e/fixtures/content/assets/cover-2.png
    alt: Second cover photo.
ingredientGroups:
  - label: Dough
    ingredients:
      - name: Flour
        quantity: 200
        unit: g
      - name: Salt
        unit: a pinch
  - label: Filling
    ingredients:
      - name: Lemon
        quantity: 1
        display: 1 zest
      - name: Sugar
        quantity: 100
        unit: g
steps:
  - title: First step
    content: First step text.
    tip:
      type: tip
      text: A test tip.
    media:
      - src: /e2e/fixtures/content/assets/step.png
        alt: Step photo.
  - title: Second step
    content: Second step text.
    tip:
      type: warning
      text: A test warning.
chefNote:
  title: The test advice
  body: Test advice body.
---
