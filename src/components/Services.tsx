import type { Dictionary } from "@/i18n";
import { serviceIcons } from "./icons";
import { BoxButton, Lines, Tag } from "./ui";

export function Services({ t }: { t: Dictionary["services"] }) {
  return (
    <section id="servizi" className="bg-navy py-20 text-white lg:py-[120px]">
      <div className="container-x">
        <div className="mb-14 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Tag className="reveal">{t.tag}</Tag>
            <h2 className="h2 reveal"><Lines text={t.title} /></h2>
          </div>
          <BoxButton href="#contatti" className="reveal">{t.cta}</BoxButton>
        </div>

        <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {t.items.map((item, i) => {
            const Icon = serviceIcons[i];
            return (
              <article
                key={item.title}
                className="group reveal relative border border-white/15 px-[26px] pt-[30px] pb-[90px] transition duration-300 hover:-translate-y-1.5 hover:border-brand hover:bg-brand sm:min-h-[330px]"
              >
                <h3 className="mb-[18px] text-[21px] leading-[1.1] tracking-[-0.02em]"><Lines text={item.title} /></h3>
                <p className="text-sm text-white/70 transition-colors group-hover:text-white/95">{item.text}</p>
                <span className="absolute -bottom-px -left-px grid size-[58px] place-items-center bg-brand transition-colors duration-300 group-hover:bg-navy">
                  <Icon className="size-[30px] text-white" />
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
