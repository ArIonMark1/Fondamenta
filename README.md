# Fondamenta Costruzioni

Bilingual (Italian / English) website for a construction company in Porcia (Pordenone), Italy.
Visitors request a free quote through a form; each request is saved to MongoDB and sent
to the owner in Telegram, where it can be confirmed or rejected with one tap.

**Live:** https://fondamenta-ashen.vercel.app

## Features

- **IT / EN** pages (`/it`, `/en`); `/` redirects by the browser's `Accept-Language`
- Statically prerendered pages, optimized AVIF/WebP images, light and dark theme
- **Quote form**: a Server Action with zod validation, a honeypot field against bots, and inline field errors
- **Telegram notifications** with ✅ Confirm / ❌ Reject buttons; the decision is written back to the database
- "Our method" steps link to the form and preselect the matching work type
- **Portfolio** with category filters (Ristrutturazioni, Costruzioni, Tetti, Facciate): a homepage teaser and
  the full `/[lang]/progetti` page; every project card opens the form with its category preselected
- **Prima e Dopo** comparison slider and **client reviews** with the Google rating
- **Office map** (Google Maps, loaded only on click: no cookies or API key) and **local SEO**:
  LocalBusiness JSON-LD, canonical + hreflang, OpenGraph, `sitemap.xml`, `robots.txt`
- `/api/health` endpoint that checks the database connection from the deployment

## Tech stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 ·
MongoDB Atlas · zod · Telegram Bot API · Vercel · Vitest · Playwright

## How it works

```
Form ──► Server Action ──► MongoDB (status: pending)
                     └──► Telegram: new lead + [✅ Confirm] [❌ Reject]
                                              │
             owner taps a button ─────────────┘
                     ▼
POST /api/telegram (secret-checked) ──► MongoDB (confirmed / rejected)
                                   └──► message updated with the new status
```

## Getting started

Requires **Node.js 26**.

```bash
npm install
# create .env in the project root with the variables below
npm run dev   # http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string (`npm run db`) |
| `MONGODB_DB` | Database name (default `fondamenta`) |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | Owner's chat ID: receives leads and is the only user allowed to press the buttons |
| `TELEGRAM_WEBHOOK_SECRET` | Random string that Telegram sends with every webhook call |
| `SHOW_DEMO_CONTENT` | Optional. `1` shows the demo portfolio / reviews in a production build (set by the E2E server; never on Vercel) |

No database at hand? `npm run db` starts a local MongoDB that keeps its data in `.mongo-data/`.

## Portfolio, before/after and reviews

All of it lives in **`src/content/showcase.ts`** (instructions at the top of the file).

- Entries marked `demo: true` are placeholders: visible in `npm run dev`, **never on the live site**.
- A section (and the `/progetti` page, and its menu link) appears in production as soon as it has one real entry.
- New photo: put it in `assets/original-images/`, run `npm run images`, import it in `showcase.ts`.
- Reviews must be real, verbatim client quotes (with consent). They are shown in their original language.

## Local SEO

Company name, address, phone, hours and served towns live in `src/lib/site.ts`; `src/lib/seo.ts`
turns them into the JSON-LD (`GeneralContractor`) on every page. The site URL comes from
`VERCEL_PROJECT_PRODUCTION_URL` (set by Vercel), so it follows a custom domain automatically.

Still to do by hand:
1. **Google Business Profile** with exactly the same name, address and phone as the site; website = the site URL.
   Then put its reviews link into `googleRating.url` in `src/content/showcase.ts`.
2. **Google Search Console**: verify the site and submit `/sitemap.xml`.
3. Replace the placeholder phone, email and P.IVA in `src/lib/site.ts` (a wrong phone hurts local ranking).
4. Check the live page with Google's Rich Results Test.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server, production build, production server |
| `npm run lint` | ESLint |
| `npm test` | Unit + integration tests (Vitest, in-memory MongoDB, fake Telegram) |
| `npm run test:e2e` | Browser tests (Playwright) against a local production build |
| `npm run check:prod` | Read-only health check of the live site and the Telegram webhook |
| `npm run test:prod` | Browser tests against the live site, including one real test lead (deleted afterwards) |
| `npm run leads` | Print the latest leads from the database |
| `npm run db` / `db:check` | Start a local MongoDB / test the `MONGODB_URI` connection |
| `npm run tg:webhook -- <url>` | Set the Telegram webhook (`--info`, `--delete` also work) |
| `npm run images` | Resize and recompress photos from `assets/original-images/` |

## Testing

- **Vitest** (`tests/`): form validation, Telegram message formatting, the Server Action, every webhook
  branch (wrong secret, other user, confirm / reject / change, unreachable database)
- **Playwright** (`e2e/`): pages render with no console errors or failed requests, redirects and 404,
  portfolio filters, the before/after slider, project cards preselecting the work type,
  and the full flow from form to Telegram, confirmation and the database
- **Production** (`check:prod`, `test:prod`): pages, `/api/health`, webhook status, live form flow

## Deployment

Deployed on **Vercel**; every push to `main` goes to production.

1. Add the five variables above in Vercel → Project → Settings → Environment Variables.
2. In MongoDB Atlas → Network Access, allow Vercel's outbound IPs and use a strong database password.
3. Point the bot at the site: `npm run tg:webhook -- https://your-domain`.
4. Run `npm run check:prod` to confirm everything is connected.

Share the production domain: per-deployment `*.vercel.app` URLs are behind Vercel Authentication.

## Project structure

```
src/
  app/          routes: [lang]/ pages (home, progetti), api/telegram (webhook), api/health, actions.ts (form)
  components/   page sections (Hero, Services, Process, Contact, ...) and the contact form
  lib/          leads (schema), mongodb (client), telegram (messages + Bot API), site details (NAP), seo (JSON-LD)
  content/      portfolio projects, before/after pairs, reviews, Google rating
  i18n/         Italian and English texts
tests/          Vitest unit and integration tests
e2e/            Playwright tests and the local test server
scripts/        dev database, lead listing, webhook setup, production checks, image optimization
```
