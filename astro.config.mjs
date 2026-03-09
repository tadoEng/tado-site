// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  site: "https://tado-site.pages.dev",
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    },
    imageService: "cloudflare"
  }),
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      wrap: true,
    },
  },
});