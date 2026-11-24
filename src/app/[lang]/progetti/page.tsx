import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n";
import { getProjects, portfolioCategories } from "@/content/showcase";
import { Header } from "@/components/Header";
import { ProjectGrid } from "@/components/ProjectGrid";
import { toProjectCards } from "@/components/Portfolio";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ScrollEffects } from "@/components/ScrollEffects";
import { Lines, Tag } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, pageAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/progetti">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).projectsPage;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: pageAlternates(lang, "/progetti"),
  };
}

/** Full portfolio. 404 until there is at least one project to show. */
export default async function ProjectsPage({ params }: PageProps<"/[lang]/progetti">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const projects = getProjects();
  if (projects.length === 0) notFound();
  const t = getDictionary(lang);

  return (
    <div id="top">
      <Header lang={lang} nav={t.nav} hours={t.top.hours} quote={t.cta.quote} hasProjects />
      <main>
        <section className="py-20 lg:py-[120px]">
          <div className="container-x">
            <div className="mb-12 max-w-[760px]">
              <Tag>{t.projectsPage.tag}</Tag>
              <h1 className="h2"><Lines text={t.projectsPage.title} /></h1>
              <p className="mt-6 text-muted">{t.projectsPage.text}</p>
            </div>
            <ProjectGrid projects={toProjectCards(projects, lang)} categories={portfolioCategories} t={t.portfolio} />
          </div>
        </section>
        <Contact t={t.contact} form={t.form} lang={lang} />
      </main>
      <Footer t={t} lang={lang} hasProjects />
      <ScrollEffects />
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          { name: t.nav.home, path: "" },
          { name: t.nav.projects, path: "/progetti" },
        ])}
      />
    </div>
  );
}
