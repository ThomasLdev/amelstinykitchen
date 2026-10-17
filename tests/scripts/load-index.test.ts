import { loadRecipeSearch } from "@scripts/search/load-index";
import { afterEach, describe, expect, it, vi } from "vitest";

const entry = {
  id: "tarte",
  href: "/fr/recipes/tarte/",
  title: "Tarte au citron",
  meta: "",
  date: 0,
  search: { title: "Tarte au citron", labels: "", ingredients: [], excerpt: "" },
};

afterEach(() => vi.unstubAllGlobals());

describe("loadRecipeSearch", () => {
  it("fetches an index once per URL, shared by every caller", async () => {
    const fetch = vi.fn(async () => Response.json([entry]));
    vi.stubGlobal("fetch", fetch);

    const [first, second] = await Promise.all([
      loadRecipeSearch("/shared.json"),
      loadRecipeSearch("/shared.json"),
    ]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
    expect([...(first.search("citron")?.keys() ?? [])]).toEqual(["tarte"]);
  });

  it("retries on the next call after a failed load", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(Response.json([entry]));
    vi.stubGlobal("fetch", fetch);

    await expect(loadRecipeSearch("/flaky.json")).rejects.toThrow(/HTTP 500/);
    await expect(loadRecipeSearch("/flaky.json")).resolves.toHaveProperty("entries");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
