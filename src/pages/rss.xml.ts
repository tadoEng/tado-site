// src/pages/rss.xml.ts
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getCollection("writing", (p) => !p.data.draft);
  const sorted = posts.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  );

  return rss({
    title: "tado — Writing",
    description:
      "Computational structural engineering, finite element methods, and the tools I build.",
    site: context.site!,
    items: sorted.map((post) => ({
      title:       post.data.title,
      pubDate:     post.data.publishDate,
      description: post.data.description,
      // Use slug (no extension) for clean URLs in the feed
      link:        `/writing/${post.slug}/`,
      categories:  post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}