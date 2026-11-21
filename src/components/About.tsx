import Image from "next/image";
import type { Dictionary } from "@/i18n";
import { site } from "@/lib/site";
import teamImg from "../../public/images/site-team.jpg";
import houseImg from "../../public/images/modern-house.jpg";
import { Lines, Tag } from "./ui";

function Stat({ value, suffix, label, className }: { value: number; suffix: string; label: string; className: string }) {
  return (
    <div className={`reveal flex min-h-[170px] flex-col justify-between px-7 py-[26px] font-head md:min-h-[200px] ${className}`}>
      <span className="text-[13px] leading-tight font-bold tracking-[0.02em] uppercase"><Lines text={label} /></span>
      <strong className="text-[clamp(54px,5.6vw,80px)] leading-none font-bold tracking-[-0.06em]">
        <span data-count-to={value}>{value}</span>{suffix}
      </strong>
    </div>
  );
}

export function About({ t }: { t: Dictionary["about"] }) {
  return (
    <section id="chi-siamo" className="py-20 lg:py-[120px]">
      <div className="container-x">
        <Tag className="reveal">{t.tag}</Tag>
        <h2 className="h2 reveal max-w-[900px]"><Lines text={t.title} /></h2>
        <div className="reveal mt-9 grid max-w-[980px] gap-5 md:grid-cols-2 md:gap-16">
          <p className="text-lg">{t.lead}</p>
          <p className="text-[15px] text-muted">{t.text}</p>
        </div>

        <div className="mt-16 grid gap-3.5 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:grid-rows-[250px_250px]">
          <div className="reveal relative min-h-[300px] bg-mist md:col-span-2 lg:col-span-1 lg:row-span-2">
            <Image
              src={teamImg}
              alt={t.photoAlt}
              fill
              quality={65}
              placeholder="blur"
              sizes="(min-width: 1024px) 480px, (min-width: 640px) calc(100vw - 64px), calc(100vw - 32px)"
              className="object-cover"
            />
          </div>
          <Stat value={site.stats.projects} suffix="+" label={t.stats.projects} className="bg-navy text-white" />
          <Stat value={site.stats.clients} suffix="%" label={t.stats.clients} className="bg-mist" />
          <Stat value={site.stats.years} suffix="+" label={t.stats.years} className="bg-brand text-white" />
          <div className="reveal relative min-h-[220px] bg-mist">
            <Image
              src={houseImg}
              alt={t.houseAlt}
              fill
              quality={65}
              placeholder="blur"
              sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, calc(100vw - 32px)"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
