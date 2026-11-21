import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

export const ArrowIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" aria-hidden {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const SunIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" aria-hidden {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const MoonIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
  </svg>
);

export const TagIcon = (p: P) => (
  <svg viewBox="0 0 12 14" fill="currentColor" aria-hidden width={12} height={14} {...p}>
    <path d="M1 0h7L5 6H1z" />
    <path d="M7 8h4v6H4z" />
  </svg>
);

/** The company mark from logo.svg, as an inline shape that inherits `fill`. */
export const LogoMark = (p: P) => (
  <svg viewBox="150 190 700 560" aria-hidden {...p}>
    <path d="M205 690V438h112v252h-38V476h-36v214h-38Z" />
    <path d="M352 690V320h296v370h-42V362H394v328h-42Z" />
    <path d="M683 690V438h112v252h-38V476h-36v214h-38Z" />
    <path d="M243 510h36v18h-36zm0 58h36v18h-36zm0 58h36v18h-36z" />
    <path d="M394 408h212v18H394zm0 58h212v18H394zm0 58h212v18H394zm0 58h212v18H394z" />
    <path d="M721 510h36v18h-36zm0 58h36v18h-36zm0 58h36v18h-36z" />
    <path d="M479 690V206h42v484h-42Z" />
    <path d="M256 206h488v26H256z" />
    <path d="M256 206v65h26v-39h197v-26H256Z" />
    <path d="m479 232 21-26 21 26h-42Z" />
    <path d="M696 232h26v104h-26z" />
    <path d="M686 336h46v16h-46z" />
    <path d="M700 352h18v22c0 16-9 25-24 25v-17c5 0 6-3 6-9v-21Z" />
    <path d="M165 690h670v40H165z" />
  </svg>
);

export const FacebookIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z" />
  </svg>
);

export const InstagramIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
  </svg>
);

export const LinkedinIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z" />
  </svg>
);

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinejoin: "round" } as const;

export const serviceIcons = [
  (p: P) => (
    <svg viewBox="0 0 32 32" {...line} aria-hidden {...p}>
      <path d="M4 15 16 5l12 10M7 13v14h18V13M13 27v-8h6v8" />
    </svg>
  ),
  (p: P) => (
    <svg viewBox="0 0 32 32" {...line} aria-hidden {...p}>
      <path d="M6 26 18 14M15 8l4-4 9 9-4 4zM15 8l-2 2 9 9 2-2M4 28l3-3" />
    </svg>
  ),
  (p: P) => (
    <svg viewBox="0 0 32 32" {...line} aria-hidden {...p}>
      <path d="M2 17 16 6l14 11M6 14v13h20V14M10 17l6-5 6 5M22 9V5h3v6.5" />
    </svg>
  ),
  (p: P) => (
    <svg viewBox="0 0 32 32" {...line} aria-hidden {...p}>
      <path d="M4 28V4h24v24zM4 10h24M4 16h24M4 22h24M12 4v6M20 10v6M12 16v6M20 22v6" />
    </svg>
  ),
];
