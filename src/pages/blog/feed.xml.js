import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getJekyllUrl } from "../../utils/jekyll-urls";

export async function GET(context) {
  const posts = await getCollection("blog");
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );

  return rss({
    title: "Brooke Hatton",
    description:
      "Brooke Hatton, Full Stack Developer. 1st Class Honours, BEng Computer Science, University Of York.",
    site: context.site,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description || "",
      link: getJekyllUrl(post.data.title, post.data.categories),
      categories: post.data.categories || [],
    })),
  });
}
