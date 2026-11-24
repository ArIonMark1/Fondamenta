import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ArrowIcon, StarIcon, TagIcon } from "./icons";

/** Five stars; the first `round(rating)` are filled. `label` is read out instead of the icons. */
export function Stars({ rating, label, className = "" }: { rating: number; label: string; className?: string }) {
  const filled = Math.round(rating);
  return (
    <span role="img" aria-label={label} className={`inline-flex gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`size-[1em] ${n <= filled ? "text-brand" : "text-line"}`} />
      ))}
    </span>
  );
}

/** "Esempio" badge on placeholder content (never visible on the live site). */
export function DemoBadge({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span className={`bg-navy-deep/85 px-2 py-1 font-head text-[10px] font-bold tracking-[0.12em] text-white uppercase ${className}`}>
      {label}
    </span>
  );
}

/** Renders "\n" in dictionary strings as <br />. */
export function Lines({ text }: { text: string }) {
  const parts = text.split("\n");
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`tag ${className}`}>
      <TagIcon />
      <span>{children}</span>
    </p>
  );
}

const boxVariants = {
  light: "border-white/70 text-white hover:border-brand hover:bg-brand",
  orange: "border-brand bg-brand text-white hover:border-brand-dark hover:bg-brand-dark [&>i]:border-white/45",
};

export function BoxButton({
  href,
  children,
  variant = "light",
  className = "",
  type,
  disabled,
}: {
  href?: string;
  children: ReactNode;
  variant?: keyof typeof boxVariants;
  className?: string;
  type?: "submit" | "button";
  disabled?: boolean;
}) {
  const cls = `btn-box ${boxVariants[variant]} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <i>
        <ArrowIcon />
      </i>
    </>
  );
  // Other pages of the site: client-side navigation with prefetch. Anchors stay plain links.
  if (href?.startsWith("/")) return <Link href={href} className={cls}>{inner}</Link>;
  if (href) return <a href={href} className={cls}>{inner}</a>;
  return (
    <button type={type ?? "button"} className={`${cls} cursor-pointer disabled:cursor-wait disabled:opacity-70`} disabled={disabled}>
      {inner}
    </button>
  );
}
