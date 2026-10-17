import { currentSeason } from "@lib/content/season";
import { describe, expect, it } from "vitest";

describe("currentSeason", () => {
  it("follows meteorological seasons in local time, December being winter", () => {
    expect(currentSeason(new Date(2026, 11, 1))).toBe("winter");
    expect(currentSeason(new Date(2026, 1, 28, 23, 59))).toBe("winter");
    expect(currentSeason(new Date(2026, 2, 1, 0, 0))).toBe("spring");
    expect(currentSeason(new Date(2026, 7, 31, 23, 59))).toBe("summer");
    expect(currentSeason(new Date(2026, 9, 11))).toBe("autumn");
  });
});
