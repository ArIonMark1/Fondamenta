import type { Dictionary, Locale } from "@/i18n";
import { getBeforeAfter } from "@/content/showcase";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { Lines, Tag } from "./ui";

/** "Prima e Dopo" section. Hidden when there are no pairs. */
export function BeforeAfter({ t, demoLabel, lang }: { t: Dictionary["beforeAfter"]; demoLabel: string; lang: Locale }) {
  const pairs = getBeforeAfter().map((p) => ({
    id: p.id,
    title: p.title[lang],
    location: p.location,
    before: p.before,
    after: p.after,
    demo: p.demo,
  }));
  if (pairs.length === 0) return null;

  return (
    <section id="prima-e-dopo" className="bg-navy py-20 text-white lg:py-[120px]">
      <div className="container-x">
        <div className="mb-12 grid gap-6 md:grid-cols-[1fr_minmax(0,420px)] md:items-end">
          <div>
            <Tag className="reveal">{t.tag}</Tag>
            <h2 className="h2 reveal"><Lines text={t.title} /></h2>
          </div>
          <p className="reveal text-white/75">{t.text}</p>
        </div>
        <BeforeAfterSlider pairs={pairs} t={t} demoLabel={demoLabel} />
      </div>
    </section>
  );
}
