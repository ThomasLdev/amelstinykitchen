import type { Locale } from "@i18n";
import { z } from "astro/zod";

/**
 * A text field that exists in every supported locale.
 * Both locales are required so a missing translation fails the build instead of
 * silently falling back (explicit-fallback rule from AGENTS.md).
 */
export const localizedString = z.object({
  fr: z.string(),
  en: z.string(),
});

export type LocalizedString = z.infer<typeof localizedString>;

/** Resolve a localized string for the active locale. */
export function translate(value: LocalizedString, locale: Locale): string {
  return value[locale];
}
