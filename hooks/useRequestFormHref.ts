"use client";

import { useSearchParams } from "next/navigation";
import { buildRequestFormHref } from "@/lib/requestFormHref";

/** Use inside a `<Suspense>` boundary (required by Next.js for `useSearchParams`). */
export function useRequestFormHref(): string {
  const searchParams = useSearchParams();
  return buildRequestFormHref(searchParams.toString());
}
