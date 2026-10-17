import { formatQuantity } from "@lib/content/quantity";
import { describe, expect, it } from "vitest";

describe("formatQuantity", () => {
  it("keeps whole numbers and rounds large amounts to the unit", () => {
    expect(formatQuantity(2, "fr")).toBe("2");
    expect(formatQuantity(281.25, "fr")).toBe("281");
  });

  it("rounds small amounts to one decimal with the locale separator", () => {
    expect(formatQuantity(1.125, "fr")).toBe("1,1");
    expect(formatQuantity(1.125, "en")).toBe("1.1");
    expect(formatQuantity(0.5, "fr")).toBe("0,5");
  });

  it("never groups thousands, like the amounts typed in the CMS", () => {
    expect(formatQuantity(1500, "fr")).toBe("1500");
    expect(formatQuantity(1500, "en")).toBe("1500");
  });

  it("can keep more decimals where nothing is scaled", () => {
    expect(formatQuantity(0.25, "fr", 3)).toBe("0,25");
  });
});
