import type { Locale } from "@i18n";

interface Translatable {
  data: { locale: Locale; translationKey: string };
}

export const inLocale =
  (locale: Locale) =>
  (entry: Translatable): boolean =>
    entry.data.locale === locale;

/**
 * Every existing translation of `entry` (itself included), by locale. A locale
 * without a translation is absent: callers hide it rather than fall back.
 */
export function translationsOf<T extends Translatable>(
  entry: T,
  entries: T[],
): Partial<Record<Locale, T>> {
  return Object.fromEntries(
    entries
      .filter((candidate) => candidate.data.translationKey === entry.data.translationKey)
      .map((candidate) => [candidate.data.locale, candidate]),
  );
}

/** A tag or category seen in one locale: both locales live in the same entry. */
export function localize<T extends { id: string; data: Record<Locale, unknown> }>(
  entry: T,
  locale: Locale,
): { id: string; data: T["data"][Locale] } {
  return { id: entry.id, data: entry.data[locale] };
}

/**
 * Fails the build on mistakes a hand edit can make but the CMS would not: a
 * file outside its locale folder, two files on one URL or translation key, or
 * shared fields (`shared`) that differ between translations.
 */
export function assertTranslations<
  T extends Translatable & { id: string; data: { paths: string } },
>(entries: T[], shared: (entry: T) => unknown): void {
  const claimed = new Map<string, string>();
  const claim = (key: string, id: string) => {
    const other = claimed.get(key);
    if (other) throw new Error(`${id} and ${other} share the same ${key}`);
    claimed.set(key, id);
  };
  const sharedByKey = new Map<string, { id: string; value: string }>();

  for (const entry of entries) {
    const { locale, translationKey, paths } = entry.data;
    if (!entry.id.startsWith(`${locale}/`)) {
      throw new Error(`${entry.id}: \`locale: ${locale}\` does not match its folder`);
    }
    claim(`${locale} translationKey "${translationKey}"`, entry.id);
    claim(`${locale} URL "${paths}"`, entry.id);

    const value = JSON.stringify(shared(entry));
    const first = sharedByKey.get(translationKey);
    if (!first) {
      sharedByKey.set(translationKey, { id: entry.id, value });
    } else if (first.value !== value) {
      throw new Error(`${entry.id} and ${first.id}: shared fields differ between translations`);
    }
  }
}
