import { Fragment, type ReactNode } from "react";
import { ArrowIcon, TagIcon } from "./icons";

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
  if (href) return <a href={href} className={cls}>{inner}</a>;
  return (
    <button type={type ?? "button"} className={`${cls} cursor-pointer disabled:cursor-wait disabled:opacity-70`} disabled={disabled}>
      {inner}
    </button>
  );
}
