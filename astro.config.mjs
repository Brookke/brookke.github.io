import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://brookehatton.com",
  markdown: {
    shikiConfig: {
      theme: "catppuccin-mocha",
      wrap: false,
    },
  },
});
