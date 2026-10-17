import { readdir, readFile } from "node:fs/promises";
import { buildConfig } from "./config.mjs";

// The prebuilt browser bundle of the `@sveltia/cms` dev dependency.
const sveltiaBundle = new URL("../dist/sveltia-cms.js", import.meta.resolve("@sveltia/cms"));

async function loadSchemas(dir) {
  const files = (await readdir(dir)).filter((file) => file.endsWith(".schema.json"));
  const entries = await Promise.all(
    files.map(async (file) => [
      file.replace(".schema.json", ""),
      JSON.parse(await readFile(new URL(file, dir), "utf8")),
    ]),
  );
  return Object.fromEntries(entries);
}

/**
 * Serves the Sveltia CMS admin at /admin/ on the dev server only; never built.
 * The config is generated on each request from the current collection schemas.
 */
export default function cmsAdmin() {
  let schemasDir;

  return {
    name: "cms-admin",
    hooks: {
      "astro:config:done": ({ config }) => {
        schemasDir = new URL(".astro/collections/", config.root);
      },
      "astro:server:setup": ({ server }) => {
        server.middlewares.use("/admin", async (req, res, next) => {
          const path = (req.url ?? "/").split("?")[0];
          try {
            if (path === "/" || path === "/index.html") {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end(await readFile(new URL("index.html", import.meta.url)));
            } else if (path === "/sveltia-cms.js") {
              res.setHeader("Content-Type", "text/javascript; charset=utf-8");
              res.end(await readFile(sveltiaBundle));
            } else if (path === "/config.yml") {
              // JSON is valid YAML.
              res.setHeader("Content-Type", "text/yaml; charset=utf-8");
              res.end(JSON.stringify(buildConfig(await loadSchemas(schemasDir)), null, 2));
            } else {
              next();
            }
          } catch (error) {
            next(error);
          }
        });
      },
    },
  };
}
