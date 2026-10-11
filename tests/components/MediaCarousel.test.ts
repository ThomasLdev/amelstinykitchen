import MediaCarousel from "@components/MediaCarousel.astro";
import { describe, expect, it } from "vitest";
import cover from "../fixtures/cover.png";
import smallStep from "../fixtures/small.png";
import { count, createContainer } from "../helpers";

const container = await createContainer();

describe("MediaCarousel", () => {
  it("serves the hero as cropped 4/3 AVIF + WebP, with priority on the first image only", async () => {
    const html = await container.renderToString(MediaCarousel, {
      props: {
        media: [
          { src: cover, alt: "Couverture" },
          { src: cover, alt: "Détail" },
        ],
        locale: "fr",
        variant: "hero",
        eager: true,
      },
    });

    expect(html).toContain('type="image/avif"');
    expect(html).toContain('type="image/webp"');
    expect(html).toContain("w=960&amp;h=720");
    expect(html).toContain("fit=cover");
    expect(count(html, /fetchpriority="high"/g)).toBe(1);
    expect(count(html, /loading="lazy"/g)).toBe(1);
    expect(html).toContain("data-carousel-prev");
    expect(count(html, /data-carousel-dot/g)).toBe(2);
  });

  it("renders a single default image as a lazy 16/9 figure without controls", async () => {
    const html = await container.renderToString(MediaCarousel, {
      props: { media: [{ src: cover, alt: "Étape" }], locale: "fr" },
    });

    expect(html).toContain("<figure");
    expect(html).toContain("w=960&amp;h=540");
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain("data-carousel");
  });

  it("never generates widths larger than the source", async () => {
    const html = await container.renderToString(MediaCarousel, {
      props: { media: [{ src: smallStep, alt: "Étape" }], locale: "fr" },
    });

    expect(html).toContain("300w");
    expect(html).not.toMatch(/\b(480|720|960)w\b/);
  });
});
