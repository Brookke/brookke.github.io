import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getJekyllUrl } from "../utils/jekyll-urls";

export const GET: APIRoute = async (context) => {
  const posts = await getCollection("blog");
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );

  return rss({
    title: "Brooke Hatton's Blog",
    description:
      "Full Stack Developer writing about engineering, life, and technology.",
    site: context.site ?? "https://brookehatton.com",
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.description,
      link: getJekyllUrl(post.data.title, post.data.categories),
    })),
    customData: "<language>en-GB</language>",
  });
};
