import en from "./en";
import fr from "./fr";

export const languages = { fr, en };

export type Locale = keyof typeof languages;

export const defaultLocale: Locale = "fr";

export function useTranslations(locale: Locale): (typeof languages)[Locale] {
  return languages[locale];
}

export function isLocale(value: string | undefined): value is Locale {
  return value === "fr" || value === "en";
}
