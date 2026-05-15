"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildRequestFormHref } from "@/lib/requestFormHref";
import {
  filterMarketingSearchParams,
  mergeMarketingQuery,
  persistMarketingQuery,
} from "@/lib/marketingParams";

/** Use inside a `<Suspense>` boundary (required by Next.js for `useSearchParams`). */
export function useRequestFormHref(): string {
  const searchParams = useSearchParams();
  const fromUrl = filterMarketingSearchParams(searchParams.toString());

  const [href, setHref] = useState(() => buildRequestFormHref(fromUrl));

  useEffect(() => {
    const marketing = mergeMarketingQuery(searchParams.toString());
    if (marketing) persistMarketingQuery(marketing);
    setHref(buildRequestFormHref(marketing));
  }, [searchParams]);

  return href;
}
