import Image from "next/image";
import type { Dictionary, Locale } from "@/i18n";
import { findProject, getGoogleRating, getReviews } from "@/content/showcase";
import { ArrowIcon } from "./icons";
import { ReviewsCarousel } from "./ReviewsCarousel";
import { DemoBadge, Lines, Stars, Tag } from "./ui";

const intlLocale: Record<Locale, string> = { it: "it-IT", en: "en-GB" };

/** "2025-06" → "giugno 2025" / "June 2025". Fixed date, so it is safe to prerender. */
function formatMonth(date: string, lang: Locale) {
  const [y, m] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(intlLocale[lang], { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, (m || 1) - 1, 1)),
  );
}

type Props = { t: Dictionary["reviews"]; categories: Dictionary["portfolio"]["categories"]; demoLabel: string; lang: Locale };

/** Google rating + client reviews, each optionally tied to the project it is about. Hidden when empty. */
export function Reviews({ t, categories, demoLabel, lang }: Props) {
  const reviews = getReviews();
  const google = getGoogleRating();
  if (reviews.length === 0 && !google) return null;
  const rating = new Intl.NumberFormat(intlLocale[lang], { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <section id="recensioni" className="bg-mist py-20 lg:py-[120px]">
      <div className="container-x">
        <div className="mb-12 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Tag className="reveal">{t.tag}</Tag>
            <h2 className="h2 reveal"><Lines text={t.title} /></h2>
          </div>

          {google && (
            <a
              href={google.url}
              target="_blank"
              rel="noopener noreferrer"
              className="reveal group relative flex items-center gap-5 border-l-[3px] border-brand bg-surface px-6 py-5 shadow-[0_6px_30px_var(--color-shadow)]"
            >
              <span className="font-head text-[44px] leading-none font-bold tracking-[-0.03em]">{rating.format(google.rating)}</span>
              <span className="grid gap-1.5">
                <small className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{t.googleLabel}</small>
                <Stars rating={google.rating} label={`${rating.format(google.rating)} ${t.stars}`} className="text-lg" />
                <span className="inline-flex items-center gap-1.5 font-head text-[13px] font-bold tracking-[0.04em] uppercase group-hover:text-brand">
                  {google.count} {t.count} · {t.seeOnGoogle}
                  <ArrowIcon className="size-3.5" />
                </span>
              </span>
              {google.demo && <DemoBadge label={demoLabel} className="absolute -top-3 right-3" />}
            </a>
          )}
        </div>

        {reviews.length > 0 && (
          <ReviewsCarousel label={t.title.replace("\n", " ")} prevLabel={t.prev} nextLabel={t.next}>
            {reviews.map((r) => {
              const project = r.projectId ? findProject(r.projectId) : undefined;
              return (
                // 1 card (+ a peek of the next) on mobile, 2 on md, 3 on xl.
                <li
                  key={r.id}
                  className="relative flex w-[85%] shrink-0 snap-start flex-col bg-surface p-7 shadow-[0_6px_30px_var(--color-shadow)] md:w-[calc((100%-18px)/2)] xl:w-[calc((100%-36px)/3)]"
                >
                  {r.demo && <DemoBadge label={demoLabel} className="absolute top-3 right-3" />}
                  <Stars rating={r.rating} label={`${r.rating} ${t.stars}`} className="text-base" />
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed">“{r.text}”</blockquote>
                  <footer className="mt-6 border-t border-line pt-5">
                    <p className="font-head font-bold">{r.author}</p>
                    <p className="text-xs text-muted">
                      {r.location} · <time dateTime={r.date}>{formatMonth(r.date, lang)}</time>
                    </p>
                    {project && (
                      <div className="mt-4 flex items-center gap-3.5">
                        <div className="relative size-14 flex-none overflow-hidden bg-mist">
                          <Image src={project.image} alt="" fill quality={50} sizes="56px" className="object-cover" />
                        </div>
                        <p className="text-sm leading-snug">
                          <small className="block text-[11px] font-semibold tracking-[0.1em] text-brand uppercase">
                            {t.story} · {categories[project.category]}
                          </small>
                          {project.title[lang]}
                        </p>
                      </div>
                    )}
                  </footer>
                </li>
              );
            })}
          </ReviewsCarousel>
        )}
      </div>
    </section>
  );
}
