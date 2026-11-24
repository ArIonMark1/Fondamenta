"use client";

import { useState } from "react";
import type { Dictionary, Locale } from "@/i18n";
import { site } from "@/lib/site";
import { ArrowIcon, PinIcon } from "./icons";

type Props = { t: Dictionary["contact"]; lang: Locale };

const linkCls = "inline-flex items-center gap-1.5 font-head text-[11px] font-bold tracking-[0.06em] uppercase hover:text-brand";

/**
 * Small Google Map of the office (footer), loaded only when the visitor asks for it:
 * the embed sets Google cookies (needs consent under GDPR) and weighs ~0.5 MB, so the
 * page itself stays fast and cookie-free. No API key needed.
 */
export function LocationMap({ t, lang }: Props) {
  const [loaded, setLoaded] = useState(false);
  const src = `https://www.google.com/maps?q=${encodeURIComponent(site.mapsQuery)}&hl=${lang}&z=15&output=embed`;

  return (
    <div>
      {/* Card styled like the Google rating card in "Recensioni": surface, soft shadow, orange edge. */}
      <div className="relative aspect-[16/10] overflow-hidden border-l-[3px] border-brand bg-surface shadow-[0_6px_30px_var(--color-shadow)]">
        {loaded ? (
          <iframe
            src={src}
            title={t.mapTitle}
            className="absolute inset-0 size-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
            <span className="grid size-10 place-items-center bg-brand text-white">
              <PinIcon className="size-5" />
            </span>
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="cursor-pointer border border-line px-4 py-2.5 font-head text-xs font-bold tracking-[0.06em] text-ink uppercase transition-colors hover:border-brand hover:bg-brand hover:text-white"
            >
              {t.mapShow}
            </button>
            <small className="max-w-[260px] text-[11px] leading-snug text-muted">{t.mapNote}</small>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-ink">
        <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
          {t.mapOpen} <ArrowIcon className="size-3" />
        </a>
        <a href={site.directionsUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
          {t.mapDirections} <ArrowIcon className="size-3" />
        </a>
      </div>
    </div>
  );
}
