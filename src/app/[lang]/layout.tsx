import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Space_Grotesk } from "next/font/google";
import { getDictionary, hasLocale, locales, type Locale } from "@/i18n";
import { initTheme, THEME_KEY } from "@/lib/theme";
import { site } from "@/lib/site";
import { localBusinessJsonLd, siteUrl } from "@/lib/seo";
import { InlineScript } from "@/components/InlineScript";
import { JsonLd } from "@/components/JsonLd";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const themeScript = `(${initTheme})(${JSON.stringify(THEME_KEY)})`;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  // Canonical + hreflang are set per page (pageAlternates). Pages that set
  // openGraph themselves would replace this whole object, so they don't.
  return {
    metadataBase: new URL(siteUrl),
    title: dict.meta.title,
    description: dict.meta.description,
    applicationName: site.name,
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: ogLocale[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
      images: [{ url: "/images/hero_buildings.jpg", alt: dict.hero.imageAlt }],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

const ogLocale: Record<Locale, string> = { it: "it_IT", en: "en_GB" };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // suppressHydrationWarning: browser translation (Chrome Translate rewrites
  // <html lang="it"> to lang="uk" and adds a "translated-ltr" class) and some
  // extensions edit these two tags before React hydrates. Only the attributes
  // of these tags are exempt; mismatches inside the page are still reported.
  // The theme script runs while <head> is parsed, before the first paint, so a
  // saved dark theme never flashes light. data-theme is deliberately not in
  // the JSX: React then never overwrites the attribute the script set.
  return (
    <html lang={lang} className={`${spaceGrotesk.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body suppressHydrationWarning>
        {children}
        <JsonLd data={localBusinessJsonLd(lang, getDictionary(lang))} />
      </body>
    </html>
  );
}
