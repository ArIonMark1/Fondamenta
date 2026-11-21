"use client";

/**
 * A <script> that runs once, during HTML parsing, on hard loads.
 * On the client React would warn about rendering a <script>, so it is typed
 * text/plain there (inert); suppressHydrationWarning covers the type mismatch.
 * Pattern from next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md.
 * "use client" so it also renders in the browser when used from a Server Component.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
