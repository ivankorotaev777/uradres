/** Query keys we persist for attribution (YouTube UTM, Ads, etc.) */
const MARKETING_KEY =
  /^(utm_(source|medium|campaign|content|term|id)|gclid|fbclid|yclid|wbraid|gbraid|msclkid)$/i;

export const MARKETING_STORAGE_KEY = "uradres_marketing_params_v1";

export function filterMarketingSearchParams(search: string): string {
  const sp = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const out = new URLSearchParams();
  sp.forEach((value, key) => {
    if (MARKETING_KEY.test(key)) out.set(key, value);
  });
  return out.toString();
}

export function searchParamsHaveMarketing(sp: URLSearchParams): boolean {
  for (const key of sp.keys()) {
    if (MARKETING_KEY.test(key)) return true;
  }
  return false;
}

export function isMarketingParamKey(key: string): boolean {
  return MARKETING_KEY.test(key);
}

/** URL marketing params, or last saved values from sessionStorage (client only). */
export function mergeMarketingQuery(urlSearch: string): string {
  const fromUrl = filterMarketingSearchParams(urlSearch);
  if (fromUrl) return fromUrl;
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(MARKETING_STORAGE_KEY) || "";
}

/** Persist marketing params and add them to the address bar if the URL lost them. */
export function persistMarketingQuery(marketingQuery: string): void {
  if (!marketingQuery || typeof window === "undefined") return;
  sessionStorage.setItem(MARKETING_STORAGE_KEY, marketingQuery);

  const fromUrl = filterMarketingSearchParams(window.location.search);
  if (fromUrl) return;

  const url = new URL(window.location.href);
  new URLSearchParams(marketingQuery).forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}
