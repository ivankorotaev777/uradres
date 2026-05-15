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
