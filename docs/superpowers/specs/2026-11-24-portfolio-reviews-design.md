# Portfolio, Prima e Dopo, Recensioni — design + plan

## Context
Fondamenta's one-page site (`/it`, `/en`) needs three trust/marketing blocks: a filterable
project portfolio (Ristrutturazioni, Costruzioni, Tetti, Facciate), before/after comparisons,
and client reviews with a Google rating + short project stories. The user has **no real content
yet** → we build the full structure with clearly-marked demo data that never reaches production
(push to `main` = production deploy on Vercel). Chosen layout: **homepage teaser + dedicated
`/[lang]/progetti` page** (approach B; approach A "all on homepage" rejected because a large
gallery would overload the one-pager).

**Goals:** one typed place to add real content; sections appear automatically once real
entries exist; portfolio cards lead to the quote form with the right work type preselected;
pages stay statically prerendered.
**Non-goals:** CMS/DB for content, live Google Places API, per-project detail pages, sitemap,
review JSON-LD (Google ignores self-served LocalBusiness review stars; could mislead).
**Anti-goals:** any fake review/project visible on the live site.

## Content model — `src/content/showcase.ts` (new, server-only data)
```ts
type L = { it: string; en: string };
export const portfolioCategories = ["renovation","new_build","roof","facade"] as const
  satisfies readonly WorkType[];               // reuse src/lib/leads.ts workTypes
type Category = (typeof portfolioCategories)[number];
type Project = { id; category: Category; title: L; location: string; year: number;
  summary: L; image: StaticImageData; featured?: boolean; demo?: true };
type BeforeAfter = { id; title: L; location; before: StaticImageData; after: StaticImageData;
  projectId?: string; demo?: true };
type Review = { id; author; location; rating: 1|2|3|4|5; date: string; text: string /* original
  language, not translated */; projectId?: string /* → "story": shows project thumb+title */; demo?: true };
export const googleRating: { rating: number; count: number; url: string; demo?: true } | null;
```
- `showDemoContent = process.env.NODE_ENV !== "production" || process.env.SHOW_DEMO_CONTENT === "1"`.
- Helpers: `getProjects()`, `getFeaturedProjects(6)`, `getBeforeAfter()`, `getReviews()`,
  `getGoogleRating()` — each drops `demo` entries unless `showDemoContent`.
- Images via static imports (blur placeholder, like `Process.tsx`). Demo entries reuse the 5
  existing photos in `public/images/`; demo before/after pairs = two different existing photos.
- A header comment in the file explains how to add real content (photo → `assets/original-images/`
  → `npm run images` → import → entry without `demo`).

## UI copy — `src/i18n/it.ts` + `en.ts`
New slices `portfolio` (tag, title, filterAll, categories labels reuse `form.types`, seeAll, cta),
`beforeAfter` (tag, title, before, after, sliderLabel), `reviews` (tag, title, ratingLabel,
seeOnGoogle, projectStory), `projectsPage` (meta title/description, h1, back), `nav.projects`.

## Components (`src/components/`)
- `Portfolio.tsx` (server) — section `#progetti`, Tag/.h2/.reveal/`py-20 lg:py-[120px]`; renders
  `<ProjectGrid>` with featured projects + "Vedi tutti i progetti" `Link` to `/${lang}/progetti` (only when there are more projects than the teaser shows).
  Returns `null` when no projects.
- `ProjectGrid.tsx` (`"use client"`) — filter chips (Tutti + 4 categories, only categories that
  have projects), `useState`, no URL params (keeps static). `aria-pressed` on chips, `aria-live`
  count. Card: next/image (`sizes`, quality 65), category tag, title, location·year, summary,
  `QuoteLink workType={project.category}` "Richiedi un preventivo simile". Cards are passed
  pre-rendered data only (plain props, image src/blur from StaticImageData).
- `BeforeAfter.tsx` (server) + `BeforeAfterSlider.tsx` (client) — two stacked images, "after"
  clipped with `clip-path: inset(0 0 0 X%)`; a visually-full `<input type="range">` drives X →
  keyboard/touch/screen-reader accessible for free; labels "Prima"/"Dopo". Multiple pairs → simple
  tab list of pair titles. Section `#prima-e-dopo`, null when empty.
- `Reviews.tsx` (server) — Google badge (stars, `4.9 · 37 recensioni`, link to profile) + grid of
  review cards (stars, text, author, location, date; if `projectId` → project thumbnail + title as
  "story"). Section `#recensioni`, null when empty.
- `Stars.tsx` small shared icon row (in `icons.tsx` or `ui`).

## Pages & navigation
- `src/app/[lang]/page.tsx` order: Hero, Marquee, About, Services, **Portfolio**, Process, WhyUs,
  **BeforeAfter**, **Reviews**, Contact. (BeforeAfter moved below WhyUs during implementation: WhyUs relies on Process above it for top spacing, so the live site looks unchanged while BeforeAfter is empty.)
- New `src/app/[lang]/progetti/page.tsx` — `generateMetadata` (title/description/alternates
  `/it/progetti`, `/en/progetti`), Header + h1 + full `ProjectGrid` + Contact (so QuoteLink's
  `#preventivo` works on this page too) + Footer + ScrollEffects. `notFound()` when no projects
  (production with no real content). Params come from layout `generateStaticParams`.
- Header/Footer: hash links become `/${lang}#id` (same-document scroll on home, real nav from
  /progetti); add "Progetti" → `/${lang}/progetti`, shown only when projects exist (pass
  `hasProjects` prop). Language switch on /progetti keeps the subpath (`usePathname`).
- Before coding: read `node_modules/next/dist/docs/01-app` pages on dynamic routes,
  `generateMetadata`, Link, and cacheComponents/prerendering + env vars (AGENTS.md rule).

## Tests & tooling
- `e2e/server.mjs`: build/start with `SHOW_DEMO_CONTENT=1` so E2E sees the sections.
- `tests/unit/showcase.test.ts`: demo filtering on/off, featured limit, every `projectId`
  reference resolves, every category ∈ `workTypes`, it/en both non-empty.
- `e2e/site.spec.ts`: add `/it/progetti` + `/en/progetti` to the console/HTTP-error sweep;
  filter click shows only that category; slider moves with keyboard (ArrowRight changes clip).
- `e2e/lead-flow.spec.ts`: click a portfolio card CTA → form type preselected.
- README: content section ("how to add a project/review"), structure tree, `SHOW_DEMO_CONTENT`.
- Design doc copied to `docs/superpowers/specs/2026-11-24-portfolio-reviews-design.md`.

## Verification
1. `npm run lint && npm test` (unit + integration).
2. `npm run dev` → check /it, /en, /it/progetti in light/dark + mobile width (Chrome tools):
   filters, slider drag + keys, review cards, CTA scroll + preselected type.
3. `npm run build` **without** the flag → confirm /it has no portfolio/before-after/reviews
   sections and no "Progetti" nav link, and /it/progetti returns 404 (no demo leak).
4. `npm run test:e2e` (with flag) — all green.
