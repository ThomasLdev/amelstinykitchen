import { formatQuantity } from "@scripts/recipe/portions";
import { describe, expect, it } from "vitest";

describe("formatQuantity (servings scaler)", () => {
  it("keeps whole numbers and rounds large amounts to the unit", () => {
    expect(formatQuantity(2, "fr")).toBe("2");
    expect(formatQuantity(281.25, "fr")).toBe("281");
  });

  it("rounds small amounts to one decimal with the locale separator", () => {
    expect(formatQuantity(1.125, "fr")).toBe("1,1");
    expect(formatQuantity(1.125, "en")).toBe("1.1");
    expect(formatQuantity(0.5, "fr")).toBe("0,5");
  });
});
