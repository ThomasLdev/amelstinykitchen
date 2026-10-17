---
# Recipe without steps: the narrative sections fallback is rendered instead.
# Homepage: featured but older than recette-complete (second popular card).
# French only: the missing English translation is hidden (no EN page, list entry
# or hreflang), never served from the French file.
locale: fr
translationKey: recette-narrative
title: Recette narrative
paths: recette-narrative
# No excerpt (cards stay without summary): the meta description comes from metaDescription.
metaDescription: Description SEO de la recette narrative.
category: categorie-test
difficulty: easy
isFeatured: true
publishDate: 2026-01-02
media:
  - src: /e2e/fixtures/content/assets/cover-1.png
    alt: Photo de couverture.
sections:
  - title: Une section
    content: <p>Texte de la section narrative.</p>
---
