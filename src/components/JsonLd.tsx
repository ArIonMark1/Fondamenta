import { jsonLdHtml } from "@/lib/seo";

/** Structured data for search engines (server-rendered, not executed). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }} />;
}
