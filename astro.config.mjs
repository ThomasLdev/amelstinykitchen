// @ts-check
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

const fontDir = "./src/assets/fonts";

// https://astro.build/config
export default defineConfig({
  site: "https://amelstinykitchen.fr",
  // Matches wrangler's `auto-trailing-slash` so canonical URLs have one form.
  trailingSlash: "always",
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
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Tinos",
      cssVariable: "--font-tinos",
      fallbacks: ["Georgia", "serif"],
      options: {
        variants: [
          { src: [`${fontDir}/tinos/tinos-latin-400-normal.woff2`], weight: 400, style: "normal" },
          { src: [`${fontDir}/tinos/tinos-latin-400-italic.woff2`], weight: 400, style: "italic" },
          { src: [`${fontDir}/tinos/tinos-latin-700-normal.woff2`], weight: 700, style: "normal" },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Ubuntu",
      cssVariable: "--font-ubuntu",
      fallbacks: ["system-ui", "sans-serif"],
      options: {
        variants: [
          {
            src: [`${fontDir}/ubuntu/ubuntu-latin-400-normal.woff2`],
            weight: 400,
            style: "normal",
          },
          {
            src: [`${fontDir}/ubuntu/ubuntu-latin-500-normal.woff2`],
            weight: 500,
            style: "normal",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Ubuntu Mono",
      cssVariable: "--font-ubuntu-mono",
      fallbacks: ["ui-monospace", "monospace"],
      options: {
        variants: [
          {
            src: [`${fontDir}/ubuntu-mono/ubuntu-mono-latin-400-normal.woff2`],
            weight: 400,
            style: "normal",
          },
        ],
      },
    },
  ],
  integrations: [
    sitemap({
      // `/` is only a redirect to the default locale; hreflang lives in each page's <head>
      // because FR and EN slugs differ, which the sitemap `i18n` option cannot pair.
      filter: (page) => new URL(page).pathname !== "/",
    }),
  ],
  redirects: {
    "/": "/fr/",
  },
});
