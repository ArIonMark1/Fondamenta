import type { ReactNode } from "react";
import type { Dictionary, Locale } from "@/i18n";
import { site } from "@/lib/site";
import { ClockIcon, FacebookIcon, InstagramIcon, LinkedinIcon, MailIcon, PhoneIcon, PinIcon } from "./icons";
import { LocationMap } from "./LocationMap";

// Cached so the page can still be prerendered (Cache Components).
async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

type Props = { t: Dictionary; lang: Locale; hasProjects: boolean };

/** Contact line: brand-coloured icon + text. */
function ContactRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex-none text-brand [&>svg]:size-[18px]">{icon}</span>
      <span className="font-head text-[14px] leading-snug font-medium text-ink">{children}</span>
    </li>
  );
}

export function Footer({ t, lang, hasProjects }: Props) {
  const { nav, footer } = t;
  const home = `/${lang}`;
  const links = [
    { href: `${home}#top`, label: nav.home },
    { href: `${home}#chi-siamo`, label: nav.about },
    { href: `${home}#servizi`, label: nav.services },
    ...(hasProjects ? [{ href: `${home}/progetti`, label: nav.projects }] : []),
    { href: `${home}#metodo`, label: nav.process },
    { href: `${home}#contatti`, label: nav.contacts },
  ];
  const icons = [
    { href: site.socials.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: site.socials.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { href: `mailto:${site.email}`, label: site.email, Icon: MailIcon },
  ];

  return (
    // Same look as the "Recensioni" section: mist band + surface cards, both themes
    // (tokens swap under [data-theme=dark]).
    <footer className="bg-mist text-muted">

      <div className="container-x grid gap-11 py-16 lg:grid-cols-[1.45fr_0.7fr_1.15fr] lg:gap-12 lg:py-[100px]">
        {/* Wordmark */}
        <div className="flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-start justify-between gap-4 text-[11px] leading-snug text-muted">
              <p>
                © <CurrentYear /> {site.legalName}
                <br />
                {footer.rights}
              </p>
              <p className="font-head font-bold tracking-[0.18em] text-brand uppercase">{footer.tagline}</p>
            </div>
            <a
              href={`${home}#top`}
              aria-label={site.name}
              className="mt-3 block font-head text-[11.5vw] leading-[0.9] font-bold tracking-[-0.045em] text-ink sm:text-[64px] lg:text-[clamp(48px,4.4vw,66px)]"
            >
              {site.shortName}
              <span className="text-brand">.</span>
            </a>
          </div>
          <p className="text-[11px] tracking-[0.08em] text-muted uppercase">P.IVA {site.vat}</p>
        </div>

        {/* Links + icons */}
        <div>
          <nav aria-label={footer.links}>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3.5 lg:grid-cols-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="font-head text-[13px] font-bold tracking-[0.06em] text-ink uppercase transition-colors hover:text-brand"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-7 flex gap-2" role="group" aria-label={footer.social}>
            {icons.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid size-10 place-items-center bg-surface text-ink shadow-[0_6px_30px_var(--color-shadow)] transition-colors hover:bg-brand hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Contacts + map — name, address and phone (NAP) identical to the structured data. */}
        <div>
          <address className="not-italic">
            <ul className="grid gap-3.5">
              <ContactRow icon={<PhoneIcon />}>
                <a href={site.phoneHref} className="text-[16px] hover:text-brand">{site.phone}</a>
              </ContactRow>
              <ContactRow icon={<PinIcon />}>
                <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand">{site.addressLine}</a>
              </ContactRow>
              <ContactRow icon={<ClockIcon />}>
                <span className="sr-only">{footer.hoursLabel}: </span>
                {t.top.hours}
              </ContactRow>
            </ul>
          </address>
          <div className="mt-6">
            <LocationMap t={t.contact} lang={lang} />
          </div>
        </div>
      </div>
    </footer>
  );
}
