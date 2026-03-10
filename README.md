# Tado Site

Personal site for Thanh Tu Do built with Astro, MDX, React islands, and Cloudflare Pages.

## What this repo contains

- Engineering writing (`/writing`) with lane filters and article TOC
- Project pages (`/projects`) powered by Astro content collections
- Tools pages (`/tools`) for structural engineering utilities
- A custom animated hero visual (React island + canvas)

## Tech stack

- Astro 5 + MDX
- React 19 (islands)
- Tailwind CSS 4 + Starwind UI components
- Cloudflare Pages adapter (`@astrojs/cloudflare`)
- Wrangler for deploy and Pages local preview

## Local development

Requirements:

- Node.js 20+
- pnpm 9+

Install and run:

```bash
pnpm install
pnpm dev
```

Build and preview:

```bash
pnpm build
pnpm preview
```

## Scripts

- `pnpm dev` - Start Astro dev server
- `pnpm build` - Production build
- `pnpm preview` - Build + run Pages preview via Wrangler
- `pnpm deploy` - Build + deploy to Cloudflare Pages (Wrangler)
- `pnpm cf-typegen` - Generate Wrangler/CF types

## Content workflow

Content is managed in `src/content`:

- `src/content/writing/*.mdx`
- `src/content/projects/*.mdx`

Collection schemas are defined in [`src/content/config.ts`](src/content/config.ts).

### Writing frontmatter

```yaml
title: "Post title"
description: "Short summary"
publishDate: 2026-01-01
lane: "structural" # structural | dev | tool | workflow
tags: ["fem", "astro"]
featured: false
draft: false
readingTime: 12
ogImage: "/og/some-image.png"
```

### Project frontmatter

```yaml
title: "Project title"
description: "What it does"
stack: ["C#", "ETABS"]
status: "live" # live | wip | archived
order: 1
liveUrl: "https://example.com"
githubUrl: "https://github.com/user/repo"
```

## Deployment (Cloudflare Pages)

This repo is already configured for Cloudflare Pages:

- Astro adapter: `@astrojs/cloudflare`
- Pages output: `dist`
- Wrangler config: [`wrangler.jsonc`](wrangler.jsonc)

You can deploy in two ways:

1. Git integration in Cloudflare dashboard (auto deploy on push)
2. Direct upload with Wrangler (`pnpm deploy`)

## Repo visibility: public vs private

Short answer: yes, you can host on Cloudflare Pages from a private repo.

- Cloudflare Pages Git integration supports both private and public GitHub/GitLab repositories.
- Keeping the repository private does **not** make the deployed website private by default.
- If you want a private/internal site, add access control (Cloudflare Access) for the deployed domain.

Practical recommendation:

1. Make the repo **public** if you want portfolio visibility and open-source collaboration.
2. Keep it **private** if you want to iterate privately; publish later when content/code is ready.

## Notes

- Do not commit secrets.
- Use Cloudflare dashboard / Wrangler secrets for sensitive values.
