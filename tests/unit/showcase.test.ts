import { describe, expect, it } from "vitest";
import { workTypes } from "@/lib/leads";
import {
  __content,
  FEATURED_LIMIT,
  getBeforeAfter,
  getFeaturedProjects,
  getGoogleRating,
  getProjects,
  getReviews,
  portfolioCategories,
  shouldShowDemo,
  withoutDemo,
} from "@/content/showcase";

describe("shouldShowDemo", () => {
  it("shows demo content in development and tests", () => {
    expect(shouldShowDemo({ NODE_ENV: "development" })).toBe(true);
    expect(shouldShowDemo({ NODE_ENV: "test" })).toBe(true);
  });

  it("hides demo content in a production build (the live site)", () => {
    expect(shouldShowDemo({ NODE_ENV: "production" })).toBe(false);
    expect(shouldShowDemo({ NODE_ENV: "production", SHOW_DEMO_CONTENT: "0" })).toBe(false);
  });

  it("shows it in a production build only when explicitly enabled (E2E)", () => {
    expect(shouldShowDemo({ NODE_ENV: "production", SHOW_DEMO_CONTENT: "1" })).toBe(true);
  });
});

describe("withoutDemo", () => {
  const items = [{ id: "real" }, { id: "fake", demo: true as const }];

  it("drops demo entries when demo content is off", () => {
    expect(withoutDemo(items, false).map((i) => i.id)).toEqual(["real"]);
  });

  it("keeps everything when demo content is on", () => {
    expect(withoutDemo(items, true)).toHaveLength(2);
  });
});

describe("live site never shows demo content", () => {
  it.each([
    ["projects", getProjects(false)],
    ["featured projects", getFeaturedProjects(false)],
    ["before/after pairs", getBeforeAfter(false)],
    ["reviews", getReviews(false)],
  ])("%s contain no demo entries", (_, items) => {
    expect(items.filter((i) => i.demo)).toEqual([]);
  });

  it("Google rating is hidden while it is a placeholder", () => {
    const rating = getGoogleRating(false);
    expect(rating === null || !rating.demo).toBe(true);
  });
});

describe("homepage teaser", () => {
  it(`shows at most ${FEATURED_LIMIT} projects, featured ones first`, () => {
    const featured = getFeaturedProjects(true);
    expect(featured.length).toBeLessThanOrEqual(FEATURED_LIMIT);
    const firstNotFeatured = featured.findIndex((p) => !p.featured);
    if (firstNotFeatured !== -1) expect(featured.slice(firstNotFeatured).every((p) => !p.featured)).toBe(true);
  });
});

describe("content is consistent", () => {
  const { projects, beforeAfter, reviews, googleRating } = __content;

  it("every portfolio category is a quote-form work type", () => {
    for (const c of portfolioCategories) expect(workTypes).toContain(c);
  });

  it("ids are unique", () => {
    for (const list of [projects, beforeAfter, reviews]) {
      const ids = list.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("projects have a category, both languages and a sensible year", () => {
    for (const p of projects) {
      expect(portfolioCategories).toContain(p.category);
      for (const text of [p.title, p.summary]) {
        expect(text.it.trim(), p.id).not.toBe("");
        expect(text.en.trim(), p.id).not.toBe("");
      }
      expect(p.year).toBeGreaterThan(1990);
    }
  });

  it("before/after pairs have titles in both languages", () => {
    for (const p of beforeAfter) {
      expect(p.title.it.trim()).not.toBe("");
      expect(p.title.en.trim()).not.toBe("");
    }
  });

  it("reviews have a valid date and point at an existing project", () => {
    for (const r of reviews) {
      expect(r.date, r.id).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      expect(r.text.trim()).not.toBe("");
      if (r.projectId) {
        const project = projects.find((p) => p.id === r.projectId);
        expect(project, `${r.id} → ${r.projectId}`).toBeDefined();
        // A real review must not be illustrated by a placeholder project.
        if (!r.demo) expect(project?.demo, `${r.id} → ${r.projectId}`).toBeUndefined();
      }
    }
  });

  it("Google rating is between 1 and 5", () => {
    if (googleRating) {
      expect(googleRating.rating).toBeGreaterThanOrEqual(1);
      expect(googleRating.rating).toBeLessThanOrEqual(5);
      expect(googleRating.url).toMatch(/^https:\/\//);
    }
  });
});
