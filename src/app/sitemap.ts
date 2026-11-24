import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { getProjects } from "@/content/showcase";
import { siteUrl } from "@/lib/seo";

/** /sitemap.xml — every page in both languages, linked to each other via hreflang. */
export default function sitemap(): MetadataRoute.Sitemap {
  // /progetti only exists once there is at least one project (it 404s otherwise).
  const paths = getProjects().length > 0 ? ["", "/progetti"] : [""];

  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${siteUrl}/${lang}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])),
      },
    })),
  );
}
