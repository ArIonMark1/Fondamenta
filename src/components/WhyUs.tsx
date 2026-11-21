import Image from "next/image";
import type { Dictionary } from "@/i18n";
import villaImg from "../../public/images/villa.jpg";
import { Accordion } from "./Accordion";
import { Lines, Tag } from "./ui";

export function WhyUs({ t }: { t: Dictionary["why"] }) {
  return (
    <section className="pb-20 lg:pt-10 lg:pb-[120px]">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="reveal relative mr-[18px] max-w-[480px] lg:max-w-none">
          <svg viewBox="0 0 200 260" className="absolute top-[12%] -left-[60px] hidden w-[70%] text-line lg:block" aria-hidden>
            <path d="M100 10 190 250H10z" fill="none" stroke="currentColor" />
            <path d="M100 70 160 230H40z" fill="none" stroke="currentColor" />
          </svg>
          <div className="absolute -right-[18px] -bottom-[18px] h-[38%] w-[42%] bg-brand" aria-hidden />
          <div className="relative aspect-[4/5] bg-mist">
            <Image
              src={villaImg}
              alt={t.imageAlt}
              fill
              quality={65}
              placeholder="blur"
              sizes="(min-width: 1024px) 530px, (min-width: 520px) 480px, calc(100vw - 50px)"
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <Tag className="reveal">{t.tag}</Tag>
          <h2 className="h2 reveal"><Lines text={t.title} /></h2>
          <div className="reveal">
            <Accordion items={t.items} />
          </div>
        </div>
      </div>
    </section>
  );
}
