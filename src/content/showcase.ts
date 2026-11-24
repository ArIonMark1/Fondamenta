// Portfolio, "Prima e Dopo" and reviews — the one place to edit this content.
//
// ── How to add real content ────────────────────────────────────────────────
// 1. Photo: drop the original into assets/original-images/ (e.g. casa-rossi.jpg),
//    run `npm run images`, then import it below:
//      import casaRossiImg from "../../public/images/casa-rossi.jpg";
// 2. Add an entry WITHOUT `demo: true`. Sections and the /progetti page appear on
//    the live site as soon as at least one real entry exists.
// 3. Delete the demo entries once you have enough real ones.
//
// Entries with `demo: true` are placeholders: shown in `npm run dev` and in the
// E2E build (SHOW_DEMO_CONTENT=1), never on the live site. Reviews must be real,
// verbatim client quotes (with their consent): publishing invented reviews is
// an unfair commercial practice under EU/Italian law.
import "server-only";
import type { StaticImageData } from "next/image";
import type { Locale } from "@/i18n";
import type { WorkType } from "@/lib/leads";
import blueprintsImg from "../../public/images/blueprints.jpg";
import heroWorkerImg from "../../public/images/hero-worker.jpg";
import modernHouseImg from "../../public/images/modern-house.jpg";
import siteTeamImg from "../../public/images/site-team.jpg";
import villaImg from "../../public/images/villa.jpg";

/** Text in both site languages. */
export type Localized = Record<Locale, string>;

/** Portfolio filters, in display order. Each one is also a quote-form work type. */
export const portfolioCategories = ["renovation", "new_build", "roof", "facade"] as const satisfies readonly WorkType[];
export type PortfolioCategory = (typeof portfolioCategories)[number];

type Demo = { /** Placeholder — hidden on the live site. */ demo?: true };

export type Project = Demo & {
  id: string;
  category: PortfolioCategory;
  title: Localized;
  location: string;
  year: number;
  summary: Localized;
  image: StaticImageData;
  /** Shown in the homepage teaser (up to 6; the rest only on /progetti). */
  featured?: boolean;
};

export type BeforeAfterPair = Demo & {
  id: string;
  title: Localized;
  location: string;
  /** Both photos should be taken from the same spot, same framing. */
  before: StaticImageData;
  after: StaticImageData;
};

export type Review = Demo & {
  id: string;
  author: string;
  location: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** "YYYY-MM" — shown as month and year. */
  date: string;
  /** Verbatim, in the language the client wrote it in. Not translated. */
  text: string;
  /** The project this client's story is about (shows its photo and title). */
  projectId?: string;
};

export type GoogleRating = Demo & {
  rating: number;
  count: number;
  /** Link to the Google Business profile / reviews. */
  url: string;
};

// ── Content ─────────────────────────────────────────────────────────────────

const projects: Project[] = [
  {
    id: "demo-villa-cordenons",
    demo: true,
    featured: true,
    category: "new_build",
    title: { it: "Villa unifamiliare con piscina", en: "Single-family villa with pool" },
    location: "Cordenons (PN)",
    year: 2025,
    summary: {
      it: "Nuova costruzione in classe A4: struttura in laterocemento, cappotto e impianti chiavi in mano.",
      en: "New A4 energy-class build: brick-and-concrete structure, insulation and turnkey systems.",
    },
    image: villaImg,
  },
  {
    id: "demo-casa-porcia",
    demo: true,
    featured: true,
    category: "renovation",
    title: { it: "Ristrutturazione completa di una casa anni '70", en: "Full renovation of a 1970s house" },
    location: "Porcia (PN)",
    year: 2024,
    summary: {
      it: "Nuova distribuzione interna, impianti rifatti, bagni e cucina. Consegna in 5 mesi.",
      en: "New interior layout, all-new systems, bathrooms and kitchen. Delivered in 5 months.",
    },
    image: modernHouseImg,
  },
  {
    id: "demo-tetto-sacile",
    demo: true,
    featured: true,
    category: "roof",
    title: { it: "Rifacimento tetto in legno ventilato", en: "New ventilated timber roof" },
    location: "Sacile (PN)",
    year: 2025,
    summary: {
      it: "Smontaggio della vecchia copertura, nuova orditura in legno, isolamento e lattonerie in rame.",
      en: "Old roof removed, new timber frame, insulation and copper flashing.",
    },
    image: siteTeamImg,
  },
  {
    id: "demo-facciata-pordenone",
    demo: true,
    featured: true,
    category: "facade",
    title: { it: "Cappotto termico per condominio", en: "External insulation for an apartment block" },
    location: "Pordenone",
    year: 2024,
    summary: {
      it: "Isolamento a cappotto da 12 cm e nuova finitura: bollette di riscaldamento quasi dimezzate.",
      en: "12 cm external insulation and new render: heating bills nearly halved.",
    },
    image: blueprintsImg,
  },
  {
    id: "demo-bifamiliare-fiume-veneto",
    demo: true,
    featured: true,
    category: "new_build",
    title: { it: "Casa bifamiliare in cemento armato", en: "Two-family house in reinforced concrete" },
    location: "Fiume Veneto (PN)",
    year: 2023,
    summary: {
      it: "Dalle fondazioni al tetto, con un unico capocantiere e aggiornamenti settimanali per i proprietari.",
      en: "From foundations to roof, with one site manager and weekly updates for the owners.",
    },
    image: heroWorkerImg,
  },
  {
    id: "demo-appartamento-centro",
    demo: true,
    featured: true,
    category: "renovation",
    title: { it: "Appartamento in centro storico", en: "Apartment in the historic centre" },
    location: "Pordenone",
    year: 2025,
    summary: {
      it: "Recupero di travi a vista, nuovo bagno e pavimenti in rovere, senza disturbare i vicini.",
      en: "Exposed beams restored, new bathroom and oak floors, without disturbing the neighbours.",
    },
    image: villaImg,
  },
  {
    id: "demo-copertura-azzano",
    demo: true,
    category: "roof",
    title: { it: "Impermeabilizzazione tetto piano", en: "Flat roof waterproofing" },
    location: "Azzano Decimo (PN)",
    year: 2023,
    summary: {
      it: "Nuova guaina, isolamento e scarichi: nessuna infiltrazione dopo due inverni.",
      en: "New membrane, insulation and drains: no leaks after two winters.",
    },
    image: blueprintsImg,
  },
  {
    id: "demo-facciata-spilimbergo",
    demo: true,
    category: "facade",
    title: { it: "Rifacimento facciata storica", en: "Historic façade restoration" },
    location: "Spilimbergo (PN)",
    year: 2024,
    summary: {
      it: "Consolidamento degli intonaci, nuovi davanzali e tinteggiatura ai silicati.",
      en: "Render consolidated, new window sills and silicate paint.",
    },
    image: modernHouseImg,
  },
];

const beforeAfter: BeforeAfterPair[] = [
  {
    id: "demo-ba-villa",
    demo: true,
    title: { it: "Dal progetto alla villa finita", en: "From drawings to finished villa" },
    location: "Cordenons (PN)",
    before: blueprintsImg,
    after: villaImg,
  },
  {
    id: "demo-ba-casa",
    demo: true,
    title: { it: "Cantiere e casa consegnata", en: "Building site and handed-over house" },
    location: "Porcia (PN)",
    before: siteTeamImg,
    after: modernHouseImg,
  },
];

const reviews: Review[] = [
  {
    id: "demo-review-1",
    demo: true,
    author: "Marco R.",
    location: "Porcia",
    rating: 5,
    date: "2025-06",
    text: "Testo di esempio: qui andrà la recensione reale del cliente, copiata parola per parola da Google.",
    projectId: "demo-casa-porcia",
  },
  {
    id: "demo-review-2",
    demo: true,
    author: "Elena B.",
    location: "Sacile",
    rating: 5,
    date: "2025-03",
    text: "Testo di esempio: una recensione breve su tempi rispettati, cantiere pulito e preventivo chiaro.",
    projectId: "demo-tetto-sacile",
  },
  {
    id: "demo-review-3",
    demo: true,
    author: "Luca e Sara T.",
    location: "Cordenons",
    rating: 4,
    date: "2024-11",
    text: "Testo di esempio: le recensioni restano nella lingua originale in cui il cliente le ha scritte.",
  },
  {
    id: "demo-review-4",
    demo: true,
    author: "Giorgio P.",
    location: "Pordenone",
    rating: 5,
    date: "2024-09",
    text: "Testo di esempio: con più di tre recensioni il blocco diventa uno slideshow da scorrere con le frecce o con il dito.",
    projectId: "demo-facciata-pordenone",
  },
  {
    id: "demo-review-5",
    demo: true,
    author: "Anna M.",
    location: "Fiume Veneto",
    rating: 5,
    date: "2024-05",
    text: "Testo di esempio: una storia breve del cantiere, raccontata con le parole del cliente.",
    projectId: "demo-bifamiliare-fiume-veneto",
  },
];

const googleRating: GoogleRating | null = {
  demo: true,
  rating: 4.9,
  count: 27,
  url: "https://www.google.com/maps",
};

// ── Access ──────────────────────────────────────────────────────────────────

/**
 * Demo content is visible outside production, or when explicitly enabled
 * (the E2E build sets SHOW_DEMO_CONTENT=1). Read at build time: the pages are
 * prerendered, so the live site never contains demo entries.
 */
export function shouldShowDemo(env: { NODE_ENV?: string; SHOW_DEMO_CONTENT?: string } = process.env): boolean {
  return env.NODE_ENV !== "production" || env.SHOW_DEMO_CONTENT === "1";
}

export function withoutDemo<T extends Demo>(items: readonly T[], showDemo = shouldShowDemo()): T[] {
  return showDemo ? [...items] : items.filter((item) => !item.demo);
}

export const FEATURED_LIMIT = 6;

export const getProjects = (showDemo?: boolean) => withoutDemo(projects, showDemo);

/** Homepage teaser: featured projects first, topped up with the rest, up to FEATURED_LIMIT. */
export function getFeaturedProjects(showDemo?: boolean): Project[] {
  const all = getProjects(showDemo);
  return [...all.filter((p) => p.featured), ...all.filter((p) => !p.featured)].slice(0, FEATURED_LIMIT);
}

export const getBeforeAfter = (showDemo?: boolean) => withoutDemo(beforeAfter, showDemo);

export const getReviews = (showDemo?: boolean) => withoutDemo(reviews, showDemo);

export function getGoogleRating(showDemo?: boolean): GoogleRating | null {
  return googleRating && withoutDemo([googleRating], showDemo)[0] ? googleRating : null;
}

export const findProject = (id: string, showDemo?: boolean) => getProjects(showDemo).find((p) => p.id === id);

/** Raw lists for consistency tests. */
export const __content = { projects, beforeAfter, reviews, googleRating };
