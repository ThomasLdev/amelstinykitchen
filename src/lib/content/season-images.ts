import type { Season } from "@lib/content/season";
import type { ImageMetadata } from "astro";
import autumn from "../../assets/seasons/autumn.jpg";
import spring from "../../assets/seasons/spring.jpg";
import summer from "../../assets/seasons/summer.jpg";
import winter from "../../assets/seasons/winter.jpg";

/** Kept apart from `season.ts`, which the client bundle imports. */
export const seasonImages: Record<Season, ImageMetadata> = { spring, summer, autumn, winter };
