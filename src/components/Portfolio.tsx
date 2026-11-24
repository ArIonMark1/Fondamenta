import type { Dictionary, Locale } from "@/i18n";
import { getFeaturedProjects, getProjects, portfolioCategories, type Project } from "@/content/showcase";
import { ProjectGrid, type ProjectCard } from "./ProjectGrid";
import { BoxButton, Lines, Tag } from "./ui";

/** Picks the page language and drops what the client grid doesn't need. */
export const toProjectCards = (projects: Project[], lang: Locale): ProjectCard[] =>
  projects.map((p) => ({
    id: p.id,
    category: p.category,
    title: p.title[lang],
    location: p.location,
    year: p.year,
    summary: p.summary[lang],
    image: p.image,
    demo: p.demo,
  }));

/** Homepage teaser: featured projects + link to the full /progetti page. Hidden when there are none. */
export function Portfolio({ t, lang }: { t: Dictionary["portfolio"]; lang: Locale }) {
  const projects = getFeaturedProjects();
  if (projects.length === 0) return null;
  const hasMore = getProjects().length > projects.length;

  return (
    <section id="progetti" className="bg-mist py-20 lg:py-[120px]">
      <div className="container-x">
        <div className="mb-12 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Tag className="reveal">{t.tag}</Tag>
            <h2 className="h2 reveal"><Lines text={t.title} /></h2>
          </div>
          {hasMore && (
            <BoxButton href={`/${lang}/progetti`} variant="orange" className="reveal">{t.seeAll}</BoxButton>
          )}
        </div>
        <ProjectGrid projects={toProjectCards(projects, lang)} categories={portfolioCategories} t={t} />
      </div>
    </section>
  );
}
