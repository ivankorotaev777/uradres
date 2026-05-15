import { defaultLocale, type Locale } from "@/i18n";
import { MARKETING_STORAGE_KEY, filterMarketingSearchParams } from "@/lib/marketingParams";

export function buildThankYouPath(locale: Locale): string {
  return locale === defaultLocale ? "/thank_you" : `/${locale}/thank_you`;
}

/** Marketing query from sessionStorage or current page URL. */
export function getMarketingQueryString(): string {
  if (typeof window === "undefined") return "";
  const stored = sessionStorage.getItem(MARKETING_STORAGE_KEY);
  if (stored) return stored;
  return filterMarketingSearchParams(window.location.search);
}

export function buildThankYouUrl(locale: Locale): string {
  const path = buildThankYouPath(locale);
  const q = getMarketingQueryString();
  return q ? `${path}?${q}` : path;
}
