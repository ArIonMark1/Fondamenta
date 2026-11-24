"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowIcon } from "./icons";

type Props = { children: ReactNode; label: string; prevLabel: string; nextLabel: string };

const btnCls =
  "grid size-12 cursor-pointer place-items-center border border-line bg-surface text-ink shadow-[0_6px_30px_var(--color-shadow)] transition-colors hover:border-brand hover:bg-brand hover:text-white disabled:cursor-default disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-surface disabled:hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/**
 * Horizontal slideshow for the review cards (rendered on the server and passed as <li> children).
 * Native scrolling with snap points: swipe / trackpad / arrow keys work without JS; the ← →
 * buttons move by one card and only show up when the cards don't all fit.
 */
export function ReviewsCarousel({ children, label, prevLabel, nextLabel }: Props) {
  const trackId = useId();
  const trackRef = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ overflow: false, atStart: true, atEnd: false });

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () =>
      setPos({
        overflow: el.scrollWidth > el.clientWidth + 1,
        atStart: el.scrollLeft <= 1,
        atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const scrollByCard = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = card ? card.offsetWidth + gap : el.clientWidth;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="reveal" role="region" aria-roledescription="carousel" aria-label={label}>
      {/* Padding + negative margin so the cards' shadows aren't clipped by the scroll box;
          the mask fades cards out inside that padding instead of cutting them off sharply. */}
      <ul
        id={trackId}
        ref={trackRef}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-[18px] overflow-x-auto px-4 pt-2 pb-10 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [mask-image:linear-gradient(90deg,transparent,#000_16px,#000_calc(100%-16px),transparent)] sm:-mx-8 sm:scroll-px-8 sm:px-8 sm:[mask-image:linear-gradient(90deg,transparent,#000_32px,#000_calc(100%-32px),transparent)] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      {pos.overflow && (
        <div className="-mt-4 flex justify-end gap-2.5">
          <button type="button" aria-label={prevLabel} aria-controls={trackId} disabled={pos.atStart} onClick={() => scrollByCard(-1)} className={btnCls}>
            <ArrowIcon className="size-[18px] rotate-180" />
          </button>
          <button type="button" aria-label={nextLabel} aria-controls={trackId} disabled={pos.atEnd} onClick={() => scrollByCard(1)} className={btnCls}>
            <ArrowIcon className="size-[18px]" />
          </button>
        </div>
      )}
    </div>
  );
}
