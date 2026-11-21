"use client";

import { useEffect } from "react";

/**
 * Fades in every `.reveal` element and animates every `[data-count-to]`
 * number when it scrolls into view. Rendered once per page.
 */
export function ScrollEffects() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animateCount = (el: HTMLElement) => {
      const to = Number(el.dataset.countTo);
      if (reduce || !to) return;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / 1400, 1);
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("is-in");
          if (el.dataset.countTo) animateCount(el);
          el.querySelectorAll<HTMLElement>("[data-count-to]").forEach(animateCount);
          io.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    // Elements already on screen stay visible (no flash); only the ones
    // below the fold get hidden and animate in when scrolled to.
    const reveals = document.querySelectorAll<HTMLElement>(".reveal");
    reveals.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
    });
    if (!reduce) document.documentElement.classList.add("reveal-on");

    document
      .querySelectorAll(".reveal:not(.is-in), [data-count-to]:not(.reveal [data-count-to])")
      .forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      document.documentElement.classList.remove("reveal-on");
    };
  }, []);

  return null;
}
