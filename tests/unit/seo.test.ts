import { describe, expect, it } from "vitest";
import { getDictionary } from "@/i18n";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, getSiteUrl, jsonLdHtml, localBusinessJsonLd, pageAlternates } from "@/lib/seo";

describe("getSiteUrl", () => {
  it("uses the production domain Vercel provides", () => {
    expect(getSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "fondamenta.it" })).toBe("https://fondamenta.it");
    expect(getSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "https://fondamenta.it/" })).toBe("https://fondamenta.it");
  });

  it("falls back to the current live URL", () => {
    expect(getSiteUrl({})).toBe("https://fondamenta-ashen.vercel.app");
  });
});

describe("pageAlternates", () => {
  it("sets canonical and hreflang for every language plus x-default", () => {
    expect(pageAlternates("en", "/progetti")).toEqual({
      canonical: "/en/progetti",
      languages: { it: "/it/progetti", en: "/en/progetti", "x-default": "/it/progetti" },
    });
  });
});

describe("localBusinessJsonLd", () => {
  const ld = localBusinessJsonLd("it", getDictionary("it"));

  it("is a GeneralContractor with the office address in Porcia", () => {
    expect(ld["@type"]).toBe("GeneralContractor");
    expect(ld.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Via Pistola, 10",
      postalCode: "33080",
      addressLocality: "Porcia",
      addressRegion: "PN",
      addressCountry: "IT",
    });
  });

  it("uses the same name and phone as the page (NAP consistency)", () => {
    expect(ld.name).toBe(site.name);
    expect(`tel:${ld.telephone}`).toBe(site.phoneHref);
  });

  it("is open Monday to Saturday, 7:30–18:30", () => {
    expect(ld.openingHoursSpecification[0]).toMatchObject({
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "07:30",
      closes: "18:30",
    });
  });

  it("serves Porcia, Pordenone and the province", () => {
    const names = ld.areaServed.map((a) => a.name);
    expect(names).toEqual(expect.arrayContaining(["Porcia", "Pordenone", "Provincia di Pordenone"]));
  });

  it("only lists real social profiles", () => {
    for (const url of ld.sameAs ?? []) expect(url).toMatch(/^https?:\/\//);
  });

  it("links to the map of the office", () => {
    expect(ld.hasMap).toContain(encodeURIComponent("Via Pistola, 10, 33080 Porcia PN"));
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers items and uses absolute URLs", () => {
    const ld = breadcrumbJsonLd("en", [
      { name: "Home", path: "" },
      { name: "Projects", path: "/progetti" },
    ]);
    expect(ld.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(ld.itemListElement[1].item).toMatch(/^https:\/\/.+\/en\/progetti$/);
  });
});

describe("jsonLdHtml", () => {
  it("escapes < so text can never close the script tag", () => {
    const html = jsonLdHtml({ name: "</script><script>alert(1)</script>" });
    expect(html).not.toContain("<");
    expect(JSON.parse(html).name).toBe("</script><script>alert(1)</script>");
  });
});
