"use client";

import { memo, useLayoutEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  AMO_FORM_CARD_MAX_WIDTH_PX,
  AMO_FORM_CARD_MIN_HEIGHT_PX,
  AMO_FORM_HASH,
  AMO_FORM_ID,
  AMO_FORMS_SCRIPT_VERSION,
  buildAmoFormsInitScriptContent,
  clearAmoHost,
  removeStaleAmoDomForKnownForms,
  resetAmoWindowState,
  watchAmoFormLayout,
} from "@/lib/amoFormEmbed";
import { mergeMarketingQuery } from "@/lib/marketingParams";
import { cn } from "@/lib/utils";

type AmoFormEmbedProps = {
  className?: string;
  formId?: string;
  formHash?: string;
  amoScriptVersion?: string;
  /** UTM etc.; not in memo compare — remount via `key={locale}` when language changes. */
  marketingQuery?: string;
  "aria-label"?: string;
};

function AmoFormEmbedInner({
  className,
  formId = AMO_FORM_ID,
  formHash = AMO_FORM_HASH,
  amoScriptVersion = AMO_FORMS_SCRIPT_VERSION,
  marketingQuery: marketingQueryProp,
  "aria-label": ariaLabel,
}: AmoFormEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const marketingQuery =
    marketingQueryProp ?? mergeMarketingQuery(searchParams.toString());

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    resetAmoWindowState();
    removeStaleAmoDomForKnownForms();
    clearAmoHost(root);

    const init = document.createElement("script");
    init.type = "text/javascript";
    init.setAttribute("data-uradres-amo", "1");
    init.textContent = buildAmoFormsInitScriptContent(marketingQuery);

    const loader = document.createElement("script");
    loader.id = `amoforms_script_${formId}`;
    loader.async = true;
    loader.charset = "utf-8";
    loader.setAttribute("data-uradres-amo", "1");
    loader.src = `https://forms.amocrm.ru/forms/assets/js/amoforms.js?${amoScriptVersion}`;

    root.appendChild(init);
    root.appendChild(loader);

    const unwatchLayout = watchAmoFormLayout(root);

    return () => {
      unwatchLayout();
      clearAmoHost(root);
      document.getElementById(`amoforms_overlay_${formId}`)?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount via key={locale}; avoid UTM replaceState teardown
  }, [formId, formHash, amoScriptVersion]);

  return (
    <div
      ref={containerRef}
      data-uradres-amo-host
      className={cn(
        "amo-form-host amo-form-embed mx-auto w-full max-w-full flex flex-col items-center justify-center",
        className
      )}
      style={{
        maxWidth: AMO_FORM_CARD_MAX_WIDTH_PX,
        minHeight: AMO_FORM_CARD_MIN_HEIGHT_PX,
      }}
      aria-label={ariaLabel}
    />
  );
}

function propsEqual(a: AmoFormEmbedProps, b: AmoFormEmbedProps) {
  return (
    a.formId === b.formId &&
    a.formHash === b.formHash &&
    a.amoScriptVersion === b.amoScriptVersion &&
    a.className === b.className
  );
}

export const AmoFormEmbed = memo(AmoFormEmbedInner, propsEqual);
