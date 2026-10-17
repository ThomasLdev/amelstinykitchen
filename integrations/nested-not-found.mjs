import { rename, rmdir } from "node:fs/promises";

/**
 * Cloudflare (`not_found_handling: "404-page"`) serves the nearest `404.html`,
 * but Astro writes only the root one as a file: nested `<dir>/404/index.html`
 * pages are moved to `<dir>/404.html` so each locale gets its own 404.
 */
export default function nestedNotFound() {
  return {
    name: "nested-not-found",
    hooks: {
      "astro:build:done": async ({ dir, pages, logger }) => {
        const nested = pages
          .map(({ pathname }) => pathname.replace(/\/?$/, "/"))
          .filter((pathname) => /^.+\/404\/$/.test(pathname));

        await Promise.all(
          nested.map(async (pathname) => {
            const folder = new URL(pathname, dir);
            await rename(new URL("index.html", folder), new URL("../404.html", folder));
            await rmdir(folder);
            logger.info(`${pathname}index.html → ${pathname.slice(0, -1)}.html`);
          }),
        );
      },
    },
  };
}
