import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Process } from "@/components/Process";
import { WhyUs } from "@/components/WhyUs";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ScrollEffects } from "@/components/ScrollEffects";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <div id="top">
      <Header lang={lang} nav={t.nav} hours={t.top.hours} quote={t.cta.quote} />
      <main>
        {/* Screen 1 */}
        <Hero t={t.hero} />
        <Marquee items={t.marquee} />
        {/* Screen 2 */}
        <About t={t.about} />
        <Services t={t.services} />
        {/* Screen 3 */}
        <Process t={t.process} />
        <WhyUs t={t.why} />
        <Contact t={t.contact} form={t.form} lang={lang} />
      </main>
      <Footer nav={t.nav} />
      <ScrollEffects />
    </div>
  );
}
