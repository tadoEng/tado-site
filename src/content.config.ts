// src/content.config.ts
// Astro v5 Content Layer API — replaces legacy src/content/config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// ── Writing (blog posts) ─────────────────────────────────────────────────────
const writing = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/writing" }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    lane: z.enum(["structural", "dev", "essay", "note"]),
    tags:        z.array(z.string()).default([]),
    readingTime: z.number().optional(),   // minutes; computed via remark plugin or frontmatter
    draft:       z.boolean().default(false),
    heroImage:   z.string().optional(),   // relative path or URL
  }),
});

// ── Projects ─────────────────────────────────────────────────────────────────
const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    tags:        z.array(z.string()).default([]),
    status:      z.enum(["active", "completed", "archived"]).default("completed"),
    repo:        z.string().url().optional(),
    demo:        z.string().url().optional(),
    draft:       z.boolean().default(false),
  }),
});

export const collections = { writing, projects };