import { NAV_SCROLL_THRESHOLD, nextNavState } from "@scripts/nav-state";
import { describe, expect, it } from "vitest";

describe("nextNavState (mobile nav)", () => {
  const step = NAV_SCROLL_THRESHOLD + 1;

  it("is visible near the top and hidden over the footer, whatever the direction", () => {
    expect(nextNavState(0, 500, false)).toBe("visible");
    expect(nextNavState(0, 0, true)).toBe("hidden");
    expect(nextNavState(200, 600, true)).toBe("hidden");
  });

  it("hides when scrolling down and shows when scrolling up", () => {
    expect(nextNavState(500 + step, 500, false)).toBe("hidden");
    expect(nextNavState(500 - step, 500, false)).toBe("visible");
  });

  it("ignores movements under the threshold", () => {
    expect(nextNavState(500 + NAV_SCROLL_THRESHOLD, 500, false)).toBeNull();
    expect(nextNavState(500 - NAV_SCROLL_THRESHOLD, 500, false)).toBeNull();
  });
});
