import type { Page } from "@playwright/test";

declare global {
  interface Window {
    __layoutShifts: string[];
  }
}

/** Layout shifts (Chromium only) while `path` loads, each naming its moved nodes so a failure says what moved. */
export async function loadShifts(page: Page, path: string): Promise<string[]> {
  // A local preview answers instantly. Hold every other resource back, scripts the longest, so images,
  // fonts and scripts all land after the first paint, as on a real network.
  await page.route("**/*", async (route) => {
    const type = route.request().resourceType();
    const delay = type === "document" ? 0 : type === "script" ? 600 : 300;
    await new Promise((resolve) => setTimeout(resolve, delay));
    await route.continue();
  });

  await page.addInitScript(() => {
    window.__layoutShifts = [];
    const describe = (node: Node | null): string => {
      const element = node instanceof Element ? node : node?.parentElement;
      if (!element) return "?";
      const hooks = [...element.attributes]
        .filter((attr) => attr.name.startsWith("data-") && !attr.name.startsWith("data-astro"))
        .map((attr) => `[${attr.name}]`);
      return element.localName + (element.id ? `#${element.id}` : "") + hooks.join("");
    };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        value: number;
        hadRecentInput: boolean;
        sources: { node: Node | null }[];
      })[]) {
        if (entry.hadRecentInput) continue;
        const nodes = entry.sources.map((source) => describe(source.node)).join(", ");
        window.__layoutShifts.push(
          `${entry.value.toFixed(4)} at ${Math.round(entry.startTime)}ms: ${nodes}`,
        );
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto(path);
  await page.waitForLoadState("networkidle");
  return page.evaluate(async () => {
    await document.fonts.ready;
    // Two frames: shifts from the last load are reported after the next paint.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return window.__layoutShifts;
  });
}
