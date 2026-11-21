"use client";

import { useId, useState } from "react";

type Item = { title: string; text: string };

export function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();

  return (
    <div className="mt-10">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.title} className={`border-b transition-colors ${isOpen ? "border-brand" : "border-line"}`}>
            <button
              type="button"
              id={`${id}-b${i}`}
              aria-expanded={isOpen}
              aria-controls={`${id}-p${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full cursor-pointer items-center gap-3.5 py-5 text-left font-head text-[19px] font-medium"
            >
              <svg viewBox="0 0 16 16" className={`size-4 flex-none text-brand transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`} aria-hidden>
                <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              {item.title}
            </button>
            <div
              id={`${id}-p${i}`}
              role="region"
              aria-labelledby={`${id}-b${i}`}
              className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <p className={`overflow-hidden pl-[30px] text-[15px] text-muted ${isOpen ? "pb-[22px]" : ""}`}>{item.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
