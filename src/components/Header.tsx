"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary, Locale } from "@/i18n";
import { locales } from "@/i18n";
import { site } from "@/lib/site";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

type Props = { lang: Locale; nav: Dictionary["nav"]; hours: string; quote: string; hasProjects: boolean };

export function Header({ lang, nav, hours, quote, hasProjects }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // "/it#servizi" scrolls on the homepage and navigates there from other pages.
  const home = `/${lang}`;
  const links = [
    { href: `${home}#top`, label: nav.home },
    { href: `${home}#chi-siamo`, label: nav.about },
    { href: `${home}#servizi`, label: nav.services },
    ...(hasProjects ? [{ href: `${home}/progetti`, label: nav.projects }] : []),
    { href: `${home}#metodo`, label: nav.process },
    { href: `${home}#contatti`, label: nav.contacts },
  ];

  return (
    <header
      className={`sticky top-0 z-50 flex h-(--header-h) bg-surface transition-shadow duration-300 ${
        scrolled ? "shadow-[0_6px_30px_var(--color-shadow)]" : ""
      }`}
    >
      <a
        href={`${home}#top`}
        aria-label={site.name}
        className="flex flex-none items-center justify-center gap-3 bg-brand px-4 text-white lg:w-[210px] xl:w-[260px]"
      >
        <Image src="/logo.svg" alt="" width={46} height={46} className="size-9 lg:size-[46px]" loading="eager" />
        <span className="flex flex-col font-head text-base leading-none font-bold tracking-[0.02em] lg:text-[19px]">
          {site.shortName}
          <small className="mt-1.5 hidden text-[11px] font-medium tracking-[0.18em] uppercase opacity-85 sm:block">
            Costruzioni
          </small>
        </span>
      </a>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (desktop only) */}
        <div className="hidden h-10 items-center justify-between border-b border-line px-8 font-head text-[12.5px] font-semibold lg:flex">
          <div className="flex gap-4">
            <a href={site.socials.facebook} aria-label="Facebook" className="hover:text-brand"><FacebookIcon className="size-[15px]" /></a>
            <a href={site.socials.instagram} aria-label="Instagram" className="hover:text-brand"><InstagramIcon className="size-[15px]" /></a>
            <a href={site.socials.linkedin} aria-label="LinkedIn" className="hover:text-brand"><LinkedinIcon className="size-[15px]" /></a>
          </div>
          <div className="flex gap-7">
            <a href={site.phoneHref} className="hover:text-brand">{site.phone}</a>
            <span>{hours}</span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end px-4 lg:justify-between lg:px-8">
          <nav
            aria-label="Main"
            className={`fixed inset-x-0 top-(--header-h) flex flex-col border-t border-line bg-surface shadow-[0_20px_30px_var(--color-shadow)] transition-[opacity,translate,visibility] duration-200 lg:static lg:flex-row lg:gap-6 lg:border-0 lg:shadow-none xl:gap-8 ${
              open ? "visible opacity-100" : "invisible -translate-y-2 opacity-0 lg:visible lg:translate-y-0 lg:opacity-100"
            }`}
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="group relative border-b border-line px-5 py-[18px] font-head text-[15px] font-bold tracking-[0.04em] uppercase lg:border-0 lg:px-0 lg:py-1.5 lg:text-[13px]"
              >
                {l.label}
                <span className="absolute inset-x-0 bottom-0 hidden h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100 lg:block" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle label={nav.theme} />
            <div className="flex border border-line" role="group" aria-label="Language">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={pathname.replace(/^\/[^/]+/, `/${l}`) /* same page, other language */}
                  hrefLang={l}
                  aria-current={l === lang ? "true" : undefined}
                  className={`px-2.5 py-1.5 font-head text-xs font-bold uppercase ${
                    l === lang ? "bg-navy text-white dark:bg-ink dark:text-surface" :"text-muted hover:text-ink"
                  }`}
                >
                  {l}
                </Link>
              ))}
            </div>
            <a
              href="#contatti"
              className="hidden bg-brand px-[18px] py-[11px] font-head text-[13px] font-bold tracking-[0.04em] text-white uppercase transition-colors hover:bg-brand-dark lg:inline-flex"
            >
              {quote}
            </a>
            <button
              type="button"
              aria-label={nav.menu}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="relative size-11 cursor-pointer bg-navy lg:hidden"
            >
              <span className={`absolute inset-x-3 h-0.5 bg-white transition-all duration-300 ${open ? "top-[21px] rotate-45" : "top-[17px]"}`} />
              <span className={`absolute inset-x-3 h-0.5 bg-white transition-all duration-300 ${open ? "top-[21px] -rotate-45" : "top-[25px]"}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
