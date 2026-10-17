import { sameInBothLocales } from "@lib/content/fields";
import { z } from "astro/zod";
import { describe, expect, it } from "vitest";

const taxonomy = z
  .object({
    fr: z.object({ title: z.string(), position: z.number() }),
    en: z.object({ title: z.string(), position: z.number() }),
  })
  .superRefine(sameInBothLocales(["position"]));

describe("sameInBothLocales", () => {
  it("lets translated fields differ", () => {
    const result = taxonomy.safeParse({
      fr: { title: "Tartes", position: 1 },
      en: { title: "Pies", position: 1 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a shared field that differs, on the English side", () => {
    const result = taxonomy.safeParse({
      fr: { title: "Tartes", position: 1 },
      en: { title: "Pies", position: 2 },
    });
    expect(result.error?.issues.map((issue) => issue.path)).toEqual([["en", "position"]]);
  });
});
