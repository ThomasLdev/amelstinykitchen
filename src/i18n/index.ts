import en from "./en";
import fr from "./fr";

export const languages = { fr, en };

export type Locale = keyof typeof languages;

export const defaultLocale: Locale = "fr";

export const locales = Object.keys(languages) as Locale[];

export function useTranslations(locale: Locale): (typeof languages)[Locale] {
  return languages[locale];
}

function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function toLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export const localeParams = () => locales.map((lang) => ({ params: { lang } }));
