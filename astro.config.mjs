import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://brookehatton.com",
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
