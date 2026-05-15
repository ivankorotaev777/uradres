import { defaultLocale, type Locale } from "@/i18n";

const HASH = "#request-form";

/**
 * Localized home URL with optional query string and #request-form hash.
 * Query must be preserved so UTM / gclid are not dropped when scrolling to the form.
 */
export function buildRequestFormHref(locale: Locale, queryWithoutLeadingQuestion: string): string {
  const q = queryWithoutLeadingQuestion.replace(/^\?/, "").trim();
  const suffix = q ? `?${q}${HASH}` : HASH;
  if (locale === defaultLocale) {
    return `/${suffix}`;
  }
  return `/${locale}${suffix}`;
}
