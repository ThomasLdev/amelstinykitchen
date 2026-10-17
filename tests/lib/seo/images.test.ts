import { ogImage, schemaImages } from "@lib/seo/images";
import { describe, expect, it } from "vitest";
import cover from "../../fixtures/cover.png";
import small from "../../fixtures/small.png";

const site = new URL("https://example.com");
const size = (url: string) => {
  const params = new URL(url).searchParams;
  return [Number(params.get("w")), Number(params.get("h"))];
};

describe("ogImage", () => {
  it("crops a 1200 × 630 card from a large enough source", async () => {
    const image = await ogImage(cover, "Tarte", site);

    expect(image).toMatchObject({ width: 1200, height: 630, alt: "Tarte" });
    expect(size(image.url)).toEqual([1200, 630]);
    expect(image.url).toMatch(/^https:\/\/example\.com\//);
  });

  it("never enlarges a smaller source: the declared size matches the file", async () => {
    const image = await ogImage(small, "", site);

    expect(image.width).toBeLessThanOrEqual(small.width);
    expect(size(image.url)).toEqual([image.width, image.height]);
  });
});

describe("schemaImages", () => {
  it("declares the 1:1, 4:3 and 16:9 crops Google asks for, within the source", async () => {
    const urls = await schemaImages(cover, site);

    expect(urls.map(size)).toEqual([
      [900, 900],
      [1200, 900],
      [1200, 675],
    ]);
  });
});
