"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import type { Dictionary } from "@/i18n";
import type { PortfolioCategory } from "@/content/showcase";
import { ArrowIcon } from "./icons";
import { QuoteLink } from "./QuoteLink";
import { DemoBadge } from "./ui";

/** A project with its texts already in the page language (prepared on the server). */
export type ProjectCard = {
  id: string;
  category: PortfolioCategory;
  title: string;
  location: string;
  year: number;
  summary: string;
  image: StaticImageData;
  demo?: boolean;
};

type Props = {
  projects: ProjectCard[];
  /** Filter order; only categories that have projects get a button. */
  categories: readonly PortfolioCategory[];
  t: Dictionary["portfolio"];
};

const chipCls =
  "cursor-pointer border px-4 py-2.5 font-head text-[13px] font-bold tracking-[0.04em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/**
 * Filterable project grid. The filter is local state (not a URL param), so the
 * page around it stays statically prerendered.
 */
export function ProjectGrid({ projects, categories, t }: Props) {
  const [active, setActive] = useState<PortfolioCategory | "all">("all");
  const available = categories.filter((c) => projects.some((p) => p.category === c));
  const shown = active === "all" ? projects : projects.filter((p) => p.category === active);

  const chip = (value: PortfolioCategory | "all", label: string) => (
    <button
      key={value}
      type="button"
      aria-pressed={active === value}
      onClick={() => setActive(value)}
      className={`${chipCls} ${
        active === value ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:border-brand hover:text-brand"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="reveal">
      {available.length > 1 && (
        <div role="group" aria-label={t.filterLabel} className="mb-9 flex flex-wrap gap-2.5">
          {chip("all", t.all)}
          {available.map((c) => chip(c, t.categories[c]))}
        </div>
      )}
      <p className="sr-only" aria-live="polite">{`${t.shown} ${shown.length}`}</p>

      <ul className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <li key={p.id} data-category={p.category} className="group flex flex-col bg-surface shadow-[0_6px_30px_var(--color-shadow)]">
            <div className="relative aspect-[4/3] overflow-hidden bg-mist">
              <Image
                src={p.image}
                alt={p.title}
                fill
                quality={65}
                placeholder="blur"
                sizes="(min-width: 1200px) 376px, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, calc(100vw - 32px)"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-0 left-0 bg-brand px-3 py-1.5 font-head text-[11px] font-bold tracking-[0.1em] text-white uppercase">
                {t.categories[p.category]}
              </span>
              {p.demo && <DemoBadge label={t.demo} className="absolute top-2 right-2" />}
            </div>
            <div className="flex flex-1 flex-col px-6 pt-6 pb-7">
              <p className="text-xs font-semibold tracking-[0.1em] text-muted uppercase">
                {p.location} · {p.year}
              </p>
              <h3 className="mt-2 text-[21px] leading-[1.15] tracking-[-0.02em]">{p.title}</h3>
              <p className="mt-3 text-sm text-muted">{p.summary}</p>
              <QuoteLink
                workType={p.category}
                className="mt-auto inline-flex items-center gap-2 pt-6 font-head text-[13px] font-bold tracking-[0.04em] text-brand uppercase hover:text-brand-dark"
              >
                {t.cta}
                <ArrowIcon className="size-4" />
              </QuoteLink>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
