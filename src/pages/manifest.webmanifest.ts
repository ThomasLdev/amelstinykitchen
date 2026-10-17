import { siteConfig } from "@site";
import type { APIRoute } from "astro";

/** Lets Android name and draw the site when it is added to the home screen. */
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: siteConfig.name,
      short_name: siteConfig.shortName,
      start_url: "/",
      display: "browser",
      background_color: siteConfig.themeColor,
      theme_color: siteConfig.themeColor,
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    }),
    { headers: { "Content-Type": "application/manifest+json" } },
  );
