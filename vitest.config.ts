/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,astro}", "cms/**/*.mjs", "integrations/**/*.mjs"],
      // Tested end to end (routes, layout, DOM wiring) or nothing to test (data, types, dev server).
      exclude: [
        "src/pages/**",
        "src/layouts/**",
        // Pure modules of the client scripts stay measured.
        "src/scripts/**/!(nav-state|load-index).ts",
        "src/i18n/{fr,en}.ts",
        "src/site.config.ts",
        "src/env.d.ts",
        "src/lib/content/season-images.ts",
        "src/lib/seo/llms.ts",
        "cms/integration.mjs",
        // Markup and styles only, or a whole page section covered by the e2e suite.
        "src/components/{Breadcrumb,ChefNote,Chip,Cravings,CravingsNav,FeaturedRecipe,HomeHero}.astro",
        "src/components/{NotFoundHero,NotFoundPage,NotFoundSuggestions,PageHeader,RecipeGrid}.astro",
        "src/components/{Section,SectionHead,SheetAction,SheetSubmit,SkipLink,ViewAllLink}.astro",
      ],
      reporter: ["text-summary", "text", "html"],
      // A few points under the current figures: a module added without tests fails, noise does not.
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 88,
        branches: 84,
        // The pure logic lives here: it must not be diluted in the global figure.
        "src/lib/**": { lines: 85, functions: 80, branches: 80 },
      },
    },
  },
});
