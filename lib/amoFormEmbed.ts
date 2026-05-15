import { filterMarketingSearchParams } from "@/lib/marketingParams";

export const AMO_FORM_ID = "1709794";
export const AMO_FORM_HASH = "439d4bd7e83b262200b687bd7273ad9b";
export const AMO_FORMS_SCRIPT_SRC =
  "https://forms.amocrm.ru/forms/assets/js/amoforms.js?1778820784";

export const AMO_FORMS_INIT_SCRIPT = `!function(a,m,o,c,r,m){a[o+c]=a[o+c]||{setMeta:function(p){this.params=(this.params||[]).concat([p])}},a[o+r]=a[o+r]||function(f){a[o+r].f=(a[o+r].f||[]).concat([f])},a[o+r]({id:"${AMO_FORM_ID}",hash:"${AMO_FORM_HASH}",locale:"ru"}),a[o+m]=a[o+m]||function(f,k){a[o+m].f=(a[o+m].f||[]).concat([[f,k]])}}(window,0,"amo_forms_","params","load","loaded");`;

/** Params Amo expects in iframe location.hash (see amoforms.js loader). */
export function buildAmoIframeHashParams(pageUrl: string, marketingQuery: string) {
  const utm: Record<string, string> = {};
  if (marketingQuery) {
    new URLSearchParams(marketingQuery).forEach((value, key) => {
      const m = key.match(/^utm_(.+)$/);
      if (m) utm[m[1]] = value;
    });
  }

  return {
    form_id: AMO_FORM_ID,
    form_hash: AMO_FORM_HASH,
    location: pageUrl,
    has_redirect: "true",
    success_message: encodeURI("Благодарим за заполнение формы!"),
    is_modal: false,
    utm,
    ga: {},
    user_origin: {
      datetime: new Date().toString(),
    },
  };
}

export function buildAmoIframeSrc(pageUrl: string, marketingQuery: string): string {
  const base = `https://forms.amocrm.ru/forms/html/form_${AMO_FORM_ID}_${AMO_FORM_HASH}.html`;
  const q = new URLSearchParams();
  q.set("date", String(Math.floor(Date.now() / 1000)));
  if (marketingQuery) {
    new URLSearchParams(marketingQuery).forEach((value, key) => {
      q.set(key, value);
    });
  }
  const hash = encodeURIComponent(
    JSON.stringify(buildAmoIframeHashParams(pageUrl, marketingQuery))
  );
  return `${base}?${q.toString()}#${hash}`;
}

export function getPageUrlForAmo(): string {
  if (typeof window === "undefined") return "https://www.uradres.uz/";
  return `${window.location.origin}${window.location.pathname}`;
}

export function getMarketingQueryFromBrowser(): string {
  if (typeof window === "undefined") return "";
  return filterMarketingSearchParams(window.location.search);
}
