# Google Maps + local SEO — design + plan

## Context
The company's seat is **Via Pistola, 10, 33080 Porcia (PN)** (user-provided; replaces an earlier
Motta di Livenza address). The site has no address, no map and almost no SEO: only
title/description + it/en `alternates` in `src/app/[lang]/layout.tsx`. Goal: show the office on a
map and make Google understand *who/where/what* so the site ranks for local searches
("impresa edile Porcia / Pordenone", "ristrutturazioni Pordenone") and matches a Google Business
Profile. Positioning stays "Pordenone e provincia" (Porcia is in PN → name/address/phone stay consistent).

**Non-goals:** cookie-consent banner, Maps API key/billing, per-town landing pages, review stars
markup (`aggregateRating` is self-serving and the reviews are still demo).
**Anti-goal:** loading Google cookies before the visitor asks for the map (GDPR / Garante).

## Approach (map)
Click-to-load map, no API key: a styled placeholder (pin, full address, "Mostra la mappa" button,
"Apri in Google Maps / Indicazioni" link). On click → `<iframe src="https://www.google.com/maps?q=<address>&output=embed&hl=<lang>">`.
Rejected: plain iframe on load (Google cookies without consent, ~500 KB on every visit);
Maps Embed API (needs a key + Cloud project for the same result).

## 1. Company data — `src/lib/site.ts` (single source of NAP)
Add:
```ts
url: process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${…}` : "https://fondamenta-ashen.vercel.app",
address: { street: "Via Pistola, 10", postalCode: "33080", locality: "Porcia", province: "PN",
           region: "Friuli-Venezia Giulia", country: "IT" },
mapsQuery / mapsUrl (google.com/maps/search/?api=1&query=…) / directionsUrl,
openingHours: { days: ["Mo".."Sa"], opens: "07:30", closes: "18:30" },
areaServed: ["Porcia","Pordenone","Cordenons","Fiume Veneto","Azzano Decimo","Sacile",
             "Prata di Pordenone","Brugnera","Fontanafredda","Roveredo in Piano","San Vito al Tagliamento"],
```
`city` → `"Porcia (PN)"`. `VERCEL_PROJECT_PRODUCTION_URL` is set by Vercel at build, so the URL follows a
future custom domain automatically.

## 2. Map — `src/components/LocationMap.tsx` (client) in `Contact.tsx`
- Contact rows: add "Sede" row → full address linking to `mapsUrl` (`<address>`).
- Below the contact grid, full width: `LocationMap` (aspect 16/9 → 21/9 on desktop, navy-deep
  placeholder with grid pattern like `.hero-grid`). Button `aria-label`, iframe `title`,
  `loading="lazy"`, `referrerPolicy="no-referrer-when-downgrade"`.
- Copy in `it.ts`/`en.ts` `contact`: `addressLabel`, `mapShow`, `mapOpen`, `mapDirections`,
  `mapNote` ("Caricando la mappa accetti i cookie di Google"), `mapTitle`.
- `areaLabel` text → "Porcia, Pordenone e provincia" / EN equivalent.

## 3. Structured data — `src/lib/seo.ts` + `<JsonLd>` in `[lang]/layout.tsx`
- `localBusinessJsonLd(lang)` → `@type: "GeneralContractor"` (LocalBusiness subtype), `@id: url#business`,
  name, legalName, url (`/${lang}`), logo, image (hero), telephone, email, `address` (PostalAddress),
  `openingHoursSpecification`, `areaServed` (City list + AdministrativeArea "Provincia di Pordenone"),
  `hasMap` (mapsUrl), `vatID`, `sameAs` (socials that aren't "#"), `knowsAbout` (service names),
  `inLanguage`. No `geo` (we don't invent coordinates; Google geocodes the address).
- `/progetti`: add `BreadcrumbList` (Home → Progetti).
- Render: server `<script type="application/ld+json">` with `JSON.stringify(...).replace(/</g,"\\u003c")`
  (pattern from `next/dist/docs/01-app/02-guides/json-ld.md`).

## 4. Metadata — `[lang]/layout.tsx`, `[lang]/page.tsx`, `progetti/page.tsx`
- Layout: `metadataBase: new URL(site.url)`, OpenGraph (type website, siteName, locale `it_IT`/`en_GB`,
  alternateLocale, image `/images/hero-worker.jpg` 1200×…), `twitter: summary_large_image`,
  `robots: { index: true, follow: true }`, `formatDetection: { telephone: false }` not needed.
- Per page: `alternates.canonical` (`/it`, `/it/progetti`) + `languages` incl. `x-default: "/it"`.
- Copy: `meta.title` "Impresa edile a Porcia e Pordenone | Fondamenta Costruzioni";
  description mentions Porcia, Pordenone e provincia, services, "preventivo gratuito"; same for EN.
  `hero.kicker` stays "Impresa edile a Pordenone" (H1-area keyword) — fine, PN province.

## 5. Crawling — `src/app/sitemap.ts`, `src/app/robots.ts`
- Sitemap: `/it`, `/en` + `/it/progetti`, `/en/progetti` only when `getProjects().length > 0`
  (`src/content/showcase.ts`), each with `alternates.languages`; absolute URLs from `site.url`.
- Robots: allow `/`, disallow `/api/`, `sitemap: ${site.url}/sitemap.xml`.

## 6. Footer NAP
Footer line: `© year · legalName · P.IVA · Via Pistola, 10 · 33080 Porcia (PN) · phone` inside `<address>`.

## Tests
- Unit `tests/unit/seo.test.ts`: JSON-LD has the exact address/postal code/locality, no `<`
  unescaped, `sameAs` excludes "#", opening hours Mo–Sa.
- E2E `site.spec.ts`: `/it` has one `application/ld+json` parseable with `@type GeneralContractor`
  and `addressLocality: "Porcia"`; canonical + hreflang links present; map: no request to
  `google.com` before click, iframe appears after clicking "Mostra la mappa" (route-block google so
  the error sweep stays clean); `/sitemap.xml` 200 contains `/it/progetti`; `/robots.txt` lists sitemap.
- README: SEO section + manual steps.

## Manual steps for the user (not code — listed in the final message/README)
1. Google Business Profile with the **identical** name/address/phone, category "Impresa edile",
   website = site URL; then put its review link into `googleRating.url` in `src/content/showcase.ts`.
2. Google Search Console: verify domain, submit `/sitemap.xml`.
3. Replace placeholder phone / email / P.IVA in `src/lib/site.ts` (wrong NAP hurts local ranking).
4. Ideally a custom domain (vercel.app subdomain ranks worse and isn't brandable).

## Verification
1. `npx tsc --noEmit`, `npm run lint`, `npm test`.
2. `npm run build` → inspect `.next/server/app/it.html` for JSON-LD + canonical; `/sitemap.xml`, `/robots.txt`.
3. `npm run test:e2e`.
4. Dev server: screenshot Contact section light/dark/mobile; click map → iframe loads Porcia.
5. After deploy: Google Rich Results Test / validator.schema.org on the live URL.
