import { defineConfig, devices } from "@playwright/test";

// Dedicated port: the suite never reuses the dev server (it serves editorial content).
const port = 4322;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["github"], ["html", { open: "never" }]] : "list",
  workers: process.env.CI ? "100%" : undefined,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: "**/*.mobile.spec.ts",
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: "**/*.mobile.spec.ts",
    },
  ],
  webServer: {
    // Production build of the fixture content only (e2e/fixtures/content).
    command: `npx astro build --outDir dist-e2e --force && npx astro preview --outDir dist-e2e --port ${port} --ignore-lock`,
    env: { CONTENT_DIR: "./e2e/fixtures/content" },
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: false,
    // Show the fixture build and preview output in the logs (hidden by default).
    stdout: "pipe",
  },
});
