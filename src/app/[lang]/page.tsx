import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n";
import { pageAlternates } from "@/lib/seo";
import { getProjects } from "@/content/showcase";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Portfolio } from "@/components/Portfolio";
import { Process } from "@/components/Process";
import { BeforeAfter } from "@/components/BeforeAfter";
import { WhyUs } from "@/components/WhyUs";
import { Reviews } from "@/components/Reviews";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ScrollEffects } from "@/components/ScrollEffects";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { alternates: pageAlternates(lang) } : {};
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const hasProjects = getProjects().length > 0;

  return (
    <div id="top">
      <Header lang={lang} nav={t.nav} hours={t.top.hours} quote={t.cta.quote} hasProjects={hasProjects} />
      <main>
        {/* Screen 1 */}
        <Hero t={t.hero} />
        <Marquee items={t.marquee} />
        {/* Screen 2 */}
        <About t={t.about} />
        <Services t={t.services} />
        {/* Portfolio, "Prima e Dopo" and reviews render nothing until there is content (src/content/showcase.ts). */}
        <Portfolio t={t.portfolio} lang={lang} />
        {/* Screen 3 */}
        <Process t={t.process} />
        <WhyUs t={t.why} />
        <BeforeAfter t={t.beforeAfter} demoLabel={t.portfolio.demo} lang={lang} />
        <Reviews t={t.reviews} categories={t.portfolio.categories} demoLabel={t.portfolio.demo} lang={lang} />
        <Contact t={t.contact} form={t.form} lang={lang} />
      </main>
      <Footer t={t} lang={lang} hasProjects={hasProjects} />
      <ScrollEffects />
    </div>
  );
}
