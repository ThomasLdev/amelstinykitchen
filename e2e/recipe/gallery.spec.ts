import fr from "@i18n/fr";
import { expect, test } from "@playwright/test";
import { RECIPE_FR } from "../fixtures";

test.describe("hero gallery", () => {
  test("browses the hero gallery with its controls", async ({ page }) => {
    await page.goto(RECIPE_FR);
    // The hero is the first gallery of the page.
    const hero = page.getByRole("region", { name: fr.a11y.carousel }).first();
    const prev = hero.getByRole("button", { name: fr.a11y.carouselPrevious });
    const dots = hero.locator("[data-carousel-dot]");

    await expect(prev).toBeDisabled();
    await hero.getByRole("button", { name: fr.a11y.carouselNext }).click();
    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
    await expect(prev).toBeEnabled();
  });
});
