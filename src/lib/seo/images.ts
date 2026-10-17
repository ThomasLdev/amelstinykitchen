import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

export interface SocialImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Center-cropped JPEG at `ratio` (width / height), never upscaled: the size is
 * capped by the source so the declared width/height match the file.
 */
async function cover(
  src: ImageMetadata,
  ratio: number,
  maxWidth: number,
  site: URL,
): Promise<{ url: string; width: number; height: number }> {
  const width = Math.min(maxWidth, src.width, Math.floor(src.height * ratio));
  const height = Math.round(width / ratio);
  const image = await getImage({ src, width, height, fit: "cover", format: "jpeg" });
  return { url: new URL(image.src, site).href, width, height };
}

/** Open Graph / X card: 1.91:1, 1200 px wide. */
export async function ogImage(src: ImageMetadata, alt: string, site: URL): Promise<SocialImage> {
  return { ...(await cover(src, 1200 / 630, 1200, site)), alt };
}

/** Recipe images in the 1:1, 4:3 and 16:9 ratios recommended by Google. */
export async function schemaImages(src: ImageMetadata, site: URL): Promise<string[]> {
  const ratios = [1, 4 / 3, 16 / 9];
  const images = await Promise.all(ratios.map((ratio) => cover(src, ratio, 1200, site)));
  return images.map((image) => image.url);
}

export async function stepImage(src: ImageMetadata, site: URL): Promise<string> {
  return (await cover(src, 4 / 3, 960, site)).url;
}
