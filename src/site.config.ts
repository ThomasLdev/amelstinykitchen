import type { Locale } from "@i18n";

interface SiteConfig {
  name: string;
  author: { name: string };
  /** Profile URLs; an empty value hides the link and leaves it out of `sameAs`. */
  social: { instagram: string; pinterest: string };
  /** Content of Pinterest's `p:domain_verify` meta, given when claiming the domain. */
  pinterestDomainVerify: string;
  ogLocale: Record<Locale, string>;
  themeColor: string;
}

/**
 * Site identity shared by the SEO head, JSON-LD and syndication endpoints.
 * The canonical origin lives in `astro.config.mjs` (`site`) and is read
 * through `Astro.site` / `import.meta.env.SITE`.
 */
export const siteConfig: SiteConfig = {
  name: "Amel's Tiny Kitchen",
  author: { name: "Amel" },
  social: { instagram: "", pinterest: "" },
  pinterestDomainVerify: "",
  ogLocale: { fr: "fr_FR", en: "en_US" },
  /** Matches `--bg` of the sage palette set on `<html>`. */
  themeColor: "#f5f2ec",
};

export const socialProfiles = (): string[] =>
  Object.values(siteConfig.social).filter((url) => url !== "");
