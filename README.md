# Brooke Hatton's Blog - Astro Version

This is an Astro version of Brooke Hatton's personal blog, converted from Jekyll.

## 🚀 Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:4321](http://localhost:4321) in your browser.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Installs dependencies                        |
| `npm run dev`     | Starts local dev server at `localhost:4321`  |
| `npm run build`   | Build your production site to `./dist/`      |
| `npm run preview` | Preview your build locally, before deploying |

## 📁 Project Structure

```
/
├── public/
│   ├── images/
│   ├── stylesheets/
│   └── ...
├── src/
│   ├── components/
│   │   ├── Footer.astro
│   │   ├── Navigation.astro
│   │   └── PostList.astro
│   ├── content/
│   │   ├── blog/
│   │   └── config.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── pages/
│       ├── blog/
│       │   ├── [...slug].astro
│       │   └── feed.xml.js
│       ├── blog.astro
│       └── index.astro
└── package.json
```

## 🎯 Features

- ✅ Static site generation
- ✅ Blog posts with markdown support
- ✅ RSS feed
- ✅ Responsive design
- ✅ SEO friendly
- ✅ Fast performance

## 📝 Adding New Posts

Add new blog posts as markdown files in `src/content/blog/`. Each post should have frontmatter with:

```yaml
---
title: "Your Post Title"
date: 2024-01-01
categories: ["Category"]
description: "Optional description"
---
```

## 🚀 Deployment

The site can be deployed to any static hosting service. For GitHub Pages:

1. Build the site: `npm run build`
2. Deploy the `dist/` folder

Built with [Astro](https://astro.build) 🚀
