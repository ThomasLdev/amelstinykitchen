import { execSync } from "node:child_process";

/**
 * The fixture build rewrites the generated `.astro/` folder (content store,
 * content assets map), which is shared with `astro dev` and cannot be moved.
 * Re-sync it with the editorial content so a running dev server keeps working.
 */
export default function globalTeardown(): void {
  if (process.env.CI) return; // no dev server to protect on CI
  const { CONTENT_DIR: _fixtures, ...env } = process.env;
  execSync("npx astro sync", { env, stdio: "ignore" });
}
