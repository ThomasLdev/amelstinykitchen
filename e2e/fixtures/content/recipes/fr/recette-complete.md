---
# Reference fixture for the e2e suite: every recipe-page feature is exercised.
# Homepage: newest published recipe (hero) and featured (signature card).
locale: fr
translationKey: recette-complete
title: Recette complète
paths: recette-complete
excerpt: L’accroche de la recette de test.
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
    alt: Première photo de couverture.
  - src: /e2e/fixtures/content/assets/cover-2.png
    alt: Seconde photo de couverture.
ingredientGroups:
  - label: Pâte
    ingredients:
      - name: Farine
        quantity: 200
        unit: g
      - name: Sel
        unit: une pincée
  - label: Garniture
    ingredients:
      - name: Citron
        quantity: 1
        display: 1 zeste
      - name: Sucre
        quantity: 100
        unit: g
steps:
  - title: Première étape
    content: Texte de la première étape.
    tip:
      type: tip
      text: Une astuce de test.
    media:
      - src: /e2e/fixtures/content/assets/step.png
        alt: Photo de l'étape.
  - title: Seconde étape
    content: Texte de la seconde étape.
    tip:
      type: warning
      text: Un avertissement de test.
chefNote:
  title: Le conseil de test
  body: Corps du conseil de test.
---
