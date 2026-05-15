"use client";

import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { buildRequestFormHref } from "@/lib/requestFormHref";
import type { Locale } from "@/i18n";

/** Use inside a `<Suspense>` boundary (required by Next.js for `useSearchParams`). */
export function useRequestFormHref(): string {
  const locale = useLocale() as Locale;
  const searchParams = useSearchParams();
  return buildRequestFormHref(locale, searchParams.toString());
}
