"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import type { Dictionary } from "@/i18n";
import { ArrowIcon } from "./icons";
import { DemoBadge } from "./ui";

export type BeforeAfterCard = {
  id: string;
  title: string;
  location: string;
  before: StaticImageData;
  after: StaticImageData;
  demo?: boolean;
};

const imgSizes = "(min-width: 1200px) 1136px, calc(100vw - 32px)";
const labelCls = "pointer-events-none absolute top-4 bg-navy-deep/80 px-3 py-1.5 font-head text-xs font-bold tracking-[0.12em] text-white uppercase";

/**
 * Before/after comparison. A transparent <input type="range"> covers the photos,
 * so dragging, clicking, touch, arrow keys and screen readers all work natively;
 * its value is how much of the "before" photo is visible from the left.
 */
type Props = { pairs: BeforeAfterCard[]; t: Dictionary["beforeAfter"]; demoLabel: string };

export function BeforeAfterSlider({ pairs, t, demoLabel }: Props) {
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState(50);
  const pair = pairs[index] ?? pairs[0];

  return (
    <div className="reveal">
      {pairs.length > 1 && (
        <div role="group" aria-label={t.choose} className="mb-7 flex flex-wrap gap-2.5">
          {pairs.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={i === index}
              onClick={() => {
                setIndex(i);
                setPos(50);
              }}
              className={`cursor-pointer border px-4 py-2.5 text-left font-head text-[13px] font-bold tracking-[0.04em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                i === index ? "border-brand bg-brand text-white" : "border-white/30 text-white hover:border-brand"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      <figure>
        <div className="relative aspect-[4/3] overflow-hidden bg-navy-deep outline-offset-4 outline-brand select-none has-[input:focus-visible]:outline-2 sm:aspect-[16/9]">
          <Image key={`${pair.id}-after`} src={pair.after} alt={`${t.after}: ${pair.title}`} fill quality={65} placeholder="blur" sizes={imgSizes} className="object-cover" />
          {/* "Before" photo on top, cut off at the slider position. */}
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Image key={`${pair.id}-before`} src={pair.before} alt={`${t.before}: ${pair.title}`} fill quality={65} placeholder="blur" sizes={imgSizes} className="object-cover" />
          </div>

          <span className={`${labelCls} left-4`}>{t.before}</span>
          <span className={`${labelCls} right-4`}>{t.after}</span>
          {pair.demo && <DemoBadge label={demoLabel} className="absolute bottom-4 left-4" />}

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label={`${t.slider}: ${pair.title}`}
            aria-valuetext={`${t.before} ${pos}% · ${t.after} ${100 - pos}%`}
            className="absolute inset-0 z-10 m-0 size-full cursor-ew-resize touch-pan-y opacity-0"
          />
          {/* Divider + handle (decorative; the range input above does the work). */}
          <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white" style={{ left: `${pos}%` }} aria-hidden>
            <span className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-brand text-white shadow-lg">
              <ArrowIcon className="size-3.5 rotate-180" />
              <ArrowIcon className="size-3.5" />
            </span>
          </div>
        </div>
        <figcaption className="mt-4 flex flex-wrap justify-between gap-2 text-sm text-white/70">
          <span className="font-head font-medium text-white">{pair.title}</span>
          <span>{pair.location}</span>
        </figcaption>
      </figure>
    </div>
  );
}
