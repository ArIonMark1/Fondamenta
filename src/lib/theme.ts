/** localStorage key shared by the inline theme script (layout) and <ThemeToggle />. */
export const THEME_KEY = "theme";

export type Theme = "light" | "dark";

/**
 * Sets data-theme on <html>: the saved choice, else the OS setting.
 * layout.tsx also serializes this function into the inline <head> script,
 * so it must stay self-contained: use only its parameter and browser globals.
 */
export function initTheme(key: string) {
  try {
    let theme = localStorage.getItem(key);
    if (theme !== "dark" && theme !== "light") {
      theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", theme);
  } catch {}
}
