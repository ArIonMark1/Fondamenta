import Image from "next/image";
import type { Dictionary } from "@/i18n";
import { site } from "@/lib/site";
import heroImg from "../../public/images/hero-worker.jpg";
import { LogoMark, TagIcon } from "./icons";
import { BoxButton, Lines, Tag } from "./ui";

export function Hero({ t }: { t: Dictionary["hero"] }) {
  return (
    <section className="grid lg:max-h-[900px] lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_440px]">
      {/* Photo + headline */}
      <div className="relative flex min-h-[74svh] items-end overflow-hidden text-white lg:min-h-0">
        {/* LCP image: load immediately with high priority (`priority` is deprecated in Next 16) */}
        <Image
          src={heroImg}
          alt={t.imageAlt}
          fill
          loading="eager"
          fetchPriority="high"
          quality={65}
          placeholder="blur"
          sizes="(min-width: 1280px) calc(100vw - 440px), (min-width: 1024px) calc(100vw - 380px), 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.1)_30%,rgba(0,0,0,.65)_100%),linear-gradient(90deg,rgba(0,0,0,.35),transparent_60%)]" />
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative px-4 pb-36 sm:px-6 lg:px-14 lg:pb-16">
          <p className="mb-5 flex items-center gap-2 font-head text-[15px] font-medium">
            <TagIcon className="text-brand" />
            {t.kicker}
          </p>
          <h1 className="text-[clamp(48px,7.6vw,118px)] leading-[0.9] tracking-[-0.045em]">
            {t.title.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </h1>
        </div>

        <div className="absolute right-0 bottom-0 flex w-full items-center gap-4 bg-brand px-4 py-4 font-head text-[13px] leading-tight font-bold uppercase sm:w-[230px] sm:flex-col sm:items-start sm:gap-2.5 sm:px-[30px] sm:pt-[26px] sm:pb-6">
          <strong className="text-5xl leading-none tracking-[-0.05em] sm:text-[64px]">
            <span data-count-to={site.stats.years}>{site.stats.years}</span>+
          </strong>
          <span><Lines text={t.badge} /></span>
        </div>
      </div>

      {/* Navy side panel */}
      <aside className="flex flex-col items-start bg-navy px-4 py-11 text-white sm:px-6 lg:px-12 lg:py-14">
        <Tag>{t.tag}</Tag>
        <h2 className="mt-3.5 text-[30px] leading-[1.02] tracking-[-0.03em] sm:text-4xl">
          <Lines text={t.sideTitle} />
        </h2>
        <LogoMark className="my-6 h-[120px] w-[150px] fill-brand drop-shadow-[0_18px_40px_rgba(255,106,26,0.25)] lg:m-auto lg:h-[168px] lg:w-[210px] lg:py-0" />
        <p className="mb-7 text-[14.5px] text-white/75">{t.sideText}</p>
        <BoxButton href="#contatti" className="w-full justify-between">{t.sideCta}</BoxButton>
      </aside>
    </section>
  );
}
