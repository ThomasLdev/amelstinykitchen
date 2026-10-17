import { assertTranslations, inLocale, translationsOf } from "@lib/content/i18n";
import { describe, expect, it } from "vitest";

const entry = (locale: "fr" | "en", translationKey: string, servings = 4) => ({
  id: `${locale}/${translationKey}`,
  data: { locale, translationKey, paths: `${translationKey}-${locale}`, servings },
});

const tarteFr = entry("fr", "tarte");
const tarteEn = entry("en", "tarte");
const fondantFr = entry("fr", "fondant");
const entries = [tarteFr, tarteEn, fondantFr];

describe("content i18n", () => {
  it("pairs the translations of an entry by translation key", () => {
    expect(translationsOf(tarteEn, entries)).toEqual({ fr: tarteFr, en: tarteEn });
  });

  it("leaves a missing translation absent instead of falling back", () => {
    expect(translationsOf(fondantFr, entries)).toEqual({ fr: fondantFr });
  });

  it("keeps the entries of one locale", () => {
    expect(entries.filter(inLocale("fr"))).toEqual([tarteFr, fondantFr]);
  });

  describe("assertTranslations", () => {
    const servings = (item: ReturnType<typeof entry>) => item.data.servings;

    it("accepts consistent pairs", () => {
      expect(() => assertTranslations(entries, servings)).not.toThrow();
    });

    it("rejects a file outside its locale folder", () => {
      const misplaced = { ...tarteEn, id: "fr/tarte-en" };
      expect(() => assertTranslations([misplaced], servings)).toThrow(/does not match its folder/);
    });

    it("rejects two files on the same URL or translation key", () => {
      const sameUrl = { ...fondantFr, data: { ...fondantFr.data, paths: tarteFr.data.paths } };
      expect(() => assertTranslations([tarteFr, sameUrl], servings)).toThrow(/same fr URL/);
      expect(() => assertTranslations([tarteFr, { ...tarteFr, id: "fr/copy" }], servings)).toThrow(
        /same fr translationKey/,
      );
    });

    it("rejects shared fields that differ between translations", () => {
      expect(() => assertTranslations([tarteFr, entry("en", "tarte", 6)], servings)).toThrow(
        /shared fields differ/,
      );
    });
  });
});
