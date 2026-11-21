import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Space_Grotesk } from "next/font/google";
import { getDictionary, hasLocale, locales } from "@/i18n";
import { initTheme, THEME_KEY } from "@/lib/theme";
import { InlineScript } from "@/components/InlineScript";
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
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: { languages: { it: "/it", en: "/en" } },
  };
}

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
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
