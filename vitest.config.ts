/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,astro}", "cms/**/*.mjs", "integrations/**/*.mjs"],
      reporter: ["text-summary", "text", "html"],
    },
  },
});
