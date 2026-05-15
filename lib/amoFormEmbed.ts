import { filterMarketingSearchParams } from "@/lib/marketingParams";

export const AMO_FORM_ID = "1709794";
export const AMO_FORM_HASH = "439d4bd7e83b262200b687bd7273ad9b";
export const AMO_IFRAME_ELEMENT_ID = `amoforms_iframe_${AMO_FORM_ID}`;

type AmoFormsWindow = Window & {
  amo_forms_params?: { resizeForm?: (id: string) => void };
  amo_forms_loaded?: (cb: (params: { form_id?: number | string }) => void) => void;
};
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

/** Amo sets iframe to opacity:0 until resize; on mobile resize often fires late or not at all. */
export function requestAmoFormResize(): void {
  if (typeof window === "undefined") return;
  (window as AmoFormsWindow).amo_forms_params?.resizeForm?.(AMO_IFRAME_ELEMENT_ID);
}

export function applyAmoIframeVisibilityFallback(): void {
  const iframe = document.getElementById(AMO_IFRAME_ELEMENT_ID) as HTMLIFrameElement | null;
  if (!iframe) return;

  iframe.style.position = "relative";
  iframe.style.display = "block";
  iframe.style.width = "100%";
  iframe.style.maxWidth = "100%";
  iframe.style.right = "auto";
  iframe.style.bottom = "auto";
  iframe.style.zIndex = "auto";

  if (iframe.style.opacity === "0" || !iframe.style.opacity) {
    iframe.style.opacity = "1";
  }

  const heightPx = parseInt(iframe.style.height || "0", 10);
  if (!heightPx || heightPx < 200) {
    iframe.style.minHeight = "min(520px, 85vh)";
  }
}

export function syncAmoFormLayout(): void {
  requestAmoFormResize();
  applyAmoIframeVisibilityFallback();
}

export function mountAmoFormScripts(host: HTMLElement): () => void {
  if (host.querySelector(`#amoforms_script_${AMO_FORM_ID}`)) {
    return () => undefined;
  }

  host.innerHTML = "";

  const inline = document.createElement("script");
  inline.textContent = AMO_FORMS_INIT_SCRIPT;

  const external = document.createElement("script");
  external.id = `amoforms_script_${AMO_FORM_ID}`;
  external.async = true;
  external.charset = "utf-8";
  external.src = AMO_FORMS_SCRIPT_SRC;

  const win = window as AmoFormsWindow;
  const onAmoReady = (params: { form_id?: number | string }) => {
    if (String(params.form_id) !== AMO_FORM_ID) return;
    syncAmoFormLayout();
  };

  external.addEventListener("load", () => {
    win.amo_forms_loaded?.(onAmoReady);
    syncAmoFormLayout();
  });

  host.appendChild(inline);
  host.appendChild(external);

  return () => {
    host.innerHTML = "";
  };
}

export function watchAmoFormLayout(host: HTMLElement | null): () => void {
  if (!host || typeof window === "undefined") return () => undefined;

  const run = () => syncAmoFormLayout();

  run();
  const intervalId = window.setInterval(run, 600);
  const stopIntervalId = window.setTimeout(() => window.clearInterval(intervalId), 20_000);

  window.addEventListener("resize", run);
  window.addEventListener("orientationchange", run);

  const observer = new MutationObserver(run);
  observer.observe(host, { childList: true, subtree: true });

  return () => {
    window.clearInterval(intervalId);
    window.clearTimeout(stopIntervalId);
    window.removeEventListener("resize", run);
    window.removeEventListener("orientationchange", run);
    observer.disconnect();
  };
}
