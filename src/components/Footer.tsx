import Image from "next/image";
import type { Dictionary } from "@/i18n";
import { site } from "@/lib/site";

// Cached so the page can still be prerendered (Cache Components).
async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

export function Footer({ nav }: { nav: Dictionary["nav"] }) {
  const links = [
    { href: "#chi-siamo", label: nav.about },
    { href: "#servizi", label: nav.services },
    { href: "#metodo", label: nav.process },
    { href: "#contatti", label: nav.contacts },
  ];
  return (
    <footer className="bg-navy-deep py-[34px] text-[13px] text-white/70">
      <div className="container-x flex flex-col items-start justify-between gap-6 md:flex-row md:flex-wrap md:items-center">
        <a href="#top" className="flex items-center gap-2.5 font-head font-bold tracking-[0.03em] text-white">
          <Image src="/logo.svg" alt="" width={34} height={34} className="bg-brand p-[5px]" />
          {site.shortName}
        </a>
        <nav className="flex flex-wrap gap-x-6 gap-y-3.5 font-head font-medium">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-brand">{l.label}</a>
          ))}
        </nav>
        <p>
          © <CurrentYear /> {site.legalName} · P.IVA {site.vat} · {site.city}
        </p>
      </div>
    </footer>
  );
}
