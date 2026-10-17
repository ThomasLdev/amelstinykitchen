import { defaultLocale, localeParams, toLocale } from "@i18n";
import { describe, expect, it } from "vitest";

describe("toLocale", () => {
  it("keeps a supported locale and falls back to the default one otherwise", () => {
    expect(toLocale("en")).toBe("en");
    expect(toLocale("de")).toBe(defaultLocale);
    expect(toLocale(undefined)).toBe(defaultLocale);
  });
});

describe("localeParams", () => {
  it("generates one route per locale", () => {
    expect(localeParams()).toEqual([{ params: { lang: "fr" } }, { params: { lang: "en" } }]);
  });
});
