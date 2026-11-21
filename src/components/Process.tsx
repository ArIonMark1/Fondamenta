import Image from "next/image";
import type { Dictionary } from "@/i18n";
import blueprintsImg from "../../public/images/blueprints.jpg";
import { ArrowIcon } from "./icons";
import { Lines, Tag } from "./ui";

export function Process({ t }: { t: Dictionary["process"] }) {
  return (
    <section id="metodo" className="py-20 lg:py-[120px]">
      <div className="container-x max-w-[1000px]">
        <Tag className="reveal flex justify-center">{t.tag}</Tag>
        <h2 className="h2 reveal text-center"><Lines text={t.title} /></h2>

        <ol className="mt-14 grid gap-3.5">
          {t.steps.map((step, i) => (
            <li
              key={step.title}
              className="group reveal relative grid grid-cols-[48px_1fr_44px] items-center gap-x-4 gap-y-2 overflow-hidden bg-mist px-5 py-6 transition-colors duration-300 hover:text-white md:grid-cols-[64px_1fr_1.3fr_52px] md:gap-6 md:px-8 md:py-[30px]"
            >
              {/* Hover background photo */}
              <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden>
                {/* Dimmed behind a dark overlay, so low quality is invisible */}
                <Image
                  src={blueprintsImg}
                  alt=""
                  fill
                  quality={50}
                  sizes="(min-width: 1000px) 936px, calc(100vw - 32px)"
                  className="object-cover"
                />
                <span className="absolute inset-0 bg-linear-to-r from-navy/92 to-navy/55" />
              </span>

              <span className="relative font-head text-[26px] font-medium text-brand">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="relative text-[22px] leading-[1.1] tracking-[-0.02em] uppercase">{step.title}</h3>
              <p className="relative col-start-2 row-start-2 text-sm text-muted transition-colors group-hover:text-white/80 md:col-start-3 md:row-start-1">
                {step.text}
              </p>
              <span className="relative col-start-3 row-span-2 row-start-1 grid size-11 place-items-center justify-self-end border border-current md:col-start-4 md:row-span-1">
                <ArrowIcon className="size-[18px]" />
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
