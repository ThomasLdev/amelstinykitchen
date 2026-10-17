import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import nestedNotFound from "../../integrations/nested-not-found.mjs";

const logger = { info: () => {} };
let dist: string;

afterEach(() => rm(dist, { recursive: true, force: true }));

async function build(pages: Record<string, string>) {
  dist = await mkdtemp(join(tmpdir(), "nested-404-"));
  for (const [file, html] of Object.entries(pages)) {
    await mkdir(join(dist, file, ".."), { recursive: true });
    await writeFile(join(dist, file), html);
  }
  const done = nestedNotFound().hooks["astro:build:done"];
  await done({
    dir: pathToFileURL(`${dist}/`),
    pages: [{ pathname: "404" }, { pathname: "en/404/" }, { pathname: "en/" }],
    logger,
  });
}

describe("nestedNotFound", () => {
  it("moves a locale's 404 page to `<locale>/404.html`, leaving other pages alone", async () => {
    await build({
      "404.html": "fr",
      "en/404/index.html": "en",
      "en/index.html": "home",
    });

    expect(await readFile(join(dist, "en/404.html"), "utf8")).toBe("en");
    expect((await readdir(join(dist, "en"))).sort()).toEqual(["404.html", "index.html"]);
    expect(await readFile(join(dist, "404.html"), "utf8")).toBe("fr");
  });
});
