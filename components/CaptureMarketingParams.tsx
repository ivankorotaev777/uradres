"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  filterMarketingSearchParams,
  persistMarketingQuery,
  searchParamsHaveMarketing,
} from "@/lib/marketingParams";

/** Persists utm/gclid etc. from the URL so thank-you redirect from Amo can restore them. */
export function CaptureMarketingParams() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParamsHaveMarketing(searchParams)) return;
    const filtered = filterMarketingSearchParams(searchParams.toString());
    if (filtered) persistMarketingQuery(filtered);
  }, [searchParams]);

  return null;
}
