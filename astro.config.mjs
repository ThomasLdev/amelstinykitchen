// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Fixture builds (e2e) keep their own content-layer cache so they never mix
  // with the editorial content of regular builds.
  ...(process.env.CONTENT_DIR && { cacheDir: "./node_modules/.astro-fixtures" }),
  i18n: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  redirects: {
    "/": "/fr/",
  },
});
