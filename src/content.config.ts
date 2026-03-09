// src/content.config.ts
// ─────────────────────────────────────────────────────────────
// Astro v5 Content Layer API.
// Note: file lives at src/content.config.ts (NOT src/content/config.ts)
// Uses glob() loader — the v5 way.
// ─────────────────────────────────────────────────────────────
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// ── Writing (blog posts) ──────────────────────────────────────
const writing = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/writing",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),

    // z.coerce.date() accepts both Date objects and ISO strings in frontmatter
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),

    // Content lane — drives tag colour and filter tabs
    lane: z.enum(["structural", "dev", "tool", "workflow"]),

    tags: z.array(z.string()).default([]),

    // true = shows in homepage featured slot (only one should be true at a time)
    featured: z.boolean().default(false),

    // true = excluded from all listings and RSS
    draft: z.boolean().default(false),

    // Optional cover image path (relative to the MDX file)
    coverImage: z.string().optional(),

    // Override auto-calculated read time (minutes)
    readingTime: z.number().optional(),
  }),
});

// ── Projects ──────────────────────────────────────────────────
const projects = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/projects",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    stack: z.array(z.string()),
    status: z.enum(["live", "wip", "archived"]),
    liveUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    // Controls display order on projects page (lower = first)
    order: z.number(),
  }),
});

export const collections = { writing, projects };
