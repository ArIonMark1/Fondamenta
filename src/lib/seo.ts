// Local SEO: site URL, structured data (JSON-LD) and per-page alternates.
import "server-only";
import type { Dictionary, Locale } from "@/i18n";
import { locales } from "@/i18n";
import { site } from "./site";

/**
 * Canonical origin. Vercel sets VERCEL_PROJECT_PRODUCTION_URL at build time to the
 * production domain (a custom domain once one is added), so links follow it automatically.
 */
export function getSiteUrl(env: Record<string, string | undefined> = process.env): string {
  const host = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return host ? `https://${host.replace(/^https?:\/\//, "").replace(/\/+$/, "")}` : "https://fondamenta-ashen.vercel.app";
}

export const siteUrl = getSiteUrl();

/** `path` is the part after the locale: "" for the homepage, "/progetti", … */
export function pageAlternates(lang: Locale, path = "") {
  return {
    canonical: `/${lang}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/it${path}`,
    },
  };
}

const realLinks = (links: Record<string, string>) => Object.values(links).filter((href) => /^https?:\/\//.test(href));

/** The company as a LocalBusiness (GeneralContractor) — name, address and phone exactly as on the page. */
export function localBusinessJsonLd(lang: Locale, t: Dictionary) {
  const { address, openingHours } = site;
  const sameAs = realLinks(site.socials);
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": `${siteUrl}/#business`,
    name: site.name,
    legalName: site.legalName,
    description: t.meta.description,
    url: `${siteUrl}/${lang}`,
    logo: `${siteUrl}/logo.svg`,
    image: `${siteUrl}/images/hero_buildings.jpg`,
    telephone: site.phoneHref.replace(/^tel:/, ""),
    email: site.email,
    vatID: `IT${site.vat}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      postalCode: address.postalCode,
      addressLocality: address.locality,
      addressRegion: address.province,
      addressCountry: address.country,
    },
    hasMap: site.mapsUrl,
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: openingHours.days, opens: openingHours.opens, closes: openingHours.closes },
    ],
    areaServed: [
      ...site.areaServed.map((name) => ({ "@type": "City", name })),
      { "@type": "AdministrativeArea", name: "Provincia di Pordenone" },
    ],
    knowsAbout: t.marquee,
    inLanguage: lang,
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/** Home → current page, for the breadcrumb shown in search results. */
export function breadcrumbJsonLd(lang: Locale, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}/${lang}${item.path}`,
    })),
  };
}

/** JSON for a <script type="application/ld+json">; "<" escaped so text can't close the tag. */
export const jsonLdHtml = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
