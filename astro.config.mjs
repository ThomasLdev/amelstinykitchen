// @ts-check
import { defineConfig, fontProviders } from "astro/config";

const fontDir = "./src/assets/fonts";

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
  redirects: {
    "/": "/fr/",
  },
});
