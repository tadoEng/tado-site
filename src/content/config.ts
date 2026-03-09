// src/content/config.ts
// ─────────────────────────────────────────────────────────────
// Defines the two content collections: "writing" and "projects".
// All optional fields are marked with .optional() so Astro never
// silently drops entries whose frontmatter omits those fields.
// ─────────────────────────────────────────────────────────────
import { defineCollection, z } from "astro:content";

// ── Writing (blog posts) ──────────────────────────────────────
const writing = defineCollection({
  type: "content",
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),

    // "structural" | "dev" | "tool" | "workflow"
    lane: z.enum(["structural", "dev", "tool", "workflow"]),

    tags:        z.array(z.string()).default([]),
    featured:    z.boolean().default(false),
    draft:       z.boolean().default(false),
    readingTime: z.number().optional(),  // minutes — fill in manually or via remark plugin

    // Optional hero / OG image override
    ogImage: z.string().optional(),
  }),
});

// ── Projects ──────────────────────────────────────────────────
const projects = defineCollection({
  type: "content",
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    stack:       z.array(z.string()).default([]),
    status:      z.enum(["live", "wip", "archived"]).default("wip"),

    // Controls display order on /projects index — lower = first
    order: z.number().default(99),

    // Both URLs are optional — a project may have one, both, or neither
    liveUrl:   z.string().url().optional(),
    githubUrl: z.string().url().optional(),
  }),
});

export const collections = { writing, projects };