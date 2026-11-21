import type { Dictionary, Locale } from "@/i18n";
import { site } from "@/lib/site";
import { ContactForm } from "./ContactForm";
import { Lines, Tag } from "./ui";

export function Contact({ t, form, lang }: { t: Dictionary["contact"]; form: Dictionary["form"]; lang: Locale }) {
  const rows = [
    { label: t.phoneLabel, value: site.phone, href: site.phoneHref },
    { label: t.emailLabel, value: site.email, href: `mailto:${site.email}` },
    { label: t.areaLabel, value: t.area },
  ];

  return (
    <section id="contatti" className="bg-navy py-20 text-white lg:py-[120px]">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <Tag className="reveal">{t.tag}</Tag>
          <h2 className="h2 reveal"><Lines text={t.title} /></h2>
          <p className="reveal mt-6 max-w-[420px] text-white/75">{t.text}</p>
          <ul className="reveal mt-11 grid gap-[22px]">
            {rows.map((r) => (
              <li key={r.label} className="flex flex-col border-l-[3px] border-brand pl-[18px]">
                <small className="text-xs tracking-[0.12em] text-white/55 uppercase">{r.label}</small>
                {r.href ? (
                  <a href={r.href} className="font-head text-[17px] font-medium break-words hover:text-brand sm:text-xl">{r.value}</a>
                ) : (
                  <span className="font-head text-[17px] font-medium sm:text-xl">{r.value}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <ContactForm t={form} lang={lang} />
      </div>
    </section>
  );
}
