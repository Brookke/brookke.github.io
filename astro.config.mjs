import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://brookehatton.com",
  integrations: [mdx(), react()],
  markdown: {
    shikiConfig: {
      theme: "catppuccin-mocha",
      wrap: false,
    },
  },
  redirects: {
    "/blog/engineering/graphql-fragments": {
      status: 302,
      destination: "/blog/engineering/graphql-fragments-why-are-they-useful",
    },
  },
});
