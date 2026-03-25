import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// ── Writing (blog posts) ──────────────────────────────────────
const writing = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/writing" }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    lane: z.enum(["structural", "dev", "tool", "workflow"]),
    tags:        z.array(z.string()).default([]),
    featured:    z.boolean().default(false),
    draft:       z.boolean().default(false),
    readingTime: z.number().optional(),
    cardImage:   z.string().optional(),
    ogImage:     z.string().optional(),
  }),
});

// ── Projects ──────────────────────────────────────────────────
const projects = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    stack:       z.array(z.string()).default([]),
    status:      z.enum(["live", "wip", "archived"]).default("wip"),
    order:       z.number().default(99),
    liveUrl:     z.string().url().optional(),
    githubUrl:   z.string().url().optional(),
  }),
});

export const collections = { writing, projects };