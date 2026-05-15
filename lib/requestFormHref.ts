const HASH = "request-form";

/**
 * Path for next-intl `Link` (locale prefix is added automatically).
 * Preserves marketing query before the hash so UTMs are not lost.
 */
export function buildRequestFormHref(queryWithoutLeadingQuestion: string): string {
  const q = queryWithoutLeadingQuestion.replace(/^\?/, "").trim();
  if (q) {
    return `/?${q}#${HASH}`;
  }
  return `/#${HASH}`;
}
