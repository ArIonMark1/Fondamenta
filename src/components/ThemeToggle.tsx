"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { initTheme, THEME_KEY, type Theme } from "@/lib/theme";
import { MoonIcon, SunIcon } from "./icons";

const root = () => document.documentElement;

// The source of truth is the data-theme attribute on <html> (set before paint
// by the inline script in layout.tsx). React only observes it.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const getSnapshot = () => root().getAttribute("data-theme") === "dark";
const getServerSnapshot = () => false;

/** Switches the theme with all CSS transitions off, so every element changes in the same frame. */
function applyTheme(theme: Theme) {
  const el = root();
  el.classList.add("theme-switching");
  el.setAttribute("data-theme", theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
  // Force a style recalc so the new colors land while transitions are still off.
  void getComputedStyle(el).color;
  requestAnimationFrame(() => el.classList.remove("theme-switching"));
}

export function ThemeToggle({ label }: { label: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // In development, Strict Mode's remount resets <html> to its JSX attributes
  // and drops data-theme. Put it back before paint. Stripped from production.
  useLayoutEffect(() => {
    if (process.env.NODE_ENV !== "production" && !root().hasAttribute("data-theme")) initTheme(THEME_KEY);
  }, []);

  function toggle() {
    // Read the theme when the update actually runs, not at click time, so
    // rapid clicks each flip it (a pending update may not have applied yet).
    const flip = () => applyTheme(getSnapshot() ? "light" : "dark");
    // Cross-fade the whole page as one snapshot where supported, else switch
    // instantly. Reduced motion is handled in globals.css (animation: none).
    if (document.startViewTransition) {
      // A newer click skips this animation (its update still runs); that
      // rejects `ready`, which is expected and harmless.
      document.startViewTransition(flip).ready.catch(() => {});
    } else {
      flip();
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      className="grid size-[30px] cursor-pointer place-items-center border border-line text-muted transition-colors hover:text-brand"
    >
      {/* Icons swap via CSS, so server and client markup are identical */}
      <MoonIcon className="size-4 dark:hidden" />
      <SunIcon className="hidden size-4 dark:block" />
    </button>
  );
}
