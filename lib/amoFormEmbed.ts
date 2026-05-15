import { filterMarketingSearchParams } from "@/lib/marketingParams";

export const AMO_FORM_ID = "1709794";
export const AMO_FORM_HASH = "439d4bd7e83b262200b687bd7273ad9b";
export const AMO_IFRAME_ELEMENT_ID = `amoforms_iframe_${AMO_FORM_ID}`;
export const AMO_FORM_ORIGIN = "https://forms.amocrm.ru";
/** Vertical padding inside the form card (~0.5 cm). */
export const AMO_FORM_CONTAINER_PADDING_Y = "0.5cm";
/** Layout tuning vs original 512×900 card. */
export const AMO_FORM_HEIGHT_MULTIPLIER = 1.3;
export const AMO_FORM_WIDTH_MULTIPLIER = 0.8;
export const AMO_FORM_CARD_MIN_HEIGHT_PX = Math.round(512 * AMO_FORM_HEIGHT_MULTIPLIER);
export const AMO_FORM_CARD_MAX_WIDTH_PX = Math.round(900 * AMO_FORM_WIDTH_MULTIPLIER);

type AmoFormsWindow = Window & {
  amo_forms_params?: { resizeForm?: (id: string) => void };
  amo_forms_loaded?: (cb: (params: { form_id?: number | string }) => void) => void;
};
export const AMO_FORMS_SCRIPT_VERSION = "1778863550";
export const AMO_FORMS_SCRIPT_SRC =
  `https://forms.amocrm.ru/forms/assets/js/amoforms.js?${AMO_FORMS_SCRIPT_VERSION}`;

export const AMO_FORMS_INIT_SCRIPT = `!function(a,m,o,c,r,m){a[o+c]=a[o+c]||{setMeta:function(p){this.params=(this.params||[]).concat([p])}},a[o+r]=a[o+r]||function(f){a[o+r].f=(a[o+r].f||[]).concat([f])},a[o+r]({id:"${AMO_FORM_ID}",hash:"${AMO_FORM_HASH}",locale:"ru"}),a[o+m]=a[o+m]||function(f,k){a[o+m].f=(a[o+m].f||[]).concat([[f,k]])}}(window,0,"amo_forms_","params","load","loaded");`;

function buildAmoUserOrigin(pageUrl: string) {
  if (typeof window === "undefined") {
    return {
      datetime: new Date().toUTCString(),
      timezone: "UTC",
      referer: pageUrl,
    };
  }
  return {
    datetime: `${new Date().toDateString()} ${new Date().toTimeString()}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referer: document.referrer || pageUrl,
  };
}

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
    is_modal: false,
    success_message: encodeURI("Благодарим за заполнение формы!"),
    utm,
    ga: {},
    user_origin: buildAmoUserOrigin(pageUrl),
  };
}

export function buildAmoIframeSrc(pageUrl: string, marketingQuery: string): string {
  const base = `https://forms.amocrm.ru/forms/html/form_${AMO_FORM_ID}_${AMO_FORM_HASH}.html`;
  const q = new URLSearchParams();
  q.set("date", String(Math.floor(Date.now() / 1000)));
  // UTMs belong in the hash only; extra query params can break Amo validation.
  const hash = JSON.stringify(buildAmoIframeHashParams(pageUrl, marketingQuery));
  return `${base}?${q.toString()}#${hash}`;
}

export type AmoFormSubmitResult = "success" | "fail";

/** Detect success/fail from iframe postMessage (official Amo events or API-shaped payloads). */
export function getAmoFormSubmitResult(data: unknown): AmoFormSubmitResult | null {
  const payload = parseAmoPostMessage(data);
  if (payload) {
    if (payload.func === "amoformsSuccessSubmit") return "success";
    if (payload.func === "amoformsFailSubmit") return "fail";
    if (payload.error_code === 0) return "success";
    if (typeof payload.error_code === "number" && payload.error_code !== 0) return "fail";
  }

  if (data == null) return null;
  const raw = typeof data === "string" ? data : JSON.stringify(data);
  if (raw.includes("amoformsSuccessSubmit") && raw.includes(AMO_FORM_ID)) return "success";
  if (raw.includes("amoformsFailSubmit")) return "fail";
  return null;
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

export function parseAmoPostMessage(data: unknown): Record<string, unknown> | null {
  let parsed: unknown = data;
  if (typeof data === "string") {
    try {
      parsed = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object" || !("func" in parsed)) return null;
  return parsed as Record<string, unknown>;
}

/** Height Amo reports for the inline iframe (px). */
export function getAmoResizeHeight(message: Record<string, unknown> | null): number | null {
  if (!message || message.func !== "resizeForm") return null;
  if (message.iframe_id !== AMO_IFRAME_ELEMENT_ID) return null;
  const height = Number(message.height);
  return height > 0 ? height : null;
}

/** Content height for iframe/card (px), scaled +30% so fields are not clipped. */
export function resolveAmoFormContentHeight(heightPx: number): number {
  const scaled = Math.ceil(heightPx * AMO_FORM_HEIGHT_MULTIPLIER);
  return Math.max(AMO_FORM_CARD_MIN_HEIGHT_PX, scaled);
}

export function applyAmoFormResize(heightPx: number): void {
  const iframe = document.getElementById(AMO_IFRAME_ELEMENT_ID) as HTMLIFrameElement | null;
  if (!iframe) return;

  const contentHeight = resolveAmoFormContentHeight(heightPx);

  // Iframe needs an explicit height from Amo; min-height alone leaves ~150px viewport.
  iframe.style.height = `${contentHeight}px`;
  iframe.style.minHeight = `${contentHeight}px`;
  iframe.style.maxHeight = "none";
  iframe.style.width = "100%";
  iframe.style.maxWidth = "100%";
  iframe.style.marginLeft = "auto";
  iframe.style.marginRight = "auto";
  iframe.style.display = "block";
  iframe.style.position = "relative";
  iframe.style.opacity = "1";
  iframe.style.overflow = "hidden";
  iframe.setAttribute("scrolling", "no");
}

export function applyAmoIframeVisibilityFallback(): void {
  const iframe = document.getElementById(AMO_IFRAME_ELEMENT_ID) as HTMLIFrameElement | null;
  if (!iframe) return;

  iframe.style.right = "auto";
  iframe.style.bottom = "auto";
  iframe.style.zIndex = "auto";

  if (iframe.style.opacity === "0") {
    iframe.style.opacity = "1";
  }
}

export function syncAmoFormLayout(): void {
  requestAmoFormResize();
  applyAmoIframeVisibilityFallback();
}

/** Move iframe into embed host if Amo inserted it elsewhere (e.g. body). */
export function ensureAmoIframeInHost(host: HTMLElement): void {
  const iframe = document.getElementById(AMO_IFRAME_ELEMENT_ID);
  if (!iframe || iframe.parentElement === host) return;
  const script = host.querySelector(`#amoforms_script_${AMO_FORM_ID}`);
  host.insertBefore(iframe, script ?? null);
  syncAmoFormLayout();
}

/** Official Amo embed: init + amoforms.js (same as pasted snippet from AmoCRM). */
export function mountAmoFormScripts(host: HTMLElement): () => void {
  const existingScript = host.querySelector(`#amoforms_script_${AMO_FORM_ID}`);
  if (existingScript) {
    ensureAmoIframeInHost(host);
    syncAmoFormLayout();
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
    ensureAmoIframeInHost(host);
    syncAmoFormLayout();
  };

  external.addEventListener("load", () => {
    win.amo_forms_loaded?.(onAmoReady);
    ensureAmoIframeInHost(host);
    syncAmoFormLayout();
  });

  host.appendChild(inline);
  host.appendChild(external);

  const relocateId = window.setInterval(() => ensureAmoIframeInHost(host), 500);
  const stopRelocateId = window.setTimeout(() => window.clearInterval(relocateId), 20_000);

  return () => {
    window.clearInterval(relocateId);
    window.clearTimeout(stopRelocateId);
    host.innerHTML = "";
    document.getElementById(AMO_IFRAME_ELEMENT_ID)?.remove();
  };
}

export function watchAmoFormLayout(
  host: HTMLElement | null,
  onResize?: (heightPx: number) => void
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== AMO_FORM_ORIGIN) return;
    const payload = parseAmoPostMessage(event.data);
    const height = getAmoResizeHeight(payload);
    if (height == null) return;
    applyAmoFormResize(height);
    onResize?.(resolveAmoFormContentHeight(height));
  };

  window.addEventListener("message", onMessage);

  const run = () => syncAmoFormLayout();
  run();

  if (host) {
    const intervalId = window.setInterval(run, 800);
    const stopIntervalId = window.setTimeout(() => window.clearInterval(intervalId), 15_000);
    window.addEventListener("resize", run);
    window.addEventListener("orientationchange", run);

    const observer = new MutationObserver(run);
    observer.observe(host, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(intervalId);
      window.clearTimeout(stopIntervalId);
      window.removeEventListener("resize", run);
      window.removeEventListener("orientationchange", run);
      observer.disconnect();
    };
  }

  return () => window.removeEventListener("message", onMessage);
}
